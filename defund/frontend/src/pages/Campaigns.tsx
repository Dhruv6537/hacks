import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Users, TrendingUp, Clock, CheckCircle, Trash2 } from 'lucide-react';
import { campaignStore, type Campaign } from '../store/campaigns';

export default function Campaigns() {
    const [campaigns, setCampaigns] = useState<Campaign[]>(campaignStore.getAll());
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('active'); // Default: hide failed campaigns

    // Subscribe to store updates and fetch initial data
    useEffect(() => {
        const unsubscribe = campaignStore.subscribe(() => {
            setCampaigns([...campaignStore.getAll()]);
        });

        // Fetch from blockchain on mount
        campaignStore.fetchCampaigns();

        return unsubscribe;
    }, []);

    const filteredCampaigns = campaigns.filter(campaign => {
        const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter =
            filter === 'all' ? true :
                filter === 'active' ? campaign.state !== 'FAILED' :
                    campaign.state === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div>
            {/* Header */}
            <section className="animate-fade-in-up" style={{ marginBottom: '36px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.03em' }}>Explore campaigns</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>Discover and fund AI-verified projects on Monad</p>
            </section>

            {/* Search and Filter */}
            <section className="animate-fade-in-up" style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '32px',
                alignItems: 'center',
                animationDelay: '60ms'
            }}>
                <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
                    <Search style={{
                        position: 'absolute',
                        left: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '18px',
                        height: '18px',
                        color: 'var(--text-muted)'
                    }} />
                    <input
                        type="text"
                        placeholder="Search by name, tag, or creator"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input"
                        style={{ paddingLeft: '42px' }}
                    />
                </div>

                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="input"
                    style={{ width: 'auto', minWidth: '170px' }}
                >
                    <option value="active">Active Campaigns</option>
                    <option value="ACTIVE">Funding</option>
                    <option value="COMPLETED">Funded</option>
                    <option value="all">All (incl. Failed)</option>
                </select>

                <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-primary)',
                    transition: 'all 0.2s'
                }}>
                    <input type="checkbox" style={{ accentColor: 'var(--accent)', width: '16px', height: '16px' }} />
                    AI-verified only
                </label>
            </section>

            {/* Campaign Grid */}
            <section className="animate-fade-in-up" style={{ animationDelay: '120ms' }}>
                <div className="card-grid-3 stagger">
                    {filteredCampaigns.map((campaign) => (
                        <div key={campaign.id} style={{ position: 'relative' }}>
                            {/* Remove button for failed campaigns */}
                            {campaign.state === 'FAILED' && (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (confirm('Remove this failed campaign from view?')) {
                                            campaignStore.remove(campaign.id);
                                        }
                                    }}
                                    style={{
                                        position: 'absolute',
                                        top: '14px',
                                        right: '14px',
                                        zIndex: 10,
                                        background: 'var(--danger-light)',
                                        border: 'none',
                                        borderRadius: 'var(--radius-sm)',
                                        padding: '6px 10px',
                                        cursor: 'pointer',
                                        color: 'var(--danger)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '12px',
                                        fontWeight: 600
                                    }}
                                    title="Remove from view"
                                >
                                    <Trash2 style={{ width: '12px', height: '12px' }} />
                                    Remove
                                </button>
                            )}
                            <Link
                                to={`/campaign/${campaign.id}`}
                                className="card"
                                style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none', color: 'inherit', height: '100%' }}
                            >
                                {/* Accent top bar for active campaigns */}
                                {campaign.state === 'ACTIVE' && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '3px',
                                        background: 'var(--gradient-accent)',
                                        borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0'
                                    }} />
                                )}

                                {/* Header */}
                                <div style={{ marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
                                            {campaign.title}
                                        </h3>
                                        {campaign.state === 'ACTIVE' && campaign.milestones.some(m => m.state === 'PASSED') && (
                                            <span className="pill pill-verified" style={{ fontSize: '11px', padding: '4px 8px' }}>
                                                <CheckCircle style={{ width: '12px', height: '12px' }} />
                                                Verified
                                            </span>
                                        )}
                                    </div>
                                    <p className="line-clamp-2" style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                        {campaign.description}
                                    </p>
                                </div>

                                {/* Tags */}
                                <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
                                    <span className="tag">Monad</span>
                                    {campaign.state === 'ACTIVE' && <span className="badge badge-success">Funding</span>}
                                    {campaign.state === 'COMPLETED' && <span className="badge badge-success">Funded</span>}
                                    {campaign.state === 'FAILED' && <span className="badge badge-fail">Failed</span>}
                                </div>

                                {/* Progress */}
                                <div style={{ marginBottom: '16px', marginTop: 'auto' }}>
                                    <div className="progress-bar" style={{ marginBottom: '10px' }}>
                                        <div className="progress-fill" style={{ width: `${campaign.progress}%` }}></div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>{campaign.raisedAmount} / {campaign.fundingGoal}</span>
                                        <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{campaign.progress}%</span>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '13px',
                                    color: 'var(--text-muted)',
                                    paddingTop: '14px',
                                    borderTop: '1px solid var(--border)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <Users style={{ width: '14px', height: '14px' }} />
                                        <span>{campaign.backers} backers</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <TrendingUp style={{ width: '14px', height: '14px' }} />
                                        <span>{campaign.currentMilestone}/{campaign.totalMilestones} milestones</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            {filteredCampaigns.length === 0 && (
                <div className="card-flat" style={{ textAlign: 'center', padding: '72px 24px' }}>
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '50%', background: 'var(--bg-tertiary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
                    }}>
                        <Clock style={{ width: '28px', height: '28px', color: 'var(--text-muted)' }} />
                    </div>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>No campaigns found matching your criteria</p>
                    <Link to="/create" className="btn btn-primary">
                        Create the first campaign
                    </Link>
                </div>
            )}
        </div>
    );
}
