import { useState } from 'react';
import { Shield, CheckCircle, XCircle, Brain, Zap } from 'lucide-react';

interface AgentVote {
    agentId: string;
    vote: boolean;
    confidence: number;
    reasoning: string;
}

interface VerificationResult {
    passed: boolean;
    confidence: number;
    agentVotes: AgentVote[];
    finalDecision: 'PASS' | 'FAIL';
}

const demoVerifications: {
    campaignId: number;
    campaignTitle: string;
    milestoneIndex: number;
    milestoneDescription: string;
    result: VerificationResult;
    timestamp: string;
}[] = [
        {
            campaignId: 0,
            campaignTitle: 'DeFi Analytics Platform',
            milestoneIndex: 0,
            milestoneDescription: 'Complete smart contract development',
            result: {
                passed: true,
                confidence: 89,
                finalDecision: 'PASS',
                agentVotes: [
                    { agentId: 'Gemini-Technical', vote: true, confidence: 85, reasoning: 'Smart contracts are well-structured and follow best practices.' },
                    { agentId: 'Gemini-Analytical', vote: true, confidence: 92, reasoning: 'Code is documented and includes comprehensive tests.' },
                    { agentId: 'Gemini-Practical', vote: true, confidence: 90, reasoning: 'Functionality meets the milestone requirements.' },
                ],
            },
            timestamp: '2 minutes ago',
        },
        {
            campaignId: 1,
            campaignTitle: 'NFT Marketplace V2',
            milestoneIndex: 1,
            milestoneDescription: 'Launch beta testing phase',
            result: {
                passed: true,
                confidence: 78,
                finalDecision: 'PASS',
                agentVotes: [
                    { agentId: 'Gemini-Technical', vote: true, confidence: 72, reasoning: 'Beta launch completed with core features working.' },
                    { agentId: 'Gemini-Analytical', vote: true, confidence: 85, reasoning: 'Documentation and testing evidence provided.' },
                    { agentId: 'Gemini-Practical', vote: false, confidence: 55, reasoning: 'Some features seem incomplete.' },
                ],
            },
            timestamp: '15 minutes ago',
        },
        {
            campaignId: 2,
            campaignTitle: 'DAO Governance Tools',
            milestoneIndex: 0,
            milestoneDescription: 'Complete initial design and architecture',
            result: {
                passed: false,
                confidence: 42,
                finalDecision: 'FAIL',
                agentVotes: [
                    { agentId: 'Gemini-Technical', vote: false, confidence: 35, reasoning: 'Architecture document lacks critical details.' },
                    { agentId: 'Gemini-Analytical', vote: false, confidence: 48, reasoning: 'Design does not address stated requirements.' },
                    { agentId: 'Gemini-Practical', vote: true, confidence: 62, reasoning: 'Basic structure is present but needs refinement.' },
                ],
            },
            timestamp: '1 hour ago',
        },
    ];

export default function Verification() {
    const [selectedVerification, setSelectedVerification] = useState<typeof demoVerifications[0] | null>(null);

    return (
        <div>
            {/* Header */}
            <section style={{ marginBottom: '48px' }}>
                <h1 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '12px' }}>AI Verification Transparency</h1>
                <p style={{ color: '#9CA3AF', fontSize: '18px' }}>View multi-agent consensus decisions for milestone verifications</p>
            </section>

            {/* Stats */}
            <section style={{ marginBottom: '48px' }}>
                <div className="card-grid-4">
                    <div className="glass-card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '36px', fontWeight: 700, color: '#B6F35C', fontFamily: 'JetBrains Mono, monospace' }}>12</div>
                        <div style={{ fontSize: '14px', color: '#9CA3AF', marginTop: '8px' }}>Verifications Today</div>
                    </div>
                    <div className="glass-card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '36px', fontWeight: 700, color: '#4ADE80', fontFamily: 'JetBrains Mono, monospace' }}>83%</div>
                        <div style={{ fontSize: '14px', color: '#9CA3AF', marginTop: '8px' }}>Pass Rate</div>
                    </div>
                    <div className="glass-card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '36px', fontWeight: 700, color: '#60A5FA', fontFamily: 'JetBrains Mono, monospace' }}>78%</div>
                        <div style={{ fontSize: '14px', color: '#9CA3AF', marginTop: '8px' }}>Avg Confidence</div>
                    </div>
                    <div className="glass-card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '36px', fontWeight: 700, color: '#A78BFA', fontFamily: 'JetBrains Mono, monospace' }}>3</div>
                        <div style={{ fontSize: '14px', color: '#9CA3AF', marginTop: '8px' }}>Gemini Agents</div>
                    </div>
                </div>
            </section>

            {/* Agent Info */}
            <section style={{ marginBottom: '48px' }}>
                <div className="glass-card">
                    <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Brain style={{ width: '24px', height: '24px', color: '#B6F35C' }} />
                        Gemini Multi-Agent Consensus
                    </h2>
                    <p style={{ color: '#9CA3AF', marginBottom: '28px', lineHeight: 1.7 }}>
                        Each milestone is verified by 3 Gemini AI agents with different evaluation perspectives.
                        A milestone passes when at least 2/3 agents vote yes.
                    </p>
                    <div className="card-grid-3">
                        <div className="glass" style={{ padding: '20px', borderRadius: '16px' }}>
                            <div style={{ fontWeight: 600, color: '#60A5FA', marginBottom: '6px' }}>Gemini-Technical</div>
                            <div style={{ fontSize: '14px', color: '#9CA3AF' }}>Technical Reviewer - Code quality focus</div>
                        </div>
                        <div className="glass" style={{ padding: '20px', borderRadius: '16px' }}>
                            <div style={{ fontWeight: 600, color: '#A78BFA', marginBottom: '6px' }}>Gemini-Analytical</div>
                            <div style={{ fontSize: '14px', color: '#9CA3AF' }}>Analytical Reviewer - Completeness focus</div>
                        </div>
                        <div className="glass" style={{ padding: '20px', borderRadius: '16px' }}>
                            <div style={{ fontWeight: 600, color: '#B6F35C', marginBottom: '6px' }}>Gemini-Practical</div>
                            <div style={{ fontSize: '14px', color: '#9CA3AF' }}>Practical Reviewer - Functionality focus</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Verification List */}
            <section>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
                    <div>
                        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>Recent Verifications</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {demoVerifications.map((verification, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedVerification(verification)}
                                    className="glass-card"
                                    style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        border: selectedVerification === verification ? '1px solid #B6F35C' : undefined
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                        <div>
                                            <h3 style={{ fontWeight: 600, marginBottom: '4px' }}>{verification.campaignTitle}</h3>
                                            <p style={{ fontSize: '14px', color: '#9CA3AF' }}>Milestone {verification.milestoneIndex + 1}</p>
                                        </div>
                                        <span className={`badge ${verification.result.passed ? 'badge-pass' : 'badge-fail'}`}>
                                            {verification.result.finalDecision}
                                        </span>
                                    </div>

                                    <p style={{ fontSize: '14px', color: '#9CA3AF', marginBottom: '16px' }}>{verification.milestoneDescription}</p>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9CA3AF' }}>
                                            <Shield style={{ width: '16px', height: '16px' }} />
                                            <span>{verification.result.confidence}% confidence</span>
                                        </div>
                                        <span style={{ fontSize: '12px', color: '#6B7280' }}>{verification.timestamp}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Detail Panel */}
                    {selectedVerification && (
                        <div className="glass-card">
                            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>Verification Details</h2>

                            <div style={{ marginBottom: '28px' }}>
                                <h3 style={{ fontWeight: 600, marginBottom: '8px' }}>{selectedVerification.campaignTitle}</h3>
                                <p style={{ fontSize: '14px', color: '#9CA3AF' }}>{selectedVerification.milestoneDescription}</p>
                            </div>

                            <div className="glass" style={{
                                padding: '24px',
                                borderRadius: '16px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '28px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    {selectedVerification.result.passed ? (
                                        <CheckCircle style={{ width: '40px', height: '40px', color: '#B6F35C' }} />
                                    ) : (
                                        <XCircle style={{ width: '40px', height: '40px', color: '#EF4444' }} />
                                    )}
                                    <div>
                                        <div style={{ fontSize: '20px', fontWeight: 700 }}>{selectedVerification.result.finalDecision}</div>
                                        <div style={{ fontSize: '14px', color: '#9CA3AF' }}>Final Decision</div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '28px', fontWeight: 700, color: '#B6F35C', fontFamily: 'JetBrains Mono, monospace' }}>
                                        {selectedVerification.result.confidence}%
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#9CA3AF' }}>Confidence</div>
                                </div>
                            </div>

                            <h3 style={{ fontWeight: 600, marginBottom: '16px' }}>Agent Votes</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {selectedVerification.result.agentVotes.map((vote, i) => (
                                    <div key={i} className="glass" style={{ padding: '20px', borderRadius: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                            <span style={{ fontWeight: 600 }}>{vote.agentId}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '14px' }}>{vote.confidence}%</span>
                                                <span className={`badge ${vote.vote ? 'badge-pass' : 'badge-fail'}`}>
                                                    {vote.vote ? 'PASS' : 'FAIL'}
                                                </span>
                                            </div>
                                        </div>
                                        <p style={{ fontSize: '14px', color: '#9CA3AF', lineHeight: 1.6 }}>{vote.reasoning}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {!selectedVerification && (
                        <div className="glass-card" style={{ textAlign: 'center', padding: '64px 32px' }}>
                            <Zap style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: '#6B7280' }} />
                            <p style={{ color: '#9CA3AF' }}>Select a verification to view details</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
