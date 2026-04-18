import { Link } from 'react-router-dom';
import { Shield, Lock, CheckCircle, ArrowRight, Zap, Eye, Vote } from 'lucide-react';

export default function Landing() {
    return (
        <div>
            {/* Hero Section */}
            <section className="hero-section" style={{ borderRadius: '0 0 var(--radius-2xl) var(--radius-2xl)' }}>
                <div style={{ maxWidth: '1160px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr',
                        gap: '48px',
                        alignItems: 'center',
                    }} className="hero-grid">
                        <div className="animate-fade-in-up">
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 16px',
                                background: 'var(--accent-light)',
                                borderRadius: '9999px',
                                fontSize: '13px',
                                fontWeight: 600,
                                color: 'var(--accent)',
                                marginBottom: '24px',
                                border: '1px solid var(--accent-glow)',
                            }}>
                                <Zap style={{ width: '14px', height: '14px' }} />
                                Powered by Monad & Gemini AI
                            </div>
                            <h1 style={{
                                fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
                                fontWeight: 800,
                                lineHeight: 1.08,
                                marginBottom: '24px',
                                letterSpacing: '-0.04em'
                            }}>
                                AI‑verified
                                <br />
                                <span className="text-gradient">Web3 crowdfunding.</span>
                            </h1>
                            <p style={{
                                fontSize: '1.125rem',
                                color: 'var(--text-muted)',
                                lineHeight: 1.7,
                                marginBottom: '36px',
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

                        {/* Hero Visual — Mock Campaign Card */}
                        <div className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                            <div style={{
                                background: 'var(--bg-primary)',
                                borderRadius: 'var(--radius-xl)',
                                padding: '28px',
                                border: '1px solid var(--border)',
                                boxShadow: 'var(--shadow-lg)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                {/* Decorative gradient */}
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '4px',
                                    background: 'var(--gradient-accent)',
                                    borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0'
                                }} />

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                    <div>
                                        <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '4px' }}>DeFi Analytics Platform</h3>
                                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>by 0x8a3d...2f91</p>
                                    </div>
                                    <span className="pill pill-verified">
                                        <CheckCircle style={{ width: '14px', height: '14px' }} />
                                        AI Verified
                                    </span>
                                </div>
                                <div className="progress-bar" style={{ marginBottom: '14px', height: '10px' }}>
                                    <div className="progress-fill" style={{ width: '75%' }}></div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '20px' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>7.5 / 10 MON</span>
                                    <span style={{ fontWeight: 700, color: 'var(--success)' }}>75% funded</span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <span className="tag">DeFi</span>
                                    <span className="tag">Analytics</span>
                                    <span className="tag">Monad</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How DeFund Works */}
            <section style={{ padding: '96px 0 80px' }}>
                <div className="animate-fade-in-up" style={{ textAlign: 'center', marginBottom: '56px' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.03em' }}>
                        How DeFund keeps crowdfunding honest.
                    </h2>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '560px', margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.7 }}>
                        Three simple steps to trustworthy crowdfunding on the blockchain.
                    </p>
                </div>

                <div className="card-grid-3 stagger">
                    <div className="feature-card" style={{ textAlign: 'center' }}>
                        <div className="icon-box" style={{ margin: '0 auto 20px', background: 'var(--accent-light)', width: '56px', height: '56px' }}>
                            <Zap style={{ width: '26px', height: '26px', color: 'var(--accent)' }} />
                        </div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '10px' }}>Create campaign</h3>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                            Define your project milestones, set funding targets, and launch in minutes.
                        </p>
                    </div>

                    <div className="feature-card" style={{ textAlign: 'center' }}>
                        <div className="icon-box" style={{ margin: '0 auto 20px', background: 'var(--accent-light)', width: '56px', height: '56px' }}>
                            <Lock style={{ width: '26px', height: '26px', color: 'var(--accent)' }} />
                        </div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '10px' }}>Funds locked on-chain</h3>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                            Backer deposits go into a smart contract. Creators can't access funds until milestones are verified.
                        </p>
                    </div>

                    <div className="feature-card" style={{ textAlign: 'center' }}>
                        <div className="icon-box" style={{ margin: '0 auto 20px', background: 'var(--success-light)', width: '56px', height: '56px' }}>
                            <Shield style={{ width: '26px', height: '26px', color: 'var(--success)' }} />
                        </div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '10px' }}>AI verifies milestones</h3>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                            Our AI checks proof of work before releasing funds. Verified milestones unlock payments.
                        </p>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section style={{
                padding: '80px 0',
                background: 'var(--bg-secondary)',
                margin: '0 -20px',
                paddingLeft: '20px',
                paddingRight: '20px',
                borderRadius: 'var(--radius-2xl)',
                transition: 'background-color 0.35s'
            }}>
                <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '48px', textAlign: 'center', letterSpacing: '-0.03em' }}>
                        Built for creators and backers.
                    </h2>

                    <div className="card-grid-2 stagger" style={{ gap: '16px' }}>
                        {[
                            {
                                icon: <Lock style={{ width: '22px', height: '22px', color: 'var(--accent)' }} />,
                                bg: 'var(--accent-light)',
                                title: 'On-chain escrow',
                                desc: 'All funds are held in audited smart contracts. No intermediaries, no hidden fees.'
                            },
                            {
                                icon: <Shield style={{ width: '22px', height: '22px', color: 'var(--success)' }} />,
                                bg: 'var(--success-light)',
                                title: 'AI verification engine',
                                desc: 'Our AI analyzes code, docs, and deliverables to verify milestone completion.'
                            },
                            {
                                icon: <Eye style={{ width: '22px', height: '22px', color: 'var(--warning)' }} />,
                                bg: 'var(--warning-light)',
                                title: 'Transparent tracking',
                                desc: 'Every milestone, every verification, every fund release is visible on-chain.'
                            },
                            {
                                icon: <Vote style={{ width: '22px', height: '22px', color: 'var(--danger)' }} />,
                                bg: 'var(--danger-light)',
                                title: 'Backer protection',
                                desc: 'Failed milestones trigger automatic refunds. Your investment is protected.'
                            }
                        ].map((feature, i) => (
                            <div key={i} className="card" style={{ background: 'var(--bg-primary)' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                    <div className="icon-box" style={{ flexShrink: 0, background: feature.bg }}>
                                        {feature.icon}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>{feature.title}</h3>
                                        <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                                            {feature.desc}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section style={{ padding: '96px 0', borderBottom: '1px solid var(--border)' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '56px', textAlign: 'center', letterSpacing: '-0.03em' }}>
                    Trust, transparency, and alignment.
                </h2>

                <div className="card-grid-3 stagger" style={{ textAlign: 'center' }}>
                    <div className="animate-fade-in-up">
                        <div className="stat-number" style={{ marginBottom: '10px' }}>20+</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>MON locked safely</div>
                    </div>
                    <div className="animate-fade-in-up">
                        <div className="stat-number" style={{ marginBottom: '10px' }}>7</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>Campaigns launched</div>
                    </div>
                    <div className="animate-fade-in-up">
                        <div className="stat-number-success" style={{ marginBottom: '10px' }}>85%</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>Milestones verified by AI</div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginTop: '56px', opacity: 0.5 }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>Built on Monad Testnet</span>
                </div>
            </section>

            {/* Final CTA */}
            <section style={{ padding: '96px 0', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.03em' }}>
                    Launch your next idea with verifiable trust.
                </h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '36px', fontSize: '1.05rem' }}>
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
