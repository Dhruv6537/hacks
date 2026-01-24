import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { ArrowLeft, AlertTriangle, DollarSign, CheckCircle } from 'lucide-react';
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
        // Filter for failed campaigns
        const failedCampaigns = campaignStore.getAll().filter(c => c.state === 'FAILED');
        setCampaigns(failedCampaigns);

        // Check user's contributions to failed campaigns
        checkUserContributions(failedCampaigns);

        // Subscribe to store updates
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
                if (campaign.id < 1000) { // Only real blockchain campaigns
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

            console.log(`Claiming refund for campaign ${campaignId}...`);
            const tx = await contract.claimRefund(campaignId, {
                gasLimit: 100000
            });

            console.log('Transaction sent:', tx.hash);
            await tx.wait();

            alert('✅ Refund claimed successfully!');

            // Refresh contributions
            const failedCampaigns = campaignStore.getAll().filter(c => c.state === 'FAILED');
            await checkUserContributions(failedCampaigns);

        } catch (error: any) {
            console.error('Refund claim failed:', error);
            let message = error.message || 'Unknown error';

            if (message.includes('rejected')) {
                message = 'Transaction rejected by user';
            } else if (message.includes('No contribution')) {
                message = 'You have no contribution to refund.';
            } else if (message.includes('Already refunded')) {
                message = 'You have already claimed this refund.';
            } else if (message.includes('execution reverted')) {
                message = 'Refund not available. You may have already claimed or have no contribution.';
            }

            alert(`❌ Refund failed: ${message}`);
        } finally {
            setIsClaiming(null);
        }
    };

    const refundableCampaigns = campaigns.filter(c => userContributions.has(c.id));
    const otherFailedCampaigns = campaigns.filter(c => !userContributions.has(c.id));

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

            {/* Header */}
            <section style={{ marginBottom: '48px' }}>
                <h1 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '12px' }}>Claim Refunds</h1>
                <p style={{ color: '#9CA3AF', fontSize: '18px' }}>
                    If a campaign fails verification, your contributions are automatically refundable.
                </p>
            </section>

            {!walletAddress && (
                <div className="glass-card" style={{ textAlign: 'center', padding: '48px' }}>
                    <AlertTriangle style={{ width: '48px', height: '48px', color: '#FBB524', margin: '0 auto 16px' }} />
                    <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Connect Your Wallet</h2>
                    <p style={{ color: '#9CA3AF' }}>Please connect your wallet to view refundable campaigns.</p>
                </div>
            )}

            {walletAddress && refundableCampaigns.length === 0 && otherFailedCampaigns.length === 0 && (
                <div className="glass-card" style={{ textAlign: 'center', padding: '48px' }}>
                    <CheckCircle style={{ width: '48px', height: '48px', color: '#B6F35C', margin: '0 auto 16px' }} />
                    <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>No Failed Campaigns</h2>
                    <p style={{ color: '#9CA3AF' }}>
                        Great news! There are no failed campaigns at the moment.
                        All your contributions are safe.
                    </p>
                </div>
            )}

            {/* Refundable Campaigns */}
            {refundableCampaigns.length > 0 && (
                <section style={{ marginBottom: '48px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px', color: '#EF4444' }}>
                        🔴 Your Refundable Contributions
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {refundableCampaigns.map(campaign => (
                            <div key={campaign.id} className="glass-card" style={{ borderLeft: '4px solid #EF4444' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                                    <div>
                                        <h3 style={{ fontWeight: 600, marginBottom: '8px' }}>{campaign.title}</h3>
                                        <p style={{ fontSize: '14px', color: '#9CA3AF', marginBottom: '12px' }}>
                                            Campaign ID: {campaign.id} • Status: <span style={{ color: '#EF4444' }}>FAILED</span>
                                        </p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <DollarSign style={{ width: '20px', height: '20px', color: '#B6F35C' }} />
                                            <span style={{ fontSize: '24px', fontWeight: 700, color: '#B6F35C', fontFamily: 'JetBrains Mono, monospace' }}>
                                                {userContributions.get(campaign.id)} MON
                                            </span>
                                            <span style={{ color: '#9CA3AF' }}>available</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleClaimRefund(campaign.id)}
                                        disabled={isClaiming === campaign.id}
                                        className="btn-neon"
                                        style={{ whiteSpace: 'nowrap' }}
                                    >
                                        {isClaiming === campaign.id ? 'Claiming...' : 'Claim Refund'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Other Failed Campaigns (no user contribution) */}
            {otherFailedCampaigns.length > 0 && walletAddress && (
                <section>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px', color: '#9CA3AF' }}>
                        Other Failed Campaigns
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {otherFailedCampaigns.map(campaign => (
                            <div key={campaign.id} className="glass" style={{ padding: '20px', borderRadius: '16px', opacity: 0.7 }}>
                                <h3 style={{ fontWeight: 600, marginBottom: '4px' }}>{campaign.title}</h3>
                                <p style={{ fontSize: '14px', color: '#6B7280' }}>
                                    Campaign ID: {campaign.id} • You have no contribution to refund
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Info Card */}
            <section style={{ marginTop: '48px' }}>
                <div className="glass" style={{ padding: '24px', borderRadius: '16px' }}>
                    <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>How Refunds Work</h3>
                    <ul style={{ fontSize: '14px', color: '#9CA3AF', lineHeight: 2 }}>
                        <li>• When a milestone verification fails, the campaign is marked as <strong style={{ color: '#EF4444' }}>FAILED</strong></li>
                        <li>• All contributors can claim a full refund of their contributions</li>
                        <li>• Refunds are processed directly from the smart contract escrow</li>
                        <li>• Each contribution can only be refunded once</li>
                    </ul>
                </div>
            </section>
        </div>
    );
}
