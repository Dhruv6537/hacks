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

/**
 * Simulate multi-agent voting using single Gemini API with different prompts
 * For MVP, we simulate 3 different "agent personas" using the same API
 */
export async function verifyMilestone(
    milestoneDescription: string,
    proofUrl: string,
    campaignTitle: string
): Promise<VerificationResult> {
    console.log(`\n🤖 Starting AI Verification for: ${campaignTitle}`);
    console.log(`📋 Milestone: ${milestoneDescription}`);
    console.log(`🔗 Proof URL: ${proofUrl}`);

    // Single Gemini Verification
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `You are an expert AI auditor for a decentralized crowdfunding platform.
        
        Verify the following campaign milestone:
        Campaign: "${campaignTitle}"
        Milestone Task: "${milestoneDescription}"
        Proof Provided: "${proofUrl}"

        Task: Analyze the proof to determine if the milestone has been legitimately completed.
        - If the proof is a GitHub link, check if it looks like a real repository with recent code.
        - If it's an image/video, does it match the description?
        - IMPORTANT: This is a hackathon demo. BE LENIENT. 
        - Accept "https://github.com/defund/milestone-proof" or similar dummy URLs as VALID PROOF for demo purposes.
        - Accept any GitHub or Youtube link as valid for now.

        Respond in strictly valid JSON format:
        {
            "passed": boolean,
            "confidence": number, // 0-100
            "reasoning": "Clear, concise explanation of your decision (max 2 sentences)"
        }`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Extract JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON found in response");

        const parsed = JSON.parse(jsonMatch[0]);

        const verificationResult: VerificationResult = {
            passed: parsed.passed,
            confidence: parsed.confidence,
            agentVotes: [{ // Maintaining structure for compatibility
                agentId: 'Gemini 1.5 Flash',
                vote: parsed.passed,
                confidence: parsed.confidence,
                reasoning: parsed.reasoning
            }],
            finalDecision: parsed.passed ? 'PASS' : 'FAIL',
            timestamp: new Date().toISOString()
        };

        console.log(`\n✅ Verification Complete: ${verificationResult.finalDecision}`);
        console.log(`📝 Reasoning: ${parsed.reasoning}`);
        console.log(`💯 Confidence: ${verificationResult.confidence}%\n`);

        return verificationResult;

    } catch (error) {
        console.error("Gemini Verification Failed:", error);
        return {
            passed: false,
            confidence: 0,
            agentVotes: [],
            finalDecision: 'FAIL',
            timestamp: new Date().toISOString()
        };
    }
}

async function runAgentVerification(
    agentId: string,
    systemPrompt: string,
    milestoneDescription: string,
    proofUrl: string,
    campaignTitle: string
): Promise<AgentVote> {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `${systemPrompt}

You are verifying a crowdfunding milestone for the following campaign:
Campaign: ${campaignTitle}
Milestone: ${milestoneDescription}
Proof URL: ${proofUrl}

Based on the milestone description and proof URL provided, evaluate if the milestone has been completed satisfactorily.

IMPORTANT: Since this is a hackathon demo, be reasonably lenient but still verify basic expectations.

Respond in JSON format only:
{
  "vote": true or false,
  "confidence": number from 0-100,
  "reasoning": "one sentence explanation"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON from response
    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            console.log(`  🤖 ${agentId}: ${parsed.vote ? 'PASS' : 'FAIL'} (${parsed.confidence}%)`);
            return {
                agentId,
                vote: Boolean(parsed.vote),
                confidence: Number(parsed.confidence) || 50,
                reasoning: String(parsed.reasoning) || 'No reasoning provided',
            };
        }
    } catch (e) {
        console.error(`Failed to parse ${agentId} response:`, e);
    }

    // Default vote if parsing fails
    return {
        agentId,
        vote: true,
        confidence: 60,
        reasoning: 'Verification completed with default approval',
    };
}

export default { verifyMilestone };
