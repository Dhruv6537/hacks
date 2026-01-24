import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Zap } from 'lucide-react';
import { campaignStore } from '../store/campaigns';
import { ethers } from 'ethers';

// Contract address deployed on Monad testnet
const CONTRACT_ADDRESS = '0x11C88CdD5DcF83913cEe5d4a933d633a415E2437';

// ABI for createCampaign function
const CONTRACT_ABI = [
    'function createCampaign(string _title, string _description, uint256 _fundingGoal, string[] _milestoneDescriptions, uint256[] _milestoneAllocations) external returns (uint256)',
    'event CampaignCreated(uint256 indexed campaignId, address indexed creator, string title, uint256 fundingGoal, uint256 milestoneCount)'
];

interface Milestone {
    description: string;
    allocation: number;
}

export default function CreateCampaign() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [fundingGoal, setFundingGoal] = useState('');
    const [milestones, setMilestones] = useState<Milestone[]>([
        { description: '', allocation: 50 },
        { description: '', allocation: 50 },
    ]);

    const totalAllocation = milestones.reduce((sum, m) => sum + m.allocation, 0);

    const addMilestone = () => {
        setMilestones([...milestones, { description: '', allocation: 0 }]);
    };

    const removeMilestone = (index: number) => {
        if (milestones.length > 1) {
            setMilestones(milestones.filter((_, i) => i !== index));
        }
    };

    const updateMilestone = (index: number, field: keyof Milestone, value: string | number) => {
        const updated = [...milestones];
        updated[index] = { ...updated[index], [field]: value };
        setMilestones(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (totalAllocation !== 100) {
            alert('Milestone allocations must sum to 100%');
            return;
        }

        if (!window.ethereum) {
            alert('Please install MetaMask to create a campaign!');
            return;
        }

        setIsSubmitting(true);
        setTxHash(null);

        try {
            // Connect to provider (MetaMask)
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const userAddress = await signer.getAddress();

            console.log('Creating campaign from:', userAddress);

            // Create contract instance connected to signer
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

            // Prepare arguments
            // 1 MON = 10^18 wei
            const goalInWei = ethers.parseEther(fundingGoal);
            const descriptions = milestones.map(m => m.description);
            const allocations = milestones.map(m => m.allocation);

            console.log('Sending transaction...');

            // Send transaction
            const tx = await contract.createCampaign(
                title,
                description,
                goalInWei,
                descriptions,
                allocations
            );

            console.log('Tx sent:', tx.hash);
            setTxHash(tx.hash);

            // Wait for confirmation
            const receipt = await tx.wait();
            console.log('Tx confirmed!', receipt);

            // Find event for campaign ID provided by the logs
            // We can parse the logs to find the CampaignCreated event
            let campaignId = 0; // Default fallback

            // Try to find the event topic
            // event CampaignCreated(uint256 indexed campaignId, ...)
            const iface = new ethers.Interface(CONTRACT_ABI);
            const eventTopic = iface.getEvent('CampaignCreated')?.topicHash;

            for (const log of receipt.logs) {
                if (log.topics[0] === eventTopic) {
                    const parsedLog = iface.parseLog({
                        topics: [...log.topics],
                        data: log.data
                    });
                    if (parsedLog) {
                        campaignId = Number(parsedLog.args.campaignId);
                        console.log('Found Campaign ID:', campaignId);
                    }
                }
            }

            // Sync with local store for immediate UI feedback
            campaignStore.add({
                id: campaignId,
                title,
                description,
                creator: userAddress.slice(0, 6) + '...' + userAddress.slice(-4),
                fundingGoal: `${fundingGoal} MON`,
                totalMilestones: milestones.length,
                milestones: milestones.map(m => ({
                    description: m.description,
                    allocation: m.allocation,
                    state: 'PENDING' as const,
                })),
            });

            alert(`✅ Campaign created successfully! ID: ${campaignId}`);
            navigate(`/campaigns`);

        } catch (error: any) {
            console.error('Failed to create campaign:', error);

            let message = error.message || 'Unknown error';
            if (message.includes('user rejected')) {
                message = 'Transaction rejected by user';
            } else if (message.includes('insufficient funds')) {
                message = 'Insufficient MON for gas/transaction';
            }

            alert(`Creation failed: ${message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* Header */}
            <section style={{ textAlign: 'center', marginBottom: '48px' }}>
                <h1 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '12px' }}>Launch a Trustless Campaign</h1>
                <p style={{ color: '#9CA3AF', fontSize: '18px' }}>Create a crowdfunding campaign with AI-verified milestones</p>
            </section>

            <form onSubmit={handleSubmit}>
                {/* Basic Info */}
                <section style={{ marginBottom: '32px' }}>
                    <div className="glass-card">
                        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '28px' }}>Campaign Details</h2>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '14px', color: '#9CA3AF', marginBottom: '10px' }}>
                                Project Title *
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="input-glass"
                                placeholder="e.g., DeFi Analytics Platform"
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '14px', color: '#9CA3AF', marginBottom: '10px' }}>
                                Description *
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="input-glass"
                                placeholder="Describe your project and what you'll build..."
                                required
                                style={{ height: '140px', resize: 'none' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '14px', color: '#9CA3AF', marginBottom: '10px' }}>
                                Funding Goal (MON) *
                            </label>
                            <input
                                type="number"
                                value={fundingGoal}
                                onChange={(e) => setFundingGoal(e.target.value)}
                                className="input-glass"
                                placeholder="10"
                                step="any"
                                min="0.0001"
                                required
                            />
                        </div>
                    </div>
                </section>

                {/* Milestones */}
                <section style={{ marginBottom: '32px' }}>
                    <div className="glass-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Milestones</h2>
                            <span style={{
                                fontSize: '14px',
                                color: totalAllocation === 100 ? '#B6F35C' : '#EF4444'
                            }}>
                                Total: {totalAllocation}%
                            </span>
                        </div>

                        <p style={{ fontSize: '14px', color: '#9CA3AF', marginBottom: '28px', lineHeight: 1.6 }}>
                            Define milestones that AI agents will verify. Allocations must sum to 100%.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
                            {milestones.map((milestone, index) => (
                                <div key={index} className="glass" style={{ padding: '24px', borderRadius: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <span style={{ fontWeight: 600 }}>Milestone {index + 1}</span>
                                        {milestones.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeMilestone(index)}
                                                style={{
                                                    padding: '8px',
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: '#EF4444',
                                                    cursor: 'pointer',
                                                    borderRadius: '8px'
                                                }}
                                            >
                                                <Trash2 style={{ width: '18px', height: '18px' }} />
                                            </button>
                                        )}
                                    </div>

                                    <input
                                        type="text"
                                        value={milestone.description}
                                        onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                                        className="input-glass"
                                        placeholder="e.g., Complete smart contract development"
                                        required
                                        style={{ marginBottom: '16px' }}
                                    />

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <input
                                            type="number"
                                            value={milestone.allocation}
                                            onChange={(e) => updateMilestone(index, 'allocation', Number(e.target.value))}
                                            className="input-glass"
                                            style={{ width: '100px' }}
                                            min="1"
                                            max="100"
                                            required
                                        />
                                        <span style={{ color: '#9CA3AF' }}>% of funds</span>
                                        {fundingGoal && (
                                            <span style={{
                                                fontSize: '14px',
                                                color: '#B6F35C',
                                                fontFamily: 'JetBrains Mono, monospace'
                                            }}>
                                                = {((Number(fundingGoal) * milestone.allocation) / 100).toFixed(4)} MON
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={addMilestone}
                            className="btn-secondary"
                            style={{ width: '100%', justifyContent: 'center' }}
                        >
                            <Plus style={{ width: '18px', height: '18px' }} />
                            Add Milestone
                        </button>
                    </div>
                </section>

                {/* Contract Info */}
                <section style={{ marginBottom: '32px' }}>
                    <div className="glass" style={{ padding: '20px', borderRadius: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                            <span style={{ color: '#9CA3AF' }}>Contract:</span>
                            <a
                                href={`https://testnet.monadexplorer.com/address/${CONTRACT_ADDRESS}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#B6F35C', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }}
                            >
                                {CONTRACT_ADDRESS.slice(0, 10)}...{CONTRACT_ADDRESS.slice(-8)}
                            </a>
                        </div>
                    </div>
                </section>

                {txHash && (
                    <section style={{ marginBottom: '32px' }}>
                        <div style={{ padding: '20px', background: 'rgba(182,243,92,0.1)', borderRadius: '16px' }}>
                            <p style={{ fontSize: '14px', color: '#B6F35C', marginBottom: '8px' }}>✅ Transaction Sent!</p>
                            <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '8px' }}>Waiting for block confirmation...</p>
                            <a
                                href={`https://testnet.monadexplorer.com/tx/${txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ fontSize: '12px', color: '#B6F35C', wordBreak: 'break-all' }}
                            >
                                View Transaction →
                            </a>
                        </div>
                    </section>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isSubmitting || totalAllocation !== 100}
                    className="btn-neon"
                    style={{ width: '100%', padding: '20px', fontSize: '18px', justifyContent: 'center' }}
                >
                    <Zap style={{ width: '22px', height: '22px' }} />
                    {isSubmitting ? 'Confirm in MetaMask...' : 'Deploy Campaign to Monad'}
                </button>

                <p style={{ textAlign: 'center', fontSize: '14px', color: '#6B7280', marginTop: '20px' }}>
                    Campaign will be created on Monad testnet. Make sure your wallet is connected.
                </p>
            </form>
        </div>
    );
}
