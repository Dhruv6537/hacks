// Simple in-memory campaign store for demo purposes
// In production, this would come from the blockchain
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = '0x11C88CdD5DcF83913cEe5d4a933d633a415E2437';
const CONTRACT_ABI = [
    'function campaignCounter() external view returns (uint256)',
    'function getCampaign(uint256 _campaignId) external view returns (tuple(address creator, string title, string description, uint256 fundingGoal, uint256 raisedAmount, uint256 releasedAmount, uint8 state, uint256 milestoneCount, uint256 currentMilestone, uint256 createdAt))',
    'function getMilestone(uint256 _campaignId, uint256 _milestoneIndex) external view returns (tuple(string description, uint256 fundsAllocated, string proofUrl, uint8 state, uint8 confidence))',
    'function getBackerCount(uint256 _campaignId) external view returns (uint256)',
    'event ContributionReceived(uint256 indexed campaignId, address indexed backer, uint256 amount, uint256 totalRaised)'
];

export interface Campaign {
    id: number;
    title: string;
    description: string;
    creator: string;
    fundingGoal: string;
    raisedAmount: string;
    progress: number;
    backers: number;
    state: 'ACTIVE' | 'VERIFYING' | 'COMPLETED' | 'FAILED';
    currentMilestone: number;
    totalMilestones: number;
    milestones: {
        description: string;
        allocation: number;
        state: 'PENDING' | 'SUBMITTED' | 'PASSED' | 'FAILED';
        proofUrl?: string;
    }[];
}

// Initial demo campaigns (IDs shifted to avoid collision with real blockchain IDs starting at 0)
const initialCampaigns: Campaign[] = [
    {
        id: 1000,
        title: 'DeFi Analytics Platform (Demo)',
        description: 'Real-time analytics dashboard for DeFi protocols with comprehensive metrics',
        creator: '0x1234...5678',
        fundingGoal: '10 MON',
        raisedAmount: '7.5 MON',
        progress: 75,
        backers: 12,
        state: 'ACTIVE',
        currentMilestone: 1,
        totalMilestones: 3,
        milestones: [
            { description: 'Complete smart contract development', allocation: 30, state: 'PASSED' },
            { description: 'Launch MVP frontend dashboard', allocation: 40, state: 'SUBMITTED' },
            { description: 'Complete full platform', allocation: 30, state: 'PENDING' },
        ],
    },
    {
        id: 1001,
        title: 'NFT Marketplace V2 (Demo)',
        description: 'Gas-efficient NFT marketplace with AI-powered recommendations',
        creator: '0xabcd...efgh',
        fundingGoal: '15 MON',
        raisedAmount: '15 MON',
        progress: 100,
        backers: 24,
        state: 'VERIFYING',
        currentMilestone: 2,
        totalMilestones: 3,
        milestones: [
            { description: 'Smart contract development', allocation: 40, state: 'PASSED' },
            { description: 'Frontend development', allocation: 35, state: 'SUBMITTED' },
            { description: 'Launch and marketing', allocation: 25, state: 'PENDING' },
        ],
    },
    {
        id: 1002,
        title: 'DAO Governance Tools (Demo)',
        description: 'Modular governance toolkit for DAOs with on-chain voting',
        creator: '0x9876...4321',
        fundingGoal: '8 MON',
        raisedAmount: '3.2 MON',
        progress: 40,
        backers: 8,
        state: 'ACTIVE',
        currentMilestone: 0,
        totalMilestones: 2,
        milestones: [
            { description: 'Design and architecture', allocation: 50, state: 'PENDING' },
            { description: 'Implementation', allocation: 50, state: 'PENDING' },
        ],
    },
];

// In-memory store
let campaigns: Campaign[] = [...initialCampaigns];

// IDs for offline campaigns (if any)
let nextOfflineId = 2000;

// Helper to convert state enum
const getStateString = (state: number): 'ACTIVE' | 'VERIFYING' | 'COMPLETED' | 'FAILED' => {
    switch (state) {
        case 0: return 'ACTIVE';
        case 1: return 'COMPLETED'; // Contract: 1 is COMPLETED
        case 2: return 'FAILED';    // Contract: 2 is FAILED
        default: return 'ACTIVE';
    }
};

const getMilestoneStateString = (state: number): 'PENDING' | 'SUBMITTED' | 'PASSED' | 'FAILED' => {
    switch (state) {
        case 0: return 'PENDING';
        case 1: return 'SUBMITTED';
        case 2: return 'PASSED';
        case 3: return 'FAILED';
        default: return 'PENDING';
    }
};

// Store functions
export const campaignStore = {
    getAll: (): Campaign[] => campaigns,

    getById: (id: number): Campaign | undefined => campaigns.find(c => c.id === id),

    add: (campaign: Omit<Campaign, 'id' | 'raisedAmount' | 'progress' | 'backers' | 'state' | 'currentMilestone'> & { id?: number }): Campaign => {
        // Prevent adding duplicate ID if it already exists (e.g. from fetch)
        if (campaign.id !== undefined && campaigns.find(c => c.id === campaign.id)) {
            return campaigns.find(c => c.id === campaign.id)!;
        }

        const newCampaign: Campaign = {
            ...campaign,
            id: campaign.id !== undefined ? campaign.id : nextOfflineId++,
            raisedAmount: '0 MON',
            progress: 0,
            backers: 0,
            state: 'ACTIVE',
            currentMilestone: 0,
        };
        campaigns = [newCampaign, ...campaigns]; // Add new campaigns to top

        // Initial sort to put real campaigns (id < 1000) first
        campaigns.sort((a, b) => {
            if (a.id < 1000 && b.id >= 1000) return -1;
            if (a.id >= 1000 && b.id < 1000) return 1;
            return b.id - a.id; // Descending ID
        });

        return newCampaign;
    },

    contribute: (id: number, amount: number): void => {
        campaigns = campaigns.map(c => {
            if (c.id === id) {
                const goalNum = parseFloat(c.fundingGoal);
                const raisedNum = parseFloat(c.raisedAmount) + amount;
                return {
                    ...c,
                    raisedAmount: `${raisedNum.toFixed(4)} MON`,
                    progress: Math.min(100, Math.round((raisedNum / goalNum) * 100)),
                    backers: c.backers + 1,
                };
            }
            return c;
        });
    },

    // Loading state updates for subscribers
    isLoading: false,

    // Fetch from blockchain
    fetchCampaigns: async () => {
        if (!window.ethereum) return;

        campaignStore.isLoading = true;
        campaignStore.notify();

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            // Must use a provider that doesn't require signing for read-only ops if possible, 
            // but BrowserProvider is fine if wallet is connected.

            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

            const count = await contract.campaignCounter();
            console.log(`Fetching ${count} campaigns from blockchain...`);

            for (let i = 0; i < Number(count); i++) {
                try {
                    const c = await contract.getCampaign(i);
                    console.log(`Campaign ${i} Raw Data:`, {
                        raised: c.raisedAmount.toString(),
                        goal: c.fundingGoal.toString(),
                        state: c.state
                    });

                    // Fetch milestones
                    const milestones = [];
                    for (let j = 0; j < Number(c.milestoneCount); j++) {
                        const m = await contract.getMilestone(i, j);
                        milestones.push({
                            description: m.description,
                            allocation: Number(ethers.formatUnits(m.fundsAllocated, 18)) / Number(ethers.formatUnits(c.fundingGoal, 18)) * 100,
                            state: getMilestoneStateString(Number(m.state)),
                            proofUrl: m.proofUrl // Store proof URL
                        });
                    }

                    const fundingGoalETH = ethers.formatEther(c.fundingGoal);
                    const raisedETH = ethers.formatEther(c.raisedAmount);

                    let progress = 0;
                    if (Number(fundingGoalETH) > 0) {
                        const preciseProgress = (Number(raisedETH) / Number(fundingGoalETH)) * 100;
                        progress = Math.min(100, Number(preciseProgress.toFixed(1)));
                    }

                    // Force 100% ONLY if COMPLETED (State 1)
                    if (Number(c.state) === 1) {
                        progress = 100;
                    }

                    // Log for debugging
                    console.log(`Campaign ${i} Parsed:`, {
                        raisedETH, progress, state: getStateString(Number(c.state))
                    });

                    // Fetch backer count (Try function, fallback to events)
                    let backerCount = 0;
                    try {
                        // First try the view function (fastest)
                        const count = await contract.getBackerCount(i);
                        backerCount = Number(count);
                    } catch (e) {
                        try {
                            // Fallback: Calculate from Event Logs (robust)
                            console.log(`View function failed for ${i}, falling back to events...`);
                            const filter = contract.filters.ContributionReceived(i);
                            const events = await contract.queryFilter(filter);
                            const uniqueBackers = new Set(events.map((e: any) => e.args[1])); // args[1] is 'backer'
                            backerCount = uniqueBackers.size;
                        } catch (evError) {
                            console.warn(`Failed to fetch backers via events for ${i}`, evError);
                        }
                    }

                    // Add or Update
                    const newCampaign = {
                        id: i,
                        title: c.title,
                        description: c.description,
                        creator: c.creator.slice(0, 6) + '...' + c.creator.slice(-4),
                        fundingGoal: `${Number(fundingGoalETH).toFixed(4)} MON`, // Format goal too
                        raisedAmount: `${Number(raisedETH).toFixed(4)} MON`,     // Ensure 4 decimals
                        progress: progress,
                        backers: backerCount,
                        state: getStateString(Number(c.state)),
                        currentMilestone: Number(c.currentMilestone),
                        totalMilestones: Number(c.milestoneCount),
                        milestones: milestones
                    };

                    // Check if exists to update instead of add duplicate
                    const existingIndex = campaigns.findIndex(camp => camp.id === i);
                    if (existingIndex !== -1) {
                        campaigns[existingIndex] = newCampaign as any;
                    } else {
                        campaigns.push(newCampaign as any);
                    }

                } catch (e) {
                    console.error(`Failed to fetch campaign ${i}`, e);
                }
            }

            // Re-sort
            campaigns.sort((a, b) => {
                if (a.id < 1000 && b.id >= 1000) return -1;
                if (a.id >= 1000 && b.id < 1000) return 1;
                return b.id - a.id;
            });

        } catch (e) {
            console.error("Failed to fetch campaigns", e);
        } finally {
            campaignStore.isLoading = false;
            campaignStore.notify();
        }
    },

    // Subscribe to changes (simple implementation)
    listeners: [] as (() => void)[],
    subscribe: (listener: () => void) => {
        campaignStore.listeners.push(listener);
        return () => {
            campaignStore.listeners = campaignStore.listeners.filter(l => l !== listener);
        };
    },
    notify: () => {
        campaignStore.listeners.forEach(l => l());
    },
};

// Override add and contribute to notify
const originalAdd = campaignStore.add;
campaignStore.add = (...args) => {
    const result = originalAdd(...args);
    campaignStore.notify();
    return result;
};

const originalContribute = campaignStore.contribute;
campaignStore.contribute = (...args) => {
    originalContribute(...args);
    campaignStore.notify();
};
