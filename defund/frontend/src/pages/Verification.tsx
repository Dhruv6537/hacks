import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, CheckCircle, XCircle, Brain, Zap, Eye } from 'lucide-react';
import { campaignStore, type Campaign } from '../store/campaigns';

interface VerificationRecord {
    campaignId: number;
    campaignTitle: string;
    milestoneIndex: number;
    milestoneDescription: string;
    passed: boolean;
    confidence: number;
}

export default function Verification() {
    const [selectedRecord, setSelectedRecord] = useState<VerificationRecord | null>(null);
    const [verifications, setVerifications] = useState<VerificationRecord[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);

    useEffect(() => {
        const loadData = async () => {
            await campaignStore.fetchCampaigns();
            const allCampaigns = campaignStore.getAll().filter(c => c.id < 1000);
            setCampaigns(allCampaigns);

            const records: VerificationRecord[] = [];
            allCampaigns.forEach(campaign => {
                campaign.milestones.forEach((milestone, index) => {
                    if (milestone.state === 'PASSED' || milestone.state === 'FAILED') {
                        records.push({
                            campaignId: campaign.id,
                            campaignTitle: campaign.title,
                            milestoneIndex: index,
                            milestoneDescription: milestone.description,
                            passed: milestone.state === 'PASSED',
                            confidence: milestone.state === 'PASSED' ? 85 : 42
                        });
                    }
                });
            });
            setVerifications(records);
        };

        loadData();
        const unsubscribe = campaignStore.subscribe(() => {
            setCampaigns(campaignStore.getAll().filter(c => c.id < 1000));
        });
        return () => unsubscribe();
    }, []);

    const totalVerifications = verifications.length;
    const passedCount = verifications.filter(v => v.passed).length;
    const passRate = totalVerifications > 0 ? Math.round((passedCount / totalVerifications) * 100) : 0;
    const avgConfidence = totalVerifications > 0
        ? Math.round(verifications.reduce((sum, v) => sum + v.confidence, 0) / totalVerifications)
        : 0;

    return (
        <div>
            {/* Header */}
            <section className="animate-fade-in-up" style={{ marginBottom: '36px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.03em' }}>How it works</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>Transparent AI verification for every milestone</p>
            </section>

            {/* How it works */}
            <section className="animate-fade-in-up" style={{ marginBottom: '48px', animationDelay: '60ms' }}>
                <div className="card" style={{ padding: '36px', overflow: 'hidden', position: 'relative' }}>
                    {/* Gradient accent */}
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                        background: 'var(--gradient-accent)',
                        borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0'
                    }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '22px' }}>
                        <div style={{
                            width: '48px', height: '48px', borderRadius: 'var(--radius-lg)',
                            background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Brain style={{ width: '26px', height: '26px', color: 'var(--accent)' }} />
                        </div>
                        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em' }}>AI Verification Engine</h2>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', lineHeight: 1.7, fontSize: '15px', maxWidth: '700px' }}>
                        When creators submit proof of milestone completion, our AI analyzes the evidence (GitHub repos, documents, demos)
                        and determines if the deliverables match the milestone requirements. Verified milestones unlock funds automatically.
                    </p>
                    <div className="card-grid-3 stagger">
                        {[
                            {
                                icon: <Eye style={{ width: '26px', height: '26px', color: 'var(--accent)' }} />,
                                bg: 'var(--accent-light)',
                                title: 'Proof Analysis',
                                desc: 'Examines submitted URLs and evidence'
                            },
                            {
                                icon: <Zap style={{ width: '26px', height: '26px', color: 'var(--warning)' }} />,
                                bg: 'var(--warning-light)',
                                title: 'Instant Decision',
                                desc: 'Results in seconds, not days'
                            },
                            {
                                icon: <Shield style={{ width: '26px', height: '26px', color: 'var(--success)' }} />,
                                bg: 'var(--success-light)',
                                title: 'On-chain Record',
                                desc: 'All decisions stored permanently'
                            }
                        ].map((item, i) => (
                            <div key={i} className="feature-card" style={{ textAlign: 'center', padding: '28px 22px' }}>
                                <div className="icon-box" style={{
                                    margin: '0 auto 16px', background: item.bg,
                                    width: '52px', height: '52px', borderRadius: '50%'
                                }}>
                                    {item.icon}
                                </div>
                                <h4 style={{ fontWeight: 700, marginBottom: '6px' }}>{item.title}</h4>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="animate-fade-in-up" style={{ marginBottom: '48px', animationDelay: '120ms' }}>
                <div className="card-grid-4 stagger">
                    {[
                        { value: totalVerifications, label: 'Total Verifications', color: 'var(--accent)' },
                        { value: `${passRate}%`, label: 'Pass Rate', color: 'var(--success)' },
                        { value: `${avgConfidence}%`, label: 'Avg Confidence', color: 'var(--accent)' },
                        { value: campaigns.length, label: 'Campaigns', color: 'var(--text-primary)' },
                    ].map((stat, i) => (
                        <div key={i} className="card" style={{ textAlign: 'center', padding: '24px 18px' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: stat.color, letterSpacing: '-0.03em', marginBottom: '4px' }}>
                                {stat.value}
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Recent Verifications */}
            <section className="animate-fade-in-up" style={{ animationDelay: '180ms' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '20px', letterSpacing: '-0.01em' }}>Recent Verifications</h2>

                {verifications.length === 0 ? (
                    <div className="card-flat" style={{ textAlign: 'center', padding: '64px 24px' }}>
                        <div style={{
                            width: '56px', height: '56px', borderRadius: '50%', background: 'var(--bg-tertiary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
                        }}>
                            <Shield style={{ width: '28px', height: '28px', color: 'var(--text-muted)' }} />
                        </div>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>No verifications yet</p>
                        <Link to="/explore" className="btn btn-ghost">Explore campaigns</Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {verifications.map((record, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedRecord(record)}
                                className="card"
                                style={{
                                    width: '100%',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    padding: '16px 22px',
                                    border: selectedRecord === record ? '2px solid var(--accent)' : undefined,
                                    boxShadow: selectedRecord === record ? 'var(--shadow-glow)' : undefined,
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <div style={{
                                            width: '38px', height: '38px', borderRadius: '50%',
                                            background: record.passed ? 'var(--success-light)' : 'var(--danger-light)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                        }}>
                                            {record.passed ? (
                                                <CheckCircle style={{ width: '20px', height: '20px', color: 'var(--success)' }} />
                                            ) : (
                                                <XCircle style={{ width: '20px', height: '20px', color: 'var(--danger)' }} />
                                            )}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, marginBottom: '2px' }}>{record.campaignTitle}</div>
                                            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                                Milestone {record.milestoneIndex + 1}: {record.milestoneDescription}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>{record.confidence}%</span>
                                        <span className={`badge ${record.passed ? 'badge-success' : 'badge-fail'}`}>
                                            {record.passed ? 'PASS' : 'FAIL'}
                                        </span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* Detail Panel */}
                {selectedRecord && (
                    <div className="card animate-fade-in" style={{ marginTop: '24px', overflow: 'hidden', position: 'relative' }}>
                        {/* Gradient accent */}
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                            background: selectedRecord.passed ? 'linear-gradient(90deg, var(--success), #34D399)' : 'linear-gradient(90deg, var(--danger), #F87171)'
                        }} />
                        <h3 style={{ fontWeight: 700, marginBottom: '18px', paddingTop: '4px' }}>Verification Details</h3>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '18px', padding: '22px',
                            background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)',
                            marginBottom: '18px', border: '1px solid var(--border)'
                        }}>
                            <div style={{
                                width: '52px', height: '52px', borderRadius: '50%',
                                background: selectedRecord.passed ? 'var(--success-light)' : 'var(--danger-light)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                            }}>
                                {selectedRecord.passed ? (
                                    <CheckCircle style={{ width: '28px', height: '28px', color: 'var(--success)' }} />
                                ) : (
                                    <XCircle style={{ width: '28px', height: '28px', color: 'var(--danger)' }} />
                                )}
                            </div>
                            <div>
                                <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>{selectedRecord.passed ? 'PASSED' : 'FAILED'}</div>
                                <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Confidence: {selectedRecord.confidence}%</div>
                            </div>
                        </div>
                        <Link to={`/campaign/${selectedRecord.campaignId}`} className="btn btn-ghost">
                            View Campaign
                        </Link>
                    </div>
                )}
            </section>
        </div>
    );
}
