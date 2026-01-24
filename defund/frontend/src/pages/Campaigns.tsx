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
            <section style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px' }}>Explore campaigns</h1>
                <p style={{ color: 'var(--text-muted)' }}>Discover and fund AI-verified projects on Monad</p>
            </section>

            {/* Search and Filter */}
            <section style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '32px',
                alignItems: 'center'
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
                    style={{ width: 'auto', minWidth: '160px' }}
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
                    cursor: 'pointer'
                }}>
                    <input type="checkbox" style={{ accentColor: 'var(--accent)' }} />
                    AI-verified only
                </label>
            </section>

            {/* Campaign Grid */}
            <section>
                <div className="card-grid-3">
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
                                        top: '12px',
                                        right: '12px',
                                        zIndex: 10,
                                        background: 'var(--danger-light)',
                                        border: 'none',
                                        borderRadius: 'var(--radius)',
                                        padding: '6px 10px',
                                        cursor: 'pointer',
                                        color: 'var(--danger)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '12px'
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
                                style={{ display: 'block', textDecoration: 'none', color: 'inherit', height: '100%' }}
                            >
                                {/* Header */}
                                <div style={{ marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>
                                            {campaign.title}
                                        </h3>
                                        {campaign.state === 'ACTIVE' && campaign.milestones.some(m => m.state === 'PASSED') && (
                                            <span className="pill pill-verified" style={{ fontSize: '11px', padding: '4px 8px' }}>
                                                <CheckCircle style={{ width: '12px', height: '12px' }} />
                                                Verified
                                            </span>
                                        )}
                                    </div>
                                    <p className="line-clamp-2" style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
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
                                <div style={{ marginBottom: '16px' }}>
                                    <div className="progress-bar" style={{ marginBottom: '8px' }}>
                                        <div className="progress-fill" style={{ width: `${campaign.progress}%` }}></div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>{campaign.raisedAmount} / {campaign.fundingGoal}</span>
                                        <span style={{ fontWeight: 500, color: 'var(--accent)' }}>{campaign.progress}% funded</span>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '13px',
                                    color: 'var(--text-muted)',
                                    paddingTop: '12px',
                                    borderTop: '1px solid var(--border)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Users style={{ width: '14px', height: '14px' }} />
                                        <span>{campaign.backers} backers</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                <div className="card-flat" style={{ textAlign: 'center', padding: '64px 24px' }}>
                    <Clock style={{ width: '40px', height: '40px', margin: '0 auto 16px', color: 'var(--text-muted)' }} />
                    <p style={{ color: 'var(--text-muted)' }}>No campaigns found matching your criteria</p>
                    <Link to="/create" className="btn btn-primary" style={{ marginTop: '16px' }}>
                        Create the first campaign
                    </Link>
                </div>
            )}
        </div>
    );
}
