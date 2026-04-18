import { Router } from 'express';
import { getCampaign, getMilestone, getCampaignCount, getContractExplorerUrl, createCampaignOnChain } from '../services/chainService';

const router = Router();

/**
 * POST /api/campaigns/create
 * Create a new campaign on-chain
 */
router.post('/create', async (req, res) => {
    try {
        const { title, description, fundingGoal, milestoneDescriptions, milestoneAllocations } = req.body;

        if (!title || !description || !fundingGoal || !milestoneDescriptions || !milestoneAllocations) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
            });
        }

        const result = await createCampaignOnChain(
            title,
            description,
            fundingGoal,
            milestoneDescriptions,
            milestoneAllocations
        );

        res.json({
            success: true,
            txHash: result.txHash,
            campaignId: result.campaignId,
            explorerUrl: `https://testnet.monadexplorer.com/tx/${result.txHash}`,
        });
    } catch (error: any) {
        console.error('Campaign creation error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * GET /api/campaigns
 * Get all campaigns (basic info)
 */
router.get('/', async (req, res) => {
    try {
        const count = await getCampaignCount();
        const campaigns = [];

        for (let i = 0; i < count && i < 50; i++) { // Limit to 50
            try {
                const campaign = await getCampaign(i);
                campaigns.push({ id: i, ...campaign });
            } catch (e) {
                // Skip invalid campaigns
            }
        }

        res.json({
            success: true,
            count,
            campaigns,
            contractExplorer: getContractExplorerUrl(),
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * GET /api/campaigns/:id
 * Get single campaign with milestones
 */
router.get('/:id', async (req, res) => {
    try {
        const campaignId = parseInt(req.params.id);
        const campaign = await getCampaign(campaignId);

        // Fetch all milestones
        const milestones = [];
        for (let i = 0; i < campaign.milestoneCount; i++) {
            try {
                const milestone = await getMilestone(campaignId, i);
                milestones.push({ index: i, ...milestone });
            } catch (e) {
                // Skip invalid milestones
            }
        }

        res.json({
            success: true,
            campaign: {
                id: campaignId,
                ...campaign,
                milestones,
            },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

// Import db
import { getDb } from '../database';

/**
 * POST /api/campaigns/:id/details
 * Save extra campaign details to DB
 */
router.post('/:id/details', async (req, res) => {
    try {
        const campaignId = parseInt(req.params.id);
        const { imageUrl, category, tags, longDescription, websiteUrl, twitterUrl } = req.body;

        const db = getDb();

        // Upsert metadata
        await db.run(`
            INSERT INTO campaign_metadata (campaign_id, image_url, category, tags, long_description, website_url, twitter_url)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(campaign_id) DO UPDATE SET
            image_url = excluded.image_url,
            category = excluded.category,
            tags = excluded.tags,
            long_description = excluded.long_description,
            website_url = excluded.website_url,
            twitter_url = excluded.twitter_url
        `, [
            campaignId,
            imageUrl || '',
            category || '',
            tags || '',
            longDescription || '',
            websiteUrl || '',
            twitterUrl || ''
        ]);

        res.json({ success: true, message: 'Details saved' });
    } catch (error: any) {
        console.error('DB Save error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/campaigns/:id/details
 * Get campaign details from DB
 */
router.get('/:id/details', async (req, res) => {
    try {
        const campaignId = parseInt(req.params.id);
        const db = getDb();

        const row = await db.get('SELECT * FROM campaign_metadata WHERE campaign_id = ?', campaignId);

        res.json({
            success: true,
            details: row || {}
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;

