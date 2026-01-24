import { Link } from 'react-router-dom';
import { Shield, Lock, CheckCircle, Users, ArrowRight, Zap, Eye, Vote } from 'lucide-react';

export default function Landing() {
    return (
        <div>
            {/* Hero Section */}
            <section style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '48px',
                alignItems: 'center',
                padding: '48px 0 80px'
            }} className="hero-grid">
                <div>
                    <h1 style={{
                        fontSize: '3rem',
                        fontWeight: 700,
                        lineHeight: 1.1,
                        marginBottom: '24px',
                        letterSpacing: '-0.02em'
                    }}>
                        AI‑verified Web3 crowdfunding.
                    </h1>
                    <p style={{
                        fontSize: '1.125rem',
                        color: 'var(--text-muted)',
                        lineHeight: 1.7,
                        marginBottom: '32px',
                        maxWidth: '520px'
                    }}>
                        DeFund locks backers' funds in smart contracts and uses AI to verify project milestones before release. No more failed projects, no more lost funds.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <Link to="/create" className="btn btn-primary btn-lg">
                            Launch a campaign
                            <ArrowRight style={{ width: '18px', height: '18px' }} />
                        </Link>
                        <Link to="/explore" className="btn btn-ghost btn-lg">
                            Explore campaigns
                        </Link>
                    </div>
                </div>

                {/* Hero Visual - Simple Campaign Card Mock */}
                <div style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-xl)',
                    padding: '24px',
                    border: '1px solid var(--border)'
                }}>
                    <div className="card" style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <div>
                                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>DeFi Analytics Platform</h3>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>by 0x8a3d...2f91</p>
                            </div>
                            <span className="pill pill-verified">
                                <CheckCircle style={{ width: '14px', height: '14px' }} />
                                AI Verified
                            </span>
                        </div>
                        <div className="progress-bar" style={{ marginBottom: '12px' }}>
                            <div className="progress-fill" style={{ width: '75%' }}></div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>7.5 / 10 MON</span>
                            <span style={{ fontWeight: 500, color: 'var(--success)' }}>75% funded</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <span className="tag">DeFi</span>
                        <span className="tag">Analytics</span>
                        <span className="tag">Monad</span>
                    </div>
                </div>
            </section>

            {/* How DeFund Works */}
            <section style={{ padding: '80px 0', borderTop: '1px solid var(--border)' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '16px', textAlign: 'center' }}>
                    How DeFund keeps crowdfunding honest.
                </h2>
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px' }}>
                    Three simple steps to trustworthy crowdfunding on the blockchain.
                </p>

                <div className="card-grid-3">
                    <div className="card-flat" style={{ textAlign: 'center', padding: '32px 24px' }}>
                        <div className="icon-box" style={{ margin: '0 auto 20px', background: 'var(--accent-light)' }}>
                            <Zap style={{ width: '24px', height: '24px', color: 'var(--accent)' }} />
                        </div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>Create campaign</h3>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                            Define your project milestones, set funding targets, and launch in minutes.
                        </p>
                    </div>

                    <div className="card-flat" style={{ textAlign: 'center', padding: '32px 24px' }}>
                        <div className="icon-box" style={{ margin: '0 auto 20px', background: 'var(--accent-light)' }}>
                            <Lock style={{ width: '24px', height: '24px', color: 'var(--accent)' }} />
                        </div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>Funds locked on-chain</h3>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                            Backer deposits go into a smart contract. Creators can't access funds until milestones are verified.
                        </p>
                    </div>

                    <div className="card-flat" style={{ textAlign: 'center', padding: '32px 24px' }}>
                        <div className="icon-box" style={{ margin: '0 auto 20px', background: 'var(--success-light)' }}>
                            <Shield style={{ width: '24px', height: '24px', color: 'var(--success)' }} />
                        </div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>AI verifies milestones</h3>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                            Our AI checks proof of work before releasing funds. Verified milestones unlock payments.
                        </p>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section style={{ padding: '80px 0', background: 'var(--bg-secondary)', margin: '0 -16px', paddingLeft: '16px', paddingRight: '16px' }}>
                <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '48px', textAlign: 'center' }}>
                        Built for creators and backers.
                    </h2>

                    <div className="card-grid-2" style={{ gap: '20px' }}>
                        <div className="card" style={{ background: 'var(--bg-primary)' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                <div className="icon-box" style={{ flexShrink: 0, background: 'var(--accent-light)' }}>
                                    <Lock style={{ width: '20px', height: '20px', color: 'var(--accent)' }} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '6px' }}>On-chain escrow</h3>
                                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                        All funds are held in audited smart contracts. No intermediaries, no hidden fees.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ background: 'var(--bg-primary)' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                <div className="icon-box" style={{ flexShrink: 0, background: 'var(--success-light)' }}>
                                    <Shield style={{ width: '20px', height: '20px', color: 'var(--success)' }} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '6px' }}>AI verification engine</h3>
                                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                        Our AI analyzes code, docs, and deliverables to verify milestone completion.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ background: 'var(--bg-primary)' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                <div className="icon-box" style={{ flexShrink: 0, background: 'var(--warning-light)' }}>
                                    <Eye style={{ width: '20px', height: '20px', color: 'var(--warning)' }} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '6px' }}>Transparent tracking</h3>
                                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                        Every milestone, every verification, every fund release is visible on-chain.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ background: 'var(--bg-primary)' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                <div className="icon-box" style={{ flexShrink: 0, background: 'var(--danger-light)' }}>
                                    <Vote style={{ width: '20px', height: '20px', color: 'var(--danger)' }} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '6px' }}>Backer protection</h3>
                                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                        Failed milestones trigger automatic refunds. Your investment is protected.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section style={{ padding: '80px 0', borderBottom: '1px solid var(--border)' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '48px', textAlign: 'center' }}>
                    Trust, transparency, and alignment.
                </h2>

                <div className="card-grid-3" style={{ textAlign: 'center' }}>
                    <div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '8px' }}>20+</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>MON locked safely</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '8px' }}>7</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Campaigns launched</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--success)', marginBottom: '8px' }}>85%</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Milestones verified by AI</div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginTop: '48px', opacity: 0.4 }}>
                    <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Built on Monad Testnet</span>
                </div>
            </section>

            {/* Final CTA */}
            <section style={{ padding: '80px 0', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '16px' }}>
                    Launch your next idea with verifiable trust.
                </h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
                    Create a campaign in minutes. Get funded with confidence.
                </p>
                <Link to="/create" className="btn btn-primary btn-lg">
                    Launch a campaign
                    <ArrowRight style={{ width: '18px', height: '18px' }} />
                </Link>
            </section>

            <style>{`
                @media (min-width: 768px) {
                    .hero-grid {
                        grid-template-columns: 1fr 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
}
