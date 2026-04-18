import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowRight, CheckCircle } from 'lucide-react';
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
    const [step, setStep] = useState(1);
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

    const handleSubmit = async () => {
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
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const userAddress = await signer.getAddress();

            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

            const goalInWei = ethers.parseEther(fundingGoal);
            const descriptions = milestones.map(m => m.description);
            const allocations = milestones.map(m => m.allocation);

            const tx = await contract.createCampaign(
                title,
                description,
                goalInWei,
                descriptions,
                allocations
            );

            setTxHash(tx.hash);
            const receipt = await tx.wait();

            let campaignId = 0;
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
                    }
                }
            }

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
            navigate(`/explore`);

        } catch (error: any) {
            let message = error.message || 'Unknown error';
            if (message.includes('user rejected')) message = 'Transaction rejected by user';
            else if (message.includes('insufficient funds')) message = 'Insufficient MON for gas';
            alert(`Creation failed: ${message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const canProceed = () => {
        if (step === 1) return title.trim() && description.trim();
        if (step === 2) return fundingGoal && milestones.every(m => m.description.trim()) && totalAllocation === 100;
        return true;
    };

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            {/* Header */}
            <section className="animate-fade-in-up" style={{ marginBottom: '36px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.03em' }}>Launch a campaign</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>Create a crowdfunding campaign with AI-verified milestones</p>
            </section>

            {/* Stepper */}
            <div className="animate-fade-in-up" style={{
                display: 'flex',
                marginBottom: '36px',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-lg)',
                padding: '4px',
                border: '1px solid var(--border)',
                animationDelay: '60ms'
            }}>
                {[1, 2, 3].map(s => (
                    <button
                        key={s}
                        onClick={() => s < step && setStep(s)}
                        style={{
                            flex: 1,
                            padding: '12px',
                            background: step === s ? 'var(--bg-primary)' : 'transparent',
                            border: 'none',
                            borderRadius: 'var(--radius)',
                            boxShadow: step === s ? 'var(--shadow-sm)' : 'none',
                            cursor: s < step ? 'pointer' : 'default',
                            color: step >= s ? 'var(--text-primary)' : 'var(--text-muted)',
                            fontWeight: step === s ? 700 : 500,
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            transition: 'all 0.2s'
                        }}
                    >
                        {s < step ? <CheckCircle style={{ width: '16px', height: '16px', color: 'var(--success)' }} /> : (
                            <span style={{
                                width: '20px', height: '20px', borderRadius: '50%',
                                background: step === s ? 'var(--gradient-accent)' : 'var(--bg-tertiary)',
                                color: step === s ? 'white' : 'var(--text-muted)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '11px', fontWeight: 700
                            }}>{s}</span>
                        )}
                        {s === 1 ? 'Basics' : s === 2 ? 'Milestones' : 'Review'}
                    </button>
                ))}
            </div>

            {/* Step 1: Basics */}
            {step === 1 && (
                <div className="card animate-fade-in" style={{ overflow: 'hidden', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'var(--gradient-accent)' }} />
                    <h2 style={{ fontWeight: 700, marginBottom: '28px', paddingTop: '4px' }}>Campaign Details</h2>

                    <div style={{ marginBottom: '22px' }}>
                        <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
                            Project Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="input"
                            placeholder="e.g., DeFi Analytics Platform"
                        />
                    </div>

                    <div style={{ marginBottom: '28px' }}>
                        <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
                            Description *
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="input"
                            placeholder="Describe your project and what you'll build..."
                            style={{ height: '130px', resize: 'none' }}
                        />
                    </div>

                    <button
                        onClick={() => setStep(2)}
                        disabled={!canProceed()}
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                    >
                        Continue <ArrowRight style={{ width: '16px', height: '16px' }} />
                    </button>
                </div>
            )}

            {/* Step 2: Funding & Milestones */}
            {step === 2 && (
                <div className="card animate-fade-in" style={{ overflow: 'hidden', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'var(--gradient-accent)' }} />
                    <h2 style={{ fontWeight: 700, marginBottom: '28px', paddingTop: '4px' }}>Funding & Milestones</h2>

                    <div style={{ marginBottom: '28px' }}>
                        <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
                            Funding Goal (MON) *
                        </label>
                        <input
                            type="number"
                            value={fundingGoal}
                            onChange={(e) => setFundingGoal(e.target.value)}
                            className="input"
                            placeholder="0.1"
                            step="0.01"
                            min="0.01"
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <label style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Milestones</label>
                            <span style={{
                                fontSize: '13px',
                                fontWeight: 700,
                                color: totalAllocation === 100 ? 'var(--success)' : 'var(--danger)',
                                padding: '4px 10px',
                                borderRadius: '9999px',
                                background: totalAllocation === 100 ? 'var(--success-light)' : 'var(--danger-light)'
                            }}>
                                {totalAllocation}% / 100%
                            </span>
                        </div>

                        {milestones.map((milestone, index) => (
                            <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                <input
                                    type="text"
                                    value={milestone.description}
                                    onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                                    className="input"
                                    placeholder={`Milestone ${index + 1} description`}
                                    style={{ flex: 1 }}
                                />
                                <input
                                    type="number"
                                    value={milestone.allocation}
                                    onChange={(e) => updateMilestone(index, 'allocation', Number(e.target.value))}
                                    className="input"
                                    placeholder="%"
                                    min="0"
                                    max="100"
                                    style={{ width: '80px', textAlign: 'center' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => removeMilestone(index)}
                                    disabled={milestones.length <= 1}
                                    className="btn btn-ghost"
                                    style={{ padding: '10px', opacity: milestones.length <= 1 ? 0.3 : 1 }}
                                >
                                    <Trash2 style={{ width: '16px', height: '16px' }} />
                                </button>
                            </div>
                        ))}

                        <button type="button" onClick={addMilestone} className="btn btn-ghost" style={{ width: '100%', borderStyle: 'dashed' }}>
                            <Plus style={{ width: '16px', height: '16px' }} /> Add milestone
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => setStep(1)} className="btn btn-ghost" style={{ flex: 1 }}>
                            Back
                        </button>
                        <button
                            onClick={() => setStep(3)}
                            disabled={!canProceed()}
                            className="btn btn-primary"
                            style={{ flex: 1 }}
                        >
                            Continue <ArrowRight style={{ width: '16px', height: '16px' }} />
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
                <div className="card animate-fade-in" style={{ overflow: 'hidden', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'var(--gradient-accent)' }} />
                    <h2 style={{ fontWeight: 700, marginBottom: '28px', paddingTop: '4px' }}>Review & Publish</h2>

                    <div className="card-flat" style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontWeight: 700, marginBottom: '8px' }}>{title}</h3>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '18px', lineHeight: 1.6 }}>{description}</p>

                        <div style={{ display: 'flex', gap: '24px', fontSize: '14px', marginBottom: '18px' }}>
                            <div>
                                <span style={{ color: 'var(--text-muted)' }}>Goal:</span>{' '}
                                <strong style={{ fontWeight: 700 }}>{fundingGoal} MON</strong>
                            </div>
                            <div>
                                <span style={{ color: 'var(--text-muted)' }}>Milestones:</span>{' '}
                                <strong style={{ fontWeight: 700 }}>{milestones.length}</strong>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                            {milestones.map((m, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '10px', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{
                                            width: '24px', height: '24px', borderRadius: '50%',
                                            background: 'var(--accent-light)', color: 'var(--accent)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '11px', fontWeight: 700, flexShrink: 0
                                        }}>{i + 1}</span>
                                        <span>{m.description || `Milestone ${i + 1}`}</span>
                                    </div>
                                    <span className="badge badge-accent">{m.allocation}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card-flat" style={{ marginBottom: '28px', padding: '18px' }}>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                            <span style={{ color: 'var(--success)', marginRight: '6px' }}>✓</span> Funds will be locked in a smart contract<br />
                            <span style={{ color: 'var(--success)', marginRight: '6px' }}>✓</span> AI verifies each milestone before funds are released<br />
                            <span style={{ color: 'var(--success)', marginRight: '6px' }}>✓</span> Failed milestones trigger automatic refunds
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => setStep(2)} className="btn btn-ghost" style={{ flex: 1 }}>
                            Back
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="btn btn-primary"
                            style={{ flex: 1 }}
                        >
                            {isSubmitting ? 'Publishing...' : 'Publish campaign'}
                        </button>
                    </div>

                    {txHash && (
                        <div style={{ marginTop: '18px', padding: '14px', background: 'var(--success-light)', borderRadius: 'var(--radius)', fontSize: '13px', border: '1px solid rgba(16,185,129,0.15)' }}>
                            <a href={`https://testnet.monadexplorer.com/tx/${txHash}`} target="_blank" rel="noopener" style={{ color: '#059669', fontWeight: 600 }}>
                                View transaction on explorer →
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
