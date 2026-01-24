import { Link } from 'react-router-dom';
import {
    Zap,
    TrendingUp,
    CheckCircle,
    AlertCircle,
    ArrowRight,
    DollarSign,
    Activity,
    Shield
} from 'lucide-react';

export default function Dashboard() {
    const metrics = [
        { label: 'Total Funds Locked', value: '24.5', unit: 'MON', icon: DollarSign, color: '#B6F35C' },
        { label: 'Active Campaigns', value: '8', unit: '', icon: Activity, color: '#60A5FA' },
        { label: 'Verifications Today', value: '12', unit: '', icon: Shield, color: '#A78BFA' },
        { label: 'Successful Releases', value: '23', unit: '', icon: TrendingUp, color: '#4ADE80' },
    ];

    const recentActivity = [
        { campaign: 'DeFi Analytics', milestone: 'MVP Launch', status: 'PASS', confidence: 87, time: '2 mins ago' },
        { campaign: 'NFT Marketplace', milestone: 'Smart Contracts', status: 'PASS', confidence: 92, time: '15 mins ago' },
        { campaign: 'DAO Governance', milestone: 'Phase 1', status: 'FAIL', confidence: 45, time: '1 hour ago' },
    ];

    return (
        <div>
            {/* Hero Section */}
            <section style={{ textAlign: 'center', paddingTop: '48px', paddingBottom: '48px', marginBottom: '64px' }}>
                <div className="glass" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 24px',
                    borderRadius: '9999px',
                    marginBottom: '32px'
                }}>
                    <Zap style={{ width: '18px', height: '18px', color: '#B6F35C' }} />
                    <span style={{ color: '#9CA3AF', fontSize: '14px' }}>Powered by Multi-Agent AI Consensus</span>
                </div>

                <h1 style={{
                    fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                    fontWeight: 700,
                    lineHeight: 1.1,
                    marginBottom: '24px'
                }}>
                    AI-Verified<br />
                    <span className="text-gradient">Crowdfunding</span>
                </h1>

                <p style={{
                    color: '#9CA3AF',
                    fontSize: '18px',
                    maxWidth: '600px',
                    margin: '0 auto 40px',
                    lineHeight: 1.7
                }}>
                    Trustless funding with autonomous escrow. AI agents verify milestones,
                    smart contracts release funds automatically.
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
                    <Link to="/create" className="btn-neon">
                        Create Campaign
                        <ArrowRight style={{ width: '20px', height: '20px' }} />
                    </Link>
                    <Link to="/campaigns" className="btn-secondary">
                        Explore Campaigns
                    </Link>
                </div>
            </section>

            {/* Metrics Grid */}
            <section style={{ marginBottom: '64px' }}>
                <div className="card-grid-4">
                    {metrics.map((metric, i) => {
                        const Icon = metric.icon;
                        return (
                            <div key={i} className="glass-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '12px' }}>{metric.label}</p>
                                        <p style={{ fontSize: '36px', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                                            {metric.value}
                                            {metric.unit && <span style={{ fontSize: '16px', color: '#9CA3AF', marginLeft: '6px' }}>{metric.unit}</span>}
                                        </p>
                                    </div>
                                    <div className="icon-box glass" style={{ color: metric.color }}>
                                        <Icon style={{ width: '28px', height: '28px' }} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* AI Activity Panel */}
            <section style={{ marginBottom: '64px' }}>
                <div className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Live AI Verification Activity</h2>
                        <Link to="/verification" style={{ color: '#B6F35C', fontSize: '14px', textDecoration: 'none' }}>
                            View All →
                        </Link>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {recentActivity.map((activity, i) => (
                            <div key={i} className="glass" style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '24px',
                                borderRadius: '16px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    {activity.status === 'PASS' ? (
                                        <CheckCircle style={{ width: '40px', height: '40px', color: '#B6F35C' }} />
                                    ) : (
                                        <AlertCircle style={{ width: '40px', height: '40px', color: '#EF4444' }} />
                                    )}
                                    <div>
                                        <p style={{ fontWeight: 600, fontSize: '18px', marginBottom: '4px' }}>{activity.campaign}</p>
                                        <p style={{ color: '#9CA3AF', fontSize: '14px' }}>{activity.milestone}</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <span className={`badge ${activity.status === 'PASS' ? 'badge-pass' : 'badge-fail'}`}>
                                            {activity.status}
                                        </span>
                                        <p style={{ color: '#9CA3AF', fontSize: '14px', marginTop: '8px' }}>{activity.confidence}% confidence</p>
                                    </div>
                                    <span style={{ color: '#6B7280', fontSize: '12px', minWidth: '80px', textAlign: 'right' }}>{activity.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section>
                <div className="card-grid-3">
                    <div className="glass-card" style={{ textAlign: 'center' }}>
                        <div className="icon-box-lg" style={{
                            margin: '0 auto 24px',
                            background: 'linear-gradient(135deg, rgba(182,243,92,0.2) 0%, transparent 100%)'
                        }}>
                            <Shield style={{ width: '40px', height: '40px', color: '#B6F35C' }} />
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>AI Verification</h3>
                        <p style={{ color: '#9CA3AF', lineHeight: 1.7 }}>
                            Multi-agent consensus ensures fair milestone verification with no human bias
                        </p>
                    </div>

                    <div className="glass-card" style={{ textAlign: 'center' }}>
                        <div className="icon-box-lg" style={{
                            margin: '0 auto 24px',
                            background: 'linear-gradient(135deg, rgba(96,165,250,0.2) 0%, transparent 100%)'
                        }}>
                            <DollarSign style={{ width: '40px', height: '40px', color: '#60A5FA' }} />
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>Autonomous Escrow</h3>
                        <p style={{ color: '#9CA3AF', lineHeight: 1.7 }}>
                            Funds are locked in smart contracts, released only when milestones pass
                        </p>
                    </div>

                    <div className="glass-card" style={{ textAlign: 'center' }}>
                        <div className="icon-box-lg" style={{
                            margin: '0 auto 24px',
                            background: 'linear-gradient(135deg, rgba(167,139,250,0.2) 0%, transparent 100%)'
                        }}>
                            <Zap style={{ width: '40px', height: '40px', color: '#A78BFA' }} />
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>Lightning Fast</h3>
                        <p style={{ color: '#9CA3AF', lineHeight: 1.7 }}>
                            Optimized for speed with real-time verification and instant fund releases
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
