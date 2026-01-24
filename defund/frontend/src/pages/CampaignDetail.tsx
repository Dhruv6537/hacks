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
    Wallet,
    Play,
    FileText
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
    const [contributeAmount, setContributeAmount] = useState('0.001');
    const [isContributing, setIsContributing] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('overview');

    const campaignId = Number(id);
    const [campaign, setCampaign] = useState(campaignStore.getById(campaignId));
    const [isLoading, setIsLoading] = useState(campaignStore.isLoading);

    useEffect(() => {
        setCampaign(campaignStore.getById(campaignId));
        setIsLoading(campaignStore.isLoading);

        const unsubscribe = campaignStore.subscribe(() => {
            setCampaign(campaignStore.getById(campaignId));
            setIsLoading(campaignStore.isLoading);
        });

        if (!campaignStore.getById(campaignId) && !campaignStore.isLoading) {
            campaignStore.fetchCampaigns();
        }

        return () => unsubscribe();
    }, [campaignId]);

    // Loading state
    if (isLoading && !campaign) {
        return (
            <div style={{ textAlign: 'center', padding: '64px' }}>
                <div className="card-flat" style={{ display: 'inline-block', padding: '24px 48px' }}>
                    Loading Campaign Data...
                </div>
            </div>
        );
    }

    if (!campaign) {
        return (
            <div style={{ textAlign: 'center', padding: '48px' }}>
                <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Campaign Not Found</h1>
                <Link to="/explore" className="btn btn-ghost">Back to Explore</Link>
            </div>
        );
    }

    const getMilestoneStatus = (state: string) => {
        switch (state) {
            case 'PASSED':
                return { icon: <CheckCircle style={{ width: '20px', height: '20px', color: 'var(--success)' }} />, label: 'Verified', className: 'pill-verified' };
            case 'SUBMITTED':
                return { icon: <Clock style={{ width: '20px', height: '20px', color: 'var(--warning)' }} />, label: 'Pending', className: 'pill-pending' };
            case 'FAILED':
                return { icon: <AlertCircle style={{ width: '20px', height: '20px', color: 'var(--danger)' }} />, label: 'Failed', className: 'pill-at-risk' };
            default:
                return { icon: <Clock style={{ width: '20px', height: '20px', color: 'var(--text-muted)' }} />, label: 'Upcoming', className: '' };
        }
    };

    const handleContribute = async () => {
        if (!window.ethereum) {
            alert('Please install MetaMask to contribute!');
            return;
        }

        if (campaignId >= 1000) {
            alert('This is a demo campaign. Please create a new campaign to test real blockchain contributions.');
            return;
        }

        setIsContributing(true);
        setTxHash(null);

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            const amountInWei = ethers.parseEther(contributeAmount);

            const tx = await contract.contribute(campaignId, {
                value: amountInWei,
                gasLimit: 500000 // Increased to prevent out-of-gas errors
            });

            setTxHash(tx.hash);
            await tx.wait();

            campaignStore.contribute(campaignId, parseFloat(contributeAmount));
            await campaignStore.fetchCampaigns();

            alert(`✅ Contribution successful! Added ${contributeAmount} MON to campaign.`);
        } catch (error: any) {
            let errorMessage = error.message || 'Unknown error';
            if (errorMessage.includes('rejected')) errorMessage = 'Transaction rejected by user';
            else if (errorMessage.includes('Campaign not active')) errorMessage = 'This campaign is no longer accepting contributions.';
            else if (errorMessage.includes('insufficient funds')) errorMessage = 'Insufficient MON for this transaction.';
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

            const tx = await contract.submitMilestone(campaignId, proofUrl);
            await tx.wait();
            alert('✅ Proof submitted!');
            await campaignStore.fetchCampaigns();
        } catch (error: any) {
            alert('Submission failed: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVerify = async (milestoneIndex: number) => {
        setIsVerifying(true);
        try {
            const response = await fetch('https://defund-backend.onrender.com/api/verify/milestone', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    campaignId,
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
            }
            await campaignStore.fetchCampaigns();
        } catch (e: any) {
            alert('Verification error: ' + e.message);
        }
        setIsVerifying(false);
    };

    const getStatusBadge = () => {
        if (campaign.milestones.some(m => m.state === 'PASSED')) {
            return <span className="pill pill-verified"><CheckCircle style={{ width: '14px', height: '14px' }} /> AI Verified</span>;
        }
        if (campaign.milestones.some(m => m.state === 'SUBMITTED')) {
            return <span className="pill pill-pending"><Clock style={{ width: '14px', height: '14px' }} /> Pending Review</span>;
        }
        if (campaign.state === 'FAILED') {
            return <span className="pill pill-at-risk"><AlertCircle style={{ width: '14px', height: '14px' }} /> At Risk</span>;
        }
        return null;
    };

    return (
        <div>
            {/* Back Button */}
            <Link to="/explore" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--text-muted)',
                textDecoration: 'none',
                marginBottom: '24px',
                fontSize: '14px'
            }}>
                <ArrowLeft style={{ width: '16px', height: '16px' }} />
                Back to Explore
            </Link>

            {/* Two Column Layout */}
            <div className="two-column">
                {/* Main Content */}
                <div>
                    {/* Header */}
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                            <span className="tag">{campaign.state === 'ACTIVE' ? 'Funding' : campaign.state}</span>
                            <span className="tag">Monad</span>
                        </div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '12px' }}>{campaign.title}</h1>
                        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>{campaign.description}</p>
                    </div>

                    {/* Tabs */}
                    <div style={{
                        display: 'flex',
                        gap: '4px',
                        borderBottom: '1px solid var(--border)',
                        marginBottom: '24px'
                    }}>
                        {['overview', 'milestones', 'updates'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '12px 20px',
                                    background: 'transparent',
                                    border: 'none',
                                    borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
                                    color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
                                    fontWeight: activeTab === tab ? 500 : 400,
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    textTransform: 'capitalize'
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'overview' && (
                        <div>
                            <div className="card" style={{ marginBottom: '16px' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px' }}>About this project</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                                    {campaign.description}
                                </p>
                            </div>
                            <div className="card">
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px' }}>Why DeFund?</h3>
                                <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: '20px' }}>
                                    <li>Funds locked in smart contracts until milestones pass</li>
                                    <li>AI verification ensures accountability</li>
                                    <li>Automatic refunds if milestones fail</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {activeTab === 'milestones' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {campaign.milestones.map((milestone, index) => {
                                const status = getMilestoneStatus(milestone.state);
                                const isCurrent = index === campaign.currentMilestone;
                                return (
                                    <div key={index} className="card" style={{
                                        border: isCurrent ? '2px solid var(--accent)' : undefined
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                {status.icon}
                                                <div>
                                                    <h4 style={{ fontWeight: 600, marginBottom: '2px' }}>Milestone {index + 1}</h4>
                                                    <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{milestone.description}</p>
                                                </div>
                                            </div>
                                            <span className={`pill ${status.className}`} style={{ fontSize: '12px' }}>
                                                {status.label}
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
                                            <span>{milestone.allocation}% of funds</span>
                                            {isCurrent && milestone.state === 'PENDING' && campaign.state === 'ACTIVE' && (
                                                <button
                                                    onClick={() => handleSubmitProof(index)}
                                                    disabled={isSubmitting}
                                                    className="btn btn-ghost btn-sm"
                                                >
                                                    <FileText style={{ width: '14px', height: '14px' }} />
                                                    {isSubmitting ? 'Submitting...' : 'Submit Proof'}
                                                </button>
                                            )}
                                            {milestone.state === 'SUBMITTED' && (
                                                <button
                                                    onClick={() => handleVerify(index)}
                                                    disabled={isVerifying}
                                                    className="btn btn-primary btn-sm"
                                                >
                                                    <Play style={{ width: '14px', height: '14px' }} />
                                                    {isVerifying ? 'Verifying...' : 'Verify with AI'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {activeTab === 'updates' && (
                        <div className="card-flat" style={{ textAlign: 'center', padding: '48px' }}>
                            <Clock style={{ width: '32px', height: '32px', margin: '0 auto 12px', color: 'var(--text-muted)' }} />
                            <p style={{ color: 'var(--text-muted)' }}>No updates yet</p>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div>
                    <div className="card" style={{ position: 'sticky', top: '80px' }}>
                        {/* Progress */}
                        <div style={{ marginBottom: '20px' }}>
                            <div className="progress-bar" style={{ height: '10px', marginBottom: '12px' }}>
                                <div className="progress-fill" style={{ width: `${campaign.progress}%` }}></div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                <span style={{ fontWeight: 600 }}>{campaign.raisedAmount}</span>
                                <span style={{ color: 'var(--text-muted)' }}>of {campaign.fundingGoal}</span>
                            </div>
                            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent)', marginTop: '4px' }}>
                                {campaign.progress}% funded
                            </div>
                        </div>

                        {/* AI Status */}
                        <div style={{ marginBottom: '20px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>AI verification status</div>
                            {getStatusBadge() || <span className="pill" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>Not started</span>}
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                                Milestone {campaign.currentMilestone + 1} of {campaign.totalMilestones}
                            </div>
                        </div>

                        {/* Stats */}
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', fontSize: '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                                <Users style={{ width: '16px', height: '16px' }} />
                                {campaign.backers} backers
                            </div>
                        </div>

                        {/* Back Form */}
                        {campaign.state === 'ACTIVE' && (
                            <>
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Amount (MON)</label>
                                    <input
                                        type="number"
                                        value={contributeAmount}
                                        onChange={(e) => setContributeAmount(e.target.value)}
                                        className="input"
                                        step="0.001"
                                        min="0.001"
                                    />
                                </div>
                                <button
                                    onClick={handleContribute}
                                    disabled={isContributing}
                                    className="btn btn-primary"
                                    style={{ width: '100%' }}
                                >
                                    <Wallet style={{ width: '16px', height: '16px' }} />
                                    {isContributing ? 'Processing...' : 'Back this project'}
                                </button>
                            </>
                        )}

                        {campaign.state === 'FAILED' && (
                            <div style={{ padding: '16px', background: 'var(--danger-light)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                                <p style={{ color: '#991B1B', fontSize: '14px' }}>This campaign has failed. Backers can claim refunds.</p>
                                <Link to="/refunds" className="btn btn-ghost" style={{ marginTop: '12px' }}>
                                    View Refunds
                                </Link>
                            </div>
                        )}

                        {/* Explorer Link */}
                        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                            <a
                                href={`https://testnet.monadexplorer.com/address/${CONTRACT_ADDRESS}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    color: 'var(--text-muted)',
                                    textDecoration: 'none',
                                    fontSize: '13px'
                                }}
                            >
                                View on Monad Explorer
                                <ExternalLink style={{ width: '14px', height: '14px' }} />
                            </a>
                        </div>

                        {txHash && (
                            <div style={{ marginTop: '12px', padding: '12px', background: 'var(--success-light)', borderRadius: 'var(--radius)', fontSize: '12px' }}>
                                <a href={`https://testnet.monadexplorer.com/tx/${txHash}`} target="_blank" rel="noopener" style={{ color: '#166534' }}>
                                    View transaction →
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
