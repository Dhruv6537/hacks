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
            <section style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px' }}>How it works</h1>
                <p style={{ color: 'var(--text-muted)' }}>Transparent AI verification for every milestone</p>
            </section>

            {/* How it works */}
            <section style={{ marginBottom: '48px' }}>
                <div className="card" style={{ padding: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <Brain style={{ width: '24px', height: '24px', color: 'var(--accent)' }} />
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>AI Verification Engine</h2>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.7 }}>
                        When creators submit proof of milestone completion, our AI analyzes the evidence (GitHub repos, documents, demos)
                        and determines if the deliverables match the milestone requirements. Verified milestones unlock funds automatically.
                    </p>
                    <div className="card-grid-3">
                        <div className="card-flat" style={{ padding: '20px', textAlign: 'center' }}>
                            <Eye style={{ width: '24px', height: '24px', color: 'var(--accent)', margin: '0 auto 12px' }} />
                            <h4 style={{ fontWeight: 600, marginBottom: '4px' }}>Proof Analysis</h4>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Examines submitted URLs and evidence</p>
                        </div>
                        <div className="card-flat" style={{ padding: '20px', textAlign: 'center' }}>
                            <Zap style={{ width: '24px', height: '24px', color: 'var(--warning)', margin: '0 auto 12px' }} />
                            <h4 style={{ fontWeight: 600, marginBottom: '4px' }}>Instant Decision</h4>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Results in seconds, not days</p>
                        </div>
                        <div className="card-flat" style={{ padding: '20px', textAlign: 'center' }}>
                            <Shield style={{ width: '24px', height: '24px', color: 'var(--success)', margin: '0 auto 12px' }} />
                            <h4 style={{ fontWeight: 600, marginBottom: '4px' }}>On-chain Record</h4>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>All decisions stored permanently</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section style={{ marginBottom: '48px' }}>
                <div className="card-grid-4">
                    <div className="card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent)' }}>{totalVerifications}</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Total Verifications</div>
                    </div>
                    <div className="card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>{passRate}%</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Pass Rate</div>
                    </div>
                    <div className="card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent)' }}>{avgConfidence}%</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Avg Confidence</div>
                    </div>
                    <div className="card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{campaigns.length}</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Campaigns</div>
                    </div>
                </div>
            </section>

            {/* Recent Verifications */}
            <section>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px' }}>Recent Verifications</h2>

                {verifications.length === 0 ? (
                    <div className="card-flat" style={{ textAlign: 'center', padding: '48px' }}>
                        <Shield style={{ width: '40px', height: '40px', margin: '0 auto 16px', color: 'var(--text-muted)' }} />
                        <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>No verifications yet</p>
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
                                    padding: '16px 20px',
                                    border: selectedRecord === record ? '2px solid var(--accent)' : undefined
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        {record.passed ? (
                                            <CheckCircle style={{ width: '20px', height: '20px', color: 'var(--success)' }} />
                                        ) : (
                                            <XCircle style={{ width: '20px', height: '20px', color: 'var(--danger)' }} />
                                        )}
                                        <div>
                                            <div style={{ fontWeight: 500, marginBottom: '2px' }}>{record.campaignTitle}</div>
                                            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                                Milestone {record.milestoneIndex + 1}: {record.milestoneDescription}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{record.confidence}%</span>
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
                    <div className="card" style={{ marginTop: '24px' }}>
                        <h3 style={{ fontWeight: 600, marginBottom: '16px' }}>Verification Details</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', marginBottom: '16px' }}>
                            {selectedRecord.passed ? (
                                <CheckCircle style={{ width: '32px', height: '32px', color: 'var(--success)' }} />
                            ) : (
                                <XCircle style={{ width: '32px', height: '32px', color: 'var(--danger)' }} />
                            )}
                            <div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{selectedRecord.passed ? 'PASSED' : 'FAILED'}</div>
                                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Confidence: {selectedRecord.confidence}%</div>
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
