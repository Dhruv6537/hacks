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

    const stats = [
        {
            icon: <DollarSign style={{ width: '20px', height: '20px', color: 'var(--accent)' }} />,
            bg: 'var(--accent-light)',
            label: 'Total Locked',
            value: `${totalFundsLocked.toFixed(4)}`,
            suffix: 'MON'
        },
        {
            icon: <Activity style={{ width: '20px', height: '20px', color: 'var(--success)' }} />,
            bg: 'var(--success-light)',
            label: 'Active Campaigns',
            value: `${activeCampaigns}`,
            suffix: ''
        },
        {
            icon: <Shield style={{ width: '20px', height: '20px', color: 'var(--warning)' }} />,
            bg: 'var(--warning-light)',
            label: 'Verifications',
            value: `${totalVerifications}`,
            suffix: ''
        },
        {
            icon: <TrendingUp style={{ width: '20px', height: '20px', color: 'var(--success)' }} />,
            bg: 'var(--success-light)',
            label: 'Completed',
            value: `${completedCampaigns}`,
            suffix: ''
        },
    ];

    return (
        <div>
            {/* Header */}
            <section className="animate-fade-in-up" style={{ marginBottom: '36px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.03em' }}>Your Dashboard</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>Track your investments and campaign activity</p>
            </section>

            {/* Stats */}
            <section className="animate-fade-in-up" style={{ marginBottom: '44px', animationDelay: '60ms' }}>
                <div className="card-grid-4 stagger">
                    {stats.map((stat, i) => (
                        <div key={i} className="card" style={{ padding: '22px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                                <div className="icon-box" style={{ background: stat.bg, width: '42px', height: '42px', borderRadius: 'var(--radius)' }}>
                                    {stat.icon}
                                </div>
                                <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>{stat.label}</span>
                            </div>
                            <div style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                                {stat.value}
                                {stat.suffix && <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '6px' }}>{stat.suffix}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Your Investments */}
            <section className="animate-fade-in-up" style={{ marginBottom: '44px', animationDelay: '120ms' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 700, letterSpacing: '-0.01em' }}>Your Investments</h2>
                    <Link to="/explore" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                        Explore more <ArrowRight style={{ width: '14px', height: '14px' }} />
                    </Link>
                </div>

                {backedCampaigns.length === 0 ? (
                    <div className="card-flat" style={{ textAlign: 'center', padding: '56px 24px' }}>
                        <div style={{
                            width: '56px', height: '56px', borderRadius: '50%', background: 'var(--bg-tertiary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
                        }}>
                            <Wallet style={{ width: '28px', height: '28px', color: 'var(--text-muted)' }} />
                        </div>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '15px' }}>You haven't backed any campaigns yet</p>
                        <Link to="/explore" className="btn btn-primary">
                            Explore campaigns
                        </Link>
                    </div>
                ) : (
                    <div className="card-grid-2">
                        {backedCampaigns.slice(0, 4).map(campaign => (
                            <Link key={campaign.id} to={`/campaign/${campaign.id}`} className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                                    <div>
                                        <h3 style={{ fontWeight: 700, marginBottom: '4px' }}>{campaign.title}</h3>
                                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{campaign.raisedAmount} raised</p>
                                    </div>
                                    {campaign.milestones.some(m => m.state === 'PASSED') ? (
                                        <span className="pill pill-verified" style={{ fontSize: '11px', padding: '4px 10px' }}>
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
            <section className="animate-fade-in-up" style={{ animationDelay: '180ms' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '20px', letterSpacing: '-0.01em' }}>Recent Verification Activity</h2>

                {recentActivity.length === 0 ? (
                    <div className="card-flat" style={{ textAlign: 'center', padding: '56px 24px' }}>
                        <div style={{
                            width: '56px', height: '56px', borderRadius: '50%', background: 'var(--bg-tertiary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
                        }}>
                            <Shield style={{ width: '28px', height: '28px', color: 'var(--text-muted)' }} />
                        </div>
                        <p style={{ color: 'var(--text-muted)' }}>No verification activity yet</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {recentActivity.map((item, i) => (
                            <Link key={i} to={`/campaign/${item.campaignId}`} className="card" style={{ textDecoration: 'none', color: 'inherit', padding: '16px 22px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <div style={{
                                            width: '36px', height: '36px', borderRadius: '50%',
                                            background: item.status === 'PASS' ? 'var(--success-light)' : 'var(--danger-light)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {item.status === 'PASS' ? (
                                                <CheckCircle style={{ width: '18px', height: '18px', color: 'var(--success)' }} />
                                            ) : (
                                                <AlertCircle style={{ width: '18px', height: '18px', color: 'var(--danger)' }} />
                                            )}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, marginBottom: '2px' }}>{item.campaign}</div>
                                            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{item.milestone}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{item.confidence}%</span>
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
