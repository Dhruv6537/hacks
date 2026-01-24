import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import {
    ArrowLeft,
    ExternalLink,
    CheckCircle,
    Clock,
    AlertCircle,
    Users,
    DollarSign,
    Play
} from 'lucide-react';
import { campaignStore } from '../store/campaigns';

// Contract address deployed on Monad testnet
const CONTRACT_ADDRESS = '0x11C88CdD5DcF83913cEe5d4a933d633a415E2437';

// Contract ABI
const CONTRACT_ABI = [
    'function contribute(uint256 _campaignId) external payable',
    'function submitMilestone(uint256 _campaignId, string _proofUrl) external',
    'function getCampaign(uint256 _campaignId) external view returns (tuple(address creator, string title, string description, uint256 fundingGoal, uint256 raisedAmount, uint256 releasedAmount, uint8 state, uint256 milestoneCount, uint256 currentMilestone, uint256 createdAt))'
];

export default function CampaignDetail() {
    const { id } = useParams();
    const [contributeAmount, setContributeAmount] = useState('0.1');
    const [isContributing, setIsContributing] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);

    const campaignId = Number(id);
    // Use state to trigger re-renders on store updates
    const [campaign, setCampaign] = useState(campaignStore.getById(campaignId));
    const [isLoading, setIsLoading] = useState(campaignStore.isLoading);

    useEffect(() => {
        // Initial set
        setCampaign(campaignStore.getById(campaignId));
        setIsLoading(campaignStore.isLoading);

        // Subscribe to store updates
        const unsubscribe = campaignStore.subscribe(() => {
            setCampaign(campaignStore.getById(campaignId));
            setIsLoading(campaignStore.isLoading);
        });

        // Trigger fetch if empty and no campaign found
        if (!campaignStore.getById(campaignId) && !campaignStore.isLoading) {
            campaignStore.fetchCampaigns();
        }

        return () => unsubscribe();
    }, [campaignId]);

    // Show loading state
    if (isLoading && !campaign) {
        return (
            <div style={{ textAlign: 'center', padding: '64px' }}>
                <div className="btn-neon" style={{ display: 'inline-block', border: 'none' }}>
                    Loading Campaign Data...
                </div>
            </div>
        );
    }

    if (!campaign) {
        return (
            <div style={{ textAlign: 'center', padding: '48px' }}>
                <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Campaign Not Found</h1>
                <Link to="/campaigns" className="btn-secondary">Back to Campaigns</Link>
            </div>
        );
    }

    const getMilestoneIcon = (state: string) => {
        switch (state) {
            case 'PASSED':
                return <CheckCircle style={{ width: '28px', height: '28px', color: '#B6F35C' }} />;
            case 'SUBMITTED':
                return <Clock style={{ width: '28px', height: '28px', color: '#FBB524' }} />;
            case 'FAILED':
                return <AlertCircle style={{ width: '28px', height: '28px', color: '#EF4444' }} />;
            default:
                return <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #6B7280' }} />;
        }
    };

    const handleContribute = async () => {
        if (!window.ethereum) {
            alert('Please install MetaMask to contribute!');
            return;
        }

        if (campaignId >= 1000) {
            alert('This is a demo campaign (ID >= 1000). Please create a new campaign to test real blockchain contributions.');
            return;
        }

        setIsContributing(true);
        setTxHash(null);

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            // Create contract instance
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

            // Amount in wei
            const amountInWei = ethers.parseEther(contributeAmount);

            console.log(`Contributing ${contributeAmount} MON to campaign ${campaignId}...`);

            // Send transaction
            const tx = await contract.contribute(campaignId, {
                value: amountInWei,
                gasLimit: 150000 // Reasonable limit for contribution
            });

            console.log('Transaction sent:', tx.hash);
            setTxHash(tx.hash);

            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt);

            // Update local store to reflect contribution immediately
            campaignStore.contribute(campaignId, parseFloat(contributeAmount));

            // Refresh from blockchain
            await campaignStore.fetchCampaigns();

            alert(`✅ Contribution successful! Added ${contributeAmount} MON to campaign.`);

        } catch (error: any) {
            console.error('Contribution failed:', error);
            let errorMessage = error.message || 'Unknown error';

            // Parse common contract errors
            if (errorMessage.includes('rejected')) {
                errorMessage = 'Transaction rejected by user';
            } else if (errorMessage.includes('Campaign not active')) {
                errorMessage = 'This campaign is no longer accepting contributions.';
            } else if (errorMessage.includes('execution reverted')) {
                errorMessage = 'Transaction failed. The campaign may be closed or failed.';
            } else if (errorMessage.includes('insufficient funds')) {
                errorMessage = 'Insufficient MON for this transaction.';
            }

            alert(`❌ Contribution failed: ${errorMessage}`);
        } finally {
            setIsContributing(false);
        }
    };

    const handleSubmitProof = async (milestoneIndex: number) => {
        if (!window.ethereum) return alert('Connect Wallet');

        const proofUrl = prompt("Enter Proof URL (GitHub, Video, etc):", "https://github.com/defund/milestone-proof");
        if (!proofUrl) return;

        setIsSubmitting(true);
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

            console.log(`Submitting proof for milestone ${milestoneIndex}...`);
            // Note: Contract automatically determines milestone index based on currentMilestone
            const tx = await contract.submitMilestone(campaignId, proofUrl);
            console.log('Tx sent:', tx.hash);

            await tx.wait();
            alert('✅ Proof submitted! Refreshing...');
            await campaignStore.fetchCampaigns(); // Refresh to show "SUBMITTED" state
        } catch (error: any) {
            console.error(error);
            alert('Submission failed: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVerify = async (milestoneIndex: number) => {
        setIsVerifying(true);
        try {
            const response = await fetch('http://localhost:3001/api/verify/milestone', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    campaignId: campaignId,
                    milestoneIndex,
                    milestoneDescription: campaign.milestones[milestoneIndex].description,
                    proofUrl: campaign.milestones[milestoneIndex].proofUrl || 'https://github.com/defund/demo-proof',
                    campaignTitle: campaign.title,
                }),
            });
            const result = await response.json();

            if (result.success) {
                if (result.verification?.passed) {
                    alert(`✅ Verification Passed! Confidence: ${result.verification.confidence}%`);
                } else {
                    alert(`❌ Verification Failed.\nReason: ${result.verification?.agentVotes[0]?.reasoning || 'Proof insufficient'}`);
                }
            } else {
                alert(`Verification requested: ${result.message || 'Check backend logs'}`);
            }
        } catch (e: any) {
            alert('Verification request sent/failed: ' + e.message);
        }
        setIsVerifying(false);
    };

    return (
        <div>
            {/* Back Button */}
            <Link to="/campaigns" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '#9CA3AF',
                textDecoration: 'none',
                marginBottom: '32px'
            }}>
                <ArrowLeft style={{ width: '18px', height: '18px' }} />
                Back to Campaigns
            </Link>

            {/* Hero */}
            <section style={{ marginBottom: '48px' }}>
                <div className="glass-card">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', justifyContent: 'space-between' }}>
                        <div style={{ flex: '1', minWidth: '300px' }}>
                            <span className={`badge ${campaign.state === 'ACTIVE' ? 'badge-active' : campaign.state === 'COMPLETED' ? 'badge-pass' : 'badge-fail'}`} style={{ marginBottom: '16px', display: 'inline-block' }}>
                                {campaign.state}
                            </span>
                            <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '16px' }}>{campaign.title}</h1>
                            <p style={{ color: '#9CA3AF', marginBottom: '20px', lineHeight: 1.7 }}>{campaign.description}</p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#9CA3AF' }}>
                                <span>Created by</span>
                                <code className="glass" style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px' }}>
                                    {campaign.creator.slice(0, 10)}...{campaign.creator.slice(-8)}
                                </code>
                                <a href={`https://testnet.monadexplorer.com/address/${CONTRACT_ADDRESS}`} target="_blank" rel="noopener noreferrer" style={{ color: '#B6F35C', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    View on Explorer <ExternalLink style={{ width: '14px', height: '14px' }} />
                                </a>
                            </div>
                        </div>

                        {/* Stats */}
                        <div style={{ width: '320px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginBottom: '12px' }}>
                                <span style={{ fontSize: '32px', fontWeight: 700, color: '#B6F35C', fontFamily: 'JetBrains Mono, monospace' }}>
                                    {campaign.raisedAmount}
                                </span>
                                <span style={{ color: '#9CA3AF', fontSize: '14px' }}>
                                    raised of {campaign.fundingGoal} goal
                                </span>
                            </div>

                            <div className="progress-bar" style={{ height: '12px', marginBottom: '20px' }}>
                                <div className="progress-fill" style={{
                                    width: `${campaign.progress}%`,
                                    background: campaign.state === 'FAILED' ? '#EF4444' : 'linear-gradient(90deg, #A3E635 0%, #22C55E 100%)'
                                }}></div>
                            </div>

                            <div style={{ display: 'flex', gap: '24px', fontSize: '14px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9CA3AF' }}>
                                    <Users style={{ width: '16px', height: '16px' }} />
                                    <span>{campaign.backers} backers</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9CA3AF' }}>
                                    <DollarSign style={{ width: '16px', height: '16px' }} />
                                    <span>{campaign.progress.toFixed(1)}% funded</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Grid */}
            <section>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
                    {/* Milestones */}
                    <div>
                        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>Milestones</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {campaign.milestones.map((milestone, i) => (
                                <div key={i} className="glass-card">
                                    <div style={{ display: 'flex', gap: '20px' }}>
                                        {getMilestoneIcon(milestone.state)}

                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                <h3 style={{ fontWeight: 600 }}>Milestone {i + 1}</h3>
                                                <span className={`badge ${milestone.state === 'PASSED' ? 'badge-pass' :
                                                    milestone.state === 'SUBMITTED' ? 'badge-pending' :
                                                        milestone.state === 'FAILED' ? 'badge-fail' : ''
                                                    }`}>
                                                    {milestone.state}
                                                </span>
                                            </div>

                                            <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '16px' }}>{milestone.description}</p>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                                                <span style={{ fontSize: '14px', color: '#B6F35C', fontFamily: 'JetBrains Mono, monospace' }}>
                                                    {milestone.allocation}% allocated
                                                </span>

                                                {milestone.state === 'PENDING' && i === campaign.currentMilestone && (
                                                    <button
                                                        onClick={() => handleSubmitProof(i)}
                                                        disabled={isSubmitting}
                                                        className="btn-secondary"
                                                        style={{ padding: '6px 12px', fontSize: '12px' }}
                                                    >
                                                        {isSubmitting ? 'Submitting...' : 'Submit Proof'}
                                                    </button>
                                                )}

                                                {milestone.state === 'SUBMITTED' && (
                                                    <button
                                                        onClick={() => handleVerify(i)}
                                                        disabled={isVerifying}
                                                        className="btn-neon"
                                                        style={{ padding: '10px 20px', fontSize: '14px' }}
                                                    >
                                                        <Play style={{ width: '16px', height: '16px' }} />
                                                        {isVerifying ? 'Verifying...' : 'Trigger AI Verification'}
                                                    </button>
                                                )}

                                                {milestone.state === 'PASSED' && (
                                                    <span style={{ fontSize: '14px', color: '#9CA3AF' }}>
                                                        Verified by Gemini
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Contribute Panel */}
                    <div className="glass-card">
                        <h3 style={{ fontWeight: 700, marginBottom: '24px' }}>Contribute (Real Transaction)</h3>

                        {campaignId >= 1000 && (
                            <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                                <p style={{ fontSize: '12px', color: '#EF4444' }}>
                                    ⚠️ This is a demo campaign. Real contributions are disabled. Create a new campaign to test on-chain features.
                                </p>
                            </div>
                        )}

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '14px', color: '#9CA3AF', marginBottom: '10px' }}>
                                Amount (MON)
                            </label>
                            <input
                                type="number"
                                value={contributeAmount}
                                onChange={(e) => setContributeAmount(e.target.value)}
                                className="input-glass"
                                step="any"
                                min="0.001"
                                disabled={campaignId >= 1000}
                            />
                        </div>

                        <button
                            onClick={handleContribute}
                            disabled={isContributing || campaignId >= 1000 || campaign.state !== 'ACTIVE'}
                            className="btn-neon"
                            style={{
                                width: '100%',
                                justifyContent: 'center',
                                marginBottom: '16px',
                                opacity: (campaignId >= 1000 || campaign.state !== 'ACTIVE') ? 0.5 : 1,
                                cursor: (campaignId >= 1000 || campaign.state !== 'ACTIVE') ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {campaign.state !== 'ACTIVE'
                                ? `Campaign ${campaign.state}`
                                : isContributing
                                    ? 'Confirm in MetaMask...'
                                    : `Contribute ${contributeAmount} MON`}
                        </button>

                        {txHash && (
                            <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(182,243,92,0.1)', borderRadius: '12px' }}>
                                <p style={{ fontSize: '12px', color: '#B6F35C', marginBottom: '4px' }}>Transaction Sent!</p>
                                <a
                                    href={`https://testnet.monadexplorer.com/tx/${txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ fontSize: '12px', color: '#B6F35C', wordBreak: 'break-all' }}
                                >
                                    View on Explorer →
                                </a>
                            </div>
                        )}

                        <p style={{ fontSize: '12px', color: '#6B7280', textAlign: 'center' }}>
                            Funds are sent to smart contract escrow on Monad testnet
                        </p>
                    </div>

                    <div className="glass-card">
                        <h3 style={{ fontWeight: 700, marginBottom: '20px' }}>Contract Info</h3>
                        <div style={{ fontSize: '14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <span style={{ color: '#9CA3AF' }}>Network</span>
                                <span style={{ color: '#B6F35C' }}>Monad Testnet</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <span style={{ color: '#9CA3AF' }}>Contract</span>
                                <a href={`https://testnet.monadexplorer.com/address/${CONTRACT_ADDRESS}`} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#B6F35C' }}>
                                    {CONTRACT_ADDRESS.slice(0, 8)}...{CONTRACT_ADDRESS.slice(-6)}
                                </a>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#9CA3AF' }}>Campaign ID</span>
                                <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{id}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
