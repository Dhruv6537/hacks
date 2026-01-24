import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, TrendingUp, Clock, Users } from 'lucide-react';
import { campaignStore, type Campaign } from '../store/campaigns';

export default function Campaigns() {
    const [campaigns, setCampaigns] = useState<Campaign[]>(campaignStore.getAll());
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');

    // Subscribe to store updates and fetch initial data
    useEffect(() => {
        const unsubscribe = campaignStore.subscribe(() => {
            setCampaigns([...campaignStore.getAll()]);
        });

        // Fetch from blockchain on mount
        campaignStore.fetchCampaigns();

        return unsubscribe;
    }, []);

    const getStateBadge = (state: string) => {
        switch (state) {
            case 'ACTIVE':
                return <span className="badge badge-active">Active</span>;
            case 'VERIFYING':
                return <span className="badge badge-pending">Verifying</span>;
            case 'COMPLETED':
                return <span className="badge badge-pass">Completed</span>;
            case 'FAILED':
                return <span className="badge badge-fail">Failed</span>;
            default:
                return <span className="badge">{state}</span>;
        }
    };

    const filteredCampaigns = campaigns.filter(campaign => {
        const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' || campaign.state === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div>
            {/* Header */}
            <section style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '24px',
                marginBottom: '48px'
            }}>
                <div>
                    <h1 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '8px' }}>Campaigns</h1>
                    <p style={{ color: '#9CA3AF', fontSize: '18px' }}>Explore and fund verified projects</p>
                </div>
                <Link to="/create" className="btn-neon">
                    Create Campaign
                </Link>
            </section>

            {/* Search and Filter */}
            <section style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '20px',
                marginBottom: '48px'
            }}>
                <div style={{ position: 'relative', flex: '1', minWidth: '280px' }}>
                    <Search style={{
                        position: 'absolute',
                        left: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '20px',
                        height: '20px',
                        color: '#9CA3AF'
                    }} />
                    <input
                        type="text"
                        placeholder="Search campaigns..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-glass"
                        style={{ paddingLeft: '48px' }}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Filter style={{ width: '20px', height: '20px', color: '#9CA3AF' }} />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="input-glass"
                        style={{ minWidth: '160px', background: 'rgba(255,255,255,0.05)' }}
                    >
                        <option value="all">All Campaigns</option>
                        <option value="ACTIVE">Active</option>
                        <option value="VERIFYING">Verifying</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="FAILED">Failed</option>
                    </select>
                </div>
            </section>

            {/* Campaign Grid */}
            <section>
                <div className="card-grid-3">
                    {filteredCampaigns.map((campaign) => (
                        <Link
                            key={campaign.id}
                            to={`/campaigns/${campaign.id}`}
                            className="glass-card"
                            style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
                        >
                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
                                        {campaign.title}
                                    </h3>
                                    <p style={{ fontSize: '14px', color: '#9CA3AF' }}>{campaign.creator}</p>
                                </div>
                                {getStateBadge(campaign.state)}
                            </div>

                            {/* Description */}
                            <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>
                                {campaign.description}
                            </p>

                            {/* Progress */}
                            <div style={{ marginBottom: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '12px' }}>
                                    <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#B6F35C' }}>{campaign.raisedAmount}</span>
                                    <span style={{ color: '#9CA3AF' }}>of {campaign.fundingGoal}</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${campaign.progress}%` }}></div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div style={{ display: 'flex', gap: '24px', fontSize: '14px', color: '#9CA3AF' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Users style={{ width: '16px', height: '16px' }} />
                                    <span>{campaign.backers} backers</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <TrendingUp style={{ width: '16px', height: '16px' }} />
                                    <span>{campaign.currentMilestone}/{campaign.totalMilestones} milestones</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {filteredCampaigns.length === 0 && (
                <div style={{ textAlign: 'center', padding: '64px 0', color: '#9CA3AF' }}>
                    <Clock style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: 0.5 }} />
                    <p>No campaigns found matching your criteria</p>
                </div>
            )}
        </div>
    );
}
