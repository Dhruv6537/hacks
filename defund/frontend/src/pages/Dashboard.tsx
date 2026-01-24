import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    TrendingUp,
    CheckCircle,
    AlertCircle,
    ArrowRight,
    DollarSign,
    Activity,
    Shield,
    Wallet
} from 'lucide-react';
import { campaignStore, type Campaign } from '../store/campaigns';

export default function Dashboard() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);

    useEffect(() => {
        const loadData = async () => {
            await campaignStore.fetchCampaigns();
            setCampaigns(campaignStore.getAll());
        };
        loadData();

        const unsubscribe = campaignStore.subscribe(() => {
            setCampaigns(campaignStore.getAll());
        });

        return () => unsubscribe();
    }, []);

    // Calculate real metrics from campaigns (exclude demo IDs >= 1000)
    const realCampaigns = campaigns.filter(c => c.id < 1000);

    const parseAmount = (amount: string) => {
        const num = parseFloat(amount.replace(/[^0-9.]/g, ''));
        return isNaN(num) ? 0 : num;
    };

    const totalFundsLocked = realCampaigns.reduce((sum, c) => sum + parseAmount(c.raisedAmount), 0);
    const activeCampaigns = realCampaigns.filter(c => c.state === 'ACTIVE').length;
    const completedCampaigns = realCampaigns.filter(c => c.state === 'COMPLETED').length;
    const totalVerifications = realCampaigns.reduce((sum, c) =>
        sum + c.milestones.filter(m => m.state === 'PASSED' || m.state === 'FAILED').length, 0
    );

    const recentActivity = realCampaigns
        .flatMap(c => c.milestones
            .filter(m => m.state === 'PASSED' || m.state === 'FAILED')
            .map(m => ({
                campaign: c.title,
                campaignId: c.id,
                milestone: m.description,
                status: m.state === 'PASSED' ? 'PASS' : 'FAIL',
                confidence: 85
            }))
        )
        .slice(0, 5);

    const backedCampaigns = realCampaigns.filter(c => c.backers > 0);

    return (
        <div>
            {/* Header */}
            <section style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px' }}>Your Dashboard</h1>
                <p style={{ color: 'var(--text-muted)' }}>Track your investments and campaign activity</p>
            </section>

            {/* Stats */}
            <section style={{ marginBottom: '40px' }}>
                <div className="card-grid-4">
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <div className="icon-box" style={{ background: 'var(--accent-light)' }}>
                                <DollarSign style={{ width: '20px', height: '20px', color: 'var(--accent)' }} />
                            </div>
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Total Locked</span>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{totalFundsLocked.toFixed(4)} <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-muted)' }}>MON</span></div>
                    </div>

                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <div className="icon-box" style={{ background: 'var(--success-light)' }}>
                                <Activity style={{ width: '20px', height: '20px', color: 'var(--success)' }} />
                            </div>
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Active Campaigns</span>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{activeCampaigns}</div>
                    </div>

                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <div className="icon-box" style={{ background: 'var(--warning-light)' }}>
                                <Shield style={{ width: '20px', height: '20px', color: 'var(--warning)' }} />
                            </div>
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Verifications</span>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{totalVerifications}</div>
                    </div>

                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <div className="icon-box" style={{ background: 'var(--success-light)' }}>
                                <TrendingUp style={{ width: '20px', height: '20px', color: 'var(--success)' }} />
                            </div>
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Completed</span>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{completedCampaigns}</div>
                    </div>
                </div>
            </section>

            {/* Your Investments */}
            <section style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Your Investments</h2>
                    <Link to="/explore" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Explore more <ArrowRight style={{ width: '14px', height: '14px' }} />
                    </Link>
                </div>

                {backedCampaigns.length === 0 ? (
                    <div className="card-flat" style={{ textAlign: 'center', padding: '48px' }}>
                        <Wallet style={{ width: '40px', height: '40px', margin: '0 auto 16px', color: 'var(--text-muted)' }} />
                        <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>You haven't backed any campaigns yet</p>
                        <Link to="/explore" className="btn btn-primary">
                            Explore campaigns
                        </Link>
                    </div>
                ) : (
                    <div className="card-grid-2">
                        {backedCampaigns.slice(0, 4).map(campaign => (
                            <Link key={campaign.id} to={`/campaign/${campaign.id}`} className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                    <div>
                                        <h3 style={{ fontWeight: 600, marginBottom: '4px' }}>{campaign.title}</h3>
                                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{campaign.raisedAmount} raised</p>
                                    </div>
                                    {campaign.milestones.some(m => m.state === 'PASSED') ? (
                                        <span className="pill pill-verified" style={{ fontSize: '11px' }}>
                                            <CheckCircle style={{ width: '12px', height: '12px' }} /> Verified
                                        </span>
                                    ) : (
                                        <span className="badge badge-default">{campaign.state}</span>
                                    )}
                                </div>
                                <div className="progress-bar" style={{ height: '6px' }}>
                                    <div className="progress-fill" style={{ width: `${campaign.progress}%` }}></div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* Recent Verification Activity */}
            <section>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px' }}>Recent Verification Activity</h2>

                {recentActivity.length === 0 ? (
                    <div className="card-flat" style={{ textAlign: 'center', padding: '48px' }}>
                        <Shield style={{ width: '40px', height: '40px', margin: '0 auto 16px', color: 'var(--text-muted)' }} />
                        <p style={{ color: 'var(--text-muted)' }}>No verification activity yet</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {recentActivity.map((item, i) => (
                            <Link key={i} to={`/campaign/${item.campaignId}`} className="card" style={{ textDecoration: 'none', color: 'inherit', padding: '16px 20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        {item.status === 'PASS' ? (
                                            <CheckCircle style={{ width: '20px', height: '20px', color: 'var(--success)' }} />
                                        ) : (
                                            <AlertCircle style={{ width: '20px', height: '20px', color: 'var(--danger)' }} />
                                        )}
                                        <div>
                                            <div style={{ fontWeight: 500, marginBottom: '2px' }}>{item.campaign}</div>
                                            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{item.milestone}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{item.confidence}% confidence</span>
                                        <span className={`badge ${item.status === 'PASS' ? 'badge-success' : 'badge-fail'}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
