import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface AgentVote {
    agentId: string;
    vote: boolean;
    confidence: number;
    reasoning: string;
}

export interface VerificationResult {
    passed: boolean;
    confidence: number;
    agentVotes: AgentVote[];
    finalDecision: 'PASS' | 'FAIL';
    timestamp: string;
}

// Minimum confidence threshold to pass verification
const CONFIDENCE_THRESHOLD = 70;

/**
 * Verify a milestone using multiple AI agent personas for consensus.
 * Each agent evaluates independently, and the final decision requires majority agreement.
 */
export async function verifyMilestone(
    milestoneDescription: string,
    proofUrl: string,
    campaignTitle: string
): Promise<VerificationResult> {
    console.log(`\n🤖 Starting AI Verification for: ${campaignTitle}`);
    console.log(`📋 Milestone: ${milestoneDescription}`);
    console.log(`🔗 Proof URL: ${proofUrl}`);

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        // ── Agent 1: Technical Auditor ──────────────────────────
        const technicalPrompt = buildAgentPrompt(
            'Technical Auditor',
            `You are a strict technical auditor. You verify whether the submitted proof 
            actually demonstrates completion of the described milestone. 
            You check if the proof URL is relevant to the campaign topic and milestone description.
            You are skeptical by default and require clear evidence.`,
            campaignTitle,
            milestoneDescription,
            proofUrl
        );

        // ── Agent 2: Relevance Checker ─────────────────────────
        const relevancePrompt = buildAgentPrompt(
            'Relevance Checker',
            `You are a relevance verification specialist. Your ONLY job is to determine 
            whether the proof URL is genuinely related to the campaign and milestone.
            A YouTube channel link does NOT prove a medical research milestone was completed.
            A random GitHub repo does NOT prove an unrelated software milestone was completed.
            The proof must be DIRECTLY and SPECIFICALLY related to the milestone description.
            If the proof URL has nothing to do with the milestone topic, you MUST fail it.`,
            campaignTitle,
            milestoneDescription,
            proofUrl
        );

        // ── Agent 3: Fraud Detector ────────────────────────────
        const fraudPrompt = buildAgentPrompt(
            'Fraud Detector',
            `You are a fraud detection specialist protecting backers' funds.
            Your job is to catch fake, irrelevant, or low-effort proofs.
            Common fraud patterns to watch for:
            - Generic URLs that have nothing to do with the campaign topic
            - YouTube videos/channels unrelated to the milestone
            - Random GitHub repos not matching the described deliverable
            - Placeholder or dummy URLs
            - Links that clearly don't match what the milestone requires
            If the proof seems unrelated, generic, or suspicious, you MUST fail it.`,
            campaignTitle,
            milestoneDescription,
            proofUrl
        );

        // Run all three agents in parallel
        const [technicalResult, relevanceResult, fraudResult] = await Promise.all([
            callAgent(model, 'Technical Auditor', technicalPrompt),
            callAgent(model, 'Relevance Checker', relevancePrompt),
            callAgent(model, 'Fraud Detector', fraudPrompt),
        ]);

        const agentVotes: AgentVote[] = [technicalResult, relevanceResult, fraudResult];

        // ── Consensus: Majority vote with confidence threshold ──
        const passVotes = agentVotes.filter(v => v.vote).length;
        const avgConfidence = Math.round(
            agentVotes.reduce((sum, v) => sum + v.confidence, 0) / agentVotes.length
        );

        // Pass only if: majority votes pass AND average confidence >= threshold
        const passed = passVotes >= 2 && avgConfidence >= CONFIDENCE_THRESHOLD;

        const verificationResult: VerificationResult = {
            passed,
            confidence: avgConfidence,
            agentVotes,
            finalDecision: passed ? 'PASS' : 'FAIL',
            timestamp: new Date().toISOString()
        };

        console.log(`\n📊 Votes: ${passVotes}/3 passed, avg confidence: ${avgConfidence}%`);
        console.log(`✅ Final Decision: ${verificationResult.finalDecision}`);
        agentVotes.forEach(v => {
            console.log(`   🤖 ${v.agentId}: ${v.vote ? 'PASS' : 'FAIL'} (${v.confidence}%) — ${v.reasoning}`);
        });

        return verificationResult;

    } catch (error) {
        console.error("Gemini Verification Failed:", error);

        // SAFE FALLBACK: When AI is unavailable, FAIL the verification to protect backers
        console.log("⚠️ AI unavailable — Failing verification to protect backer funds");
        return {
            passed: false,
            confidence: 0,
            agentVotes: [{
                agentId: 'System Fallback',
                vote: false,
                confidence: 0,
                reasoning: 'AI service unavailable — verification failed as a safety measure. Please try again later.'
            }],
            finalDecision: 'FAIL',
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Build the full prompt for an agent persona
 */
function buildAgentPrompt(
    agentName: string,
    persona: string,
    campaignTitle: string,
    milestoneDescription: string,
    proofUrl: string
): string {
    return `You are "${agentName}", representing DeFund, a decentralized crowdfunding platform.

Your specific role is:
${persona}

You are evaluating the following milestone:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Campaign Title: "${campaignTitle}"
Milestone Description: "${milestoneDescription}"
Proof URL submitted by creator: "${proofUrl}"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EVALUATION GUIDELINES:
1. You cannot browse the web. You must deduce validity purely from the URL's domain and text.
2. If the URL is an entertainment website (like hotstar.com, netflix.com) or a generic homepage without project-specific file paths, you MUST FAIL the verification.
3. If the URL is a GitHub repo or video, the text in the URL slug MUST logically relate to the campaign title or milestone. If it doesn't, it is likely a placeholder or fake link and should fail.
4. Base your final vote primarily on your specific role's perspective. 

Respond in STRICTLY valid JSON format (no markdown, no code blocks):
{
    "vote": true or false,
    "confidence": number from 0 to 100,
    "reasoning": "A professional, one-sentence explanation of your evaluation."
}`;
}



/**
 * Call a single agent and parse its response
 */
async function callAgent(
    model: any,
    agentId: string,
    prompt: string
): Promise<AgentVote> {
    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            console.log(`  🤖 ${agentId}: ${parsed.vote ? 'PASS' : 'FAIL'} (${parsed.confidence}%)`);
            return {
                agentId,
                vote: Boolean(parsed.vote),
                confidence: Number(parsed.confidence) || 0,
                reasoning: String(parsed.reasoning) || 'No reasoning provided',
            };
        }
    } catch (e) {
        console.error(`Failed to get response from ${agentId}:`, e);
    }

    // If an agent fails to respond, default to FAIL (protect backers)
    return {
        agentId,
        vote: false,
        confidence: 0,
        reasoning: 'Agent failed to produce a valid response — defaulting to FAIL for safety',
    };
}

export default { verifyMilestone };
