import { Router } from 'express';
import { verifyMilestone as aiVerify } from '../services/aiService';
import { verifyMilestoneOnChain, getExplorerUrl } from '../services/chainService';

const router = Router();

interface VerifyRequest {
    campaignId: number;
    milestoneIndex: number;
    milestoneDescription: string;
    proofUrl: string;
    campaignTitle: string;
}

/**
 * POST /api/verify/milestone
 * Trigger AI verification and submit result to blockchain
 */
router.post('/milestone', async (req, res) => {
    try {
        const {
            campaignId,
            milestoneIndex,
            milestoneDescription,
            proofUrl,
            campaignTitle,
        }: VerifyRequest = req.body;

        // Validate required fields
        if (campaignId === undefined || milestoneIndex === undefined) {
            return res.status(400).json({ error: 'campaignId and milestoneIndex required' });
        }

        if (!proofUrl) {
            return res.status(400).json({ error: 'proofUrl required' });
        }

        console.log('\n========================================');
        console.log('🔍 MILESTONE VERIFICATION STARTED');
        console.log('========================================');

        // Step 1: Run AI verification
        const aiResult = await aiVerify(
            milestoneDescription || 'Complete milestone deliverables',
            proofUrl,
            campaignTitle || 'Campaign'
        );

        // Step 2: Submit to blockchain
        let txHash = '';
        let explorerUrl = '';
        let blockchainError = null;

        try {
            txHash = await verifyMilestoneOnChain(
                campaignId,
                milestoneIndex,
                aiResult.passed,
                aiResult.confidence
            );
            explorerUrl = getExplorerUrl(txHash);
        } catch (error: any) {
            blockchainError = error.message;
            console.error('⚠️ Blockchain submission failed, AI result only:', error.message);
        }

        // Step 3: Log to Database
        try {
            const { getDb } = require('../database');
            const db = getDb();
            await db.run(`
                INSERT INTO verification_logs (campaign_id, milestone_index, agent_name, verification_result, confidence, feedback)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [
                campaignId,
                milestoneIndex,
                'DeFund Consensus',
                aiResult.finalDecision,
                aiResult.confidence,
                JSON.stringify(aiResult.agentVotes)
            ]);
            console.log('✅ AI Log saved to DB');
        } catch (dbError) {
            console.error('⚠️ Failed to save log to DB:', dbError);
        }

        const response = {
            success: true,
            verification: aiResult,
            blockchain: {
                txHash: txHash || null,
                explorerUrl: explorerUrl || null,
                error: blockchainError,
            },
            summary: {
                campaignId,
                milestoneIndex,
                decision: aiResult.finalDecision,
                confidence: aiResult.confidence,
                voteSummary: `${aiResult.agentVotes.filter(v => v.vote).length}/3 passed`,
            },
        };

        console.log('========================================');
        console.log(`✅ VERIFICATION COMPLETE: ${aiResult.finalDecision}`);
        console.log('========================================\n');

        res.json(response);
    } catch (error: any) {
        console.error('❌ Verification error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

/**
 * GET /api/verify/test
 * Test endpoint for AI verification without blockchain
 */
router.get('/test', async (req, res) => {
    try {
        const result = await aiVerify(
            'Complete MVP prototype',
            'https://github.com/example/defund',
            'DeFund Test Campaign'
        );

        res.json({
            success: true,
            result,
            note: 'This is a test verification, no blockchain transaction was made',
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

export default router;
