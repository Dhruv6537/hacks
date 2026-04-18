import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { ArrowLeft, DollarSign, CheckCircle, Wallet, AlertTriangle } from 'lucide-react';
import { campaignStore, type Campaign } from '../store/campaigns';

// Contract address deployed on Monad testnet
const CONTRACT_ADDRESS = '0x11C88CdD5DcF83913cEe5d4a933d633a415E2437';

// Contract ABI
const CONTRACT_ABI = [
    'function claimRefund(uint256 _campaignId) external',
    'function contributions(uint256 _campaignId, address _backer) external view returns (uint256)',
    'event RefundClaimed(uint256 indexed campaignId, address indexed backer, uint256 amount)'
];

export default function Refunds() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [userContributions, setUserContributions] = useState<Map<number, string>>(new Map());
    const [isClaiming, setIsClaiming] = useState<number | null>(null);
    const [walletAddress, setWalletAddress] = useState<string | null>(null);

    useEffect(() => {
        const failedCampaigns = campaignStore.getAll().filter(c => c.state === 'FAILED');
        setCampaigns(failedCampaigns);
        checkUserContributions(failedCampaigns);

        const unsubscribe = campaignStore.subscribe(() => {
            const updated = campaignStore.getAll().filter(c => c.state === 'FAILED');
            setCampaigns(updated);
            checkUserContributions(updated);
        });

        return () => unsubscribe();
    }, []);

    const checkUserContributions = async (failedCampaigns: Campaign[]) => {
        if (!window.ethereum) return;

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            setWalletAddress(address);

            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

            const contributions = new Map<number, string>();
            for (const campaign of failedCampaigns) {
                if (campaign.id < 1000) {
                    try {
                        const amount = await contract.contributions(campaign.id, address);
                        if (amount > 0n) {
                            contributions.set(campaign.id, ethers.formatEther(amount));
                        }
                    } catch (e) {
                        console.warn(`Failed to check contributions for campaign ${campaign.id}`, e);
                    }
                }
            }
            setUserContributions(contributions);
        } catch (e) {
            console.error('Failed to check contributions:', e);
        }
    };

    const handleClaimRefund = async (campaignId: number) => {
        if (!window.ethereum) {
            alert('Please connect your wallet!');
            return;
        }

        setIsClaiming(campaignId);

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

            const tx = await contract.claimRefund(campaignId, { gasLimit: 100000 });
            await tx.wait();

            alert('✅ Refund claimed successfully!');

            const failedCampaigns = campaignStore.getAll().filter(c => c.state === 'FAILED');
            await checkUserContributions(failedCampaigns);

        } catch (error: any) {
            let message = error.message || 'Unknown error';
            if (message.includes('rejected')) message = 'Transaction rejected by user';
            else if (message.includes('No contribution')) message = 'You have no contribution to refund.';
            else if (message.includes('Already refunded')) message = 'You have already claimed this refund.';
            else if (message.includes('execution reverted')) message = 'Refund not available.';
            alert(`❌ Refund failed: ${message}`);
        } finally {
            setIsClaiming(null);
        }
    };

    const refundableCampaigns = campaigns.filter(c => userContributions.has(c.id));
    const otherFailedCampaigns = campaigns.filter(c => !userContributions.has(c.id));

    return (
        <div>
            {/* Back */}
            <Link to="/explore" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--text-muted)',
                textDecoration: 'none',
                marginBottom: '28px',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'color 0.2s'
            }}>
                <ArrowLeft style={{ width: '16px', height: '16px' }} />
                Back to Explore
            </Link>

            {/* Header */}
            <section className="animate-fade-in-up" style={{ marginBottom: '36px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.03em' }}>Claim Refunds</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
                    If a campaign fails verification, your contributions are automatically refundable.
                </p>
            </section>

            {!walletAddress && (
                <div className="animate-fade-in-up card-flat" style={{ textAlign: 'center', padding: '64px 24px', animationDelay: '60ms' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent-light)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
                    }}>
                        <Wallet style={{ width: '32px', height: '32px', color: 'var(--accent)' }} />
                    </div>
                    <h2 style={{ fontWeight: 700, marginBottom: '10px', fontSize: '1.25rem' }}>Connect Your Wallet</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Please connect your wallet to view refundable campaigns.</p>
                </div>
            )}

            {walletAddress && refundableCampaigns.length === 0 && otherFailedCampaigns.length === 0 && (
                <div className="animate-fade-in-up card-flat" style={{ textAlign: 'center', padding: '64px 24px', animationDelay: '60ms' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '50%', background: 'var(--success-light)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
                    }}>
                        <CheckCircle style={{ width: '32px', height: '32px', color: 'var(--success)' }} />
                    </div>
                    <h2 style={{ fontWeight: 700, marginBottom: '10px', fontSize: '1.25rem' }}>No Failed Campaigns</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
                        Great news! There are no failed campaigns. All your contributions are safe.
                    </p>
                </div>
            )}

            {/* Refundable Campaigns */}
            {refundableCampaigns.length > 0 && (
                <section className="animate-fade-in-up" style={{ marginBottom: '48px', animationDelay: '60ms' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <div style={{
                            width: '8px', height: '8px', borderRadius: '50%', background: 'var(--danger)',
                            boxShadow: '0 0 8px rgba(239,68,68,0.4)'
                        }} />
                        <h2 style={{ fontWeight: 700, color: 'var(--danger)', fontSize: '1.2rem' }}>
                            Your Refundable Contributions
                        </h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {refundableCampaigns.map(campaign => (
                            <div key={campaign.id} className="card" style={{
                                borderLeft: '4px solid var(--danger)',
                                overflow: 'hidden', position: 'relative'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                                    <div>
                                        <h3 style={{ fontWeight: 700, marginBottom: '6px' }}>{campaign.title}</h3>
                                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                                            Campaign ID: {campaign.id} · <span className="badge badge-fail" style={{ fontSize: '11px' }}>FAILED</span>
                                        </p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{
                                                width: '36px', height: '36px', borderRadius: '50%',
                                                background: 'var(--success-light)', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <DollarSign style={{ width: '20px', height: '20px', color: 'var(--success)' }} />
                                            </div>
                                            <div>
                                                <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--success)' }}>
                                                    {userContributions.get(campaign.id)} MON
                                                </span>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '13px', marginLeft: '8px' }}>available</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleClaimRefund(campaign.id)}
                                        disabled={isClaiming === campaign.id}
                                        className="btn btn-primary"
                                    >
                                        {isClaiming === campaign.id ? 'Claiming...' : 'Claim Refund'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Other Failed Campaigns */}
            {otherFailedCampaigns.length > 0 && walletAddress && (
                <section className="animate-fade-in-up" style={{ marginBottom: '48px', animationDelay: '120ms' }}>
                    <h2 style={{ fontWeight: 600, marginBottom: '16px', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        Other Failed Campaigns
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {otherFailedCampaigns.map(campaign => (
                            <div key={campaign.id} className="card-flat" style={{ padding: '16px 20px', opacity: 0.7 }}>
                                <h3 style={{ fontWeight: 600, marginBottom: '2px' }}>{campaign.title}</h3>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                    Campaign ID: {campaign.id} · You have no contribution to refund
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Info Card */}
            <section className="animate-fade-in-up" style={{ animationDelay: '180ms' }}>
                <div className="card" style={{ padding: '28px', overflow: 'hidden', position: 'relative' }}>
                    {/* Accent strip */}
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                        background: 'var(--gradient-accent)'
                    }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px', paddingTop: '4px' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '50%', background: 'var(--warning-light)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                            <AlertTriangle style={{ width: '20px', height: '20px', color: 'var(--warning)' }} />
                        </div>
                        <h3 style={{ fontWeight: 700 }}>How Refunds Work</h3>
                    </div>
                    <ul style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 2.2, paddingLeft: '20px' }}>
                        <li>When a milestone verification fails, the campaign is marked as <strong style={{ color: 'var(--danger)', fontWeight: 600 }}>FAILED</strong></li>
                        <li>All contributors can claim a full refund of their contributions</li>
                        <li>Refunds are processed directly from the smart contract escrow</li>
                        <li>Each contribution can only be refunded once</li>
                    </ul>
                </div>
            </section>
        </div>
    );
}
