import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

// Contract ABI (minimal interface for verification and campaign management)
const DEFUND_ABI = [
    'function createCampaign(string _title, string _description, uint256 _fundingGoal, string[] _milestoneDescriptions, uint256[] _milestoneAllocations) external returns (uint256)',
    'function contribute(uint256 _campaignId) external payable',
    'function submitMilestone(uint256 _campaignId, string _proofUrl) external',
    'function verifyMilestone(uint256 _campaignId, uint256 _milestoneIndex, bool _passed, uint8 _confidence) external',
    'function getCampaign(uint256 _campaignId) external view returns (tuple(address creator, string title, string description, uint256 fundingGoal, uint256 raisedAmount, uint256 releasedAmount, uint8 state, uint256 milestoneCount, uint256 currentMilestone, uint256 createdAt))',
    'function getMilestone(uint256 _campaignId, uint256 _milestoneIndex) external view returns (tuple(string description, uint256 fundsAllocated, string proofUrl, uint8 state, uint8 confidence))',
    'function campaignCounter() external view returns (uint256)',
    'event CampaignCreated(uint256 indexed campaignId, address indexed creator, string title, uint256 fundingGoal, uint256 milestoneCount)',
    'event ContributionReceived(uint256 indexed campaignId, address indexed backer, uint256 amount, uint256 totalRaised)',
    'event MilestoneSubmitted(uint256 indexed campaignId, uint256 indexed milestoneIndex, string proofUrl)',
    'event MilestoneVerified(uint256 indexed campaignId, uint256 indexed milestoneIndex, bool passed, uint8 confidence)',
    'event FundsReleased(uint256 indexed campaignId, uint256 indexed milestoneIndex, address indexed creator, uint256 amount)',
];

let provider: ethers.JsonRpcProvider;
let wallet: ethers.Wallet;
let contract: ethers.Contract | null = null;

export function initializeChainService() {
    const rpcUrl = process.env.MONAD_RPC || 'https://testnet-rpc.monad.xyz';
    const privateKey = process.env.PRIVATE_KEY;
    const contractAddress = process.env.CONTRACT_ADDRESS;

    provider = new ethers.JsonRpcProvider(rpcUrl);

    // Only initialize if we have valid-looking credentials
    const isValidPrivateKey = privateKey && privateKey.startsWith('0x') && privateKey.length === 66;
    const isValidContract = contractAddress && contractAddress.startsWith('0x') && contractAddress.length === 42;

    if (isValidPrivateKey && isValidContract) {
        try {
            wallet = new ethers.Wallet(privateKey, provider);
            contract = new ethers.Contract(contractAddress, DEFUND_ABI, wallet);
            console.log('✅ Chain service initialized');
            console.log(`📍 Contract: ${contractAddress}`);
        } catch (e: any) {
            console.warn('⚠️ Failed to initialize wallet:', e.message);
        }
    } else {
        console.warn('⚠️ Chain service: Running in demo mode (no blockchain connection)');
        console.warn('   Set valid PRIVATE_KEY and CONTRACT_ADDRESS in .env to enable blockchain');
    }
}

export async function submitMilestoneOnChain(
    campaignId: number,
    // milestoneIndex is determined by contract
    proofUrl: string
): Promise<string> {
    if (!contract) {
        throw new Error('Contract not initialized');
    }

    console.log(`\n📡 Submitting milestone proof...`);
    console.log(`   Campaign: ${campaignId}, Proof: ${proofUrl}`);

    try {
        const tx = await contract.submitMilestone(campaignId, proofUrl);
        console.log(`📤 Transaction sent: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
        return tx.hash;
    } catch (error: any) {
        console.error('❌ Milestone submission failed:', error.message);
        throw error;
    }
}

export async function verifyMilestoneOnChain(
    campaignId: number,
    milestoneIndex: number,
    passed: boolean,
    confidence: number
): Promise<string> {
    if (!contract) {
        throw new Error('Contract not initialized. Check PRIVATE_KEY and CONTRACT_ADDRESS');
    }

    console.log(`\n📡 Sending verification to blockchain...`);
    console.log(`   Campaign: ${campaignId}, Milestone: ${milestoneIndex}`);
    console.log(`   Passed: ${passed}, Confidence: ${confidence}%`);

    try {
        const tx = await contract.verifyMilestone(
            campaignId,
            milestoneIndex,
            passed,
            confidence
        );

        console.log(`📤 Transaction sent: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);

        return tx.hash;
    } catch (error: any) {
        console.error('❌ Blockchain transaction failed:', error.message);
        throw error;
    }
}

export async function getCampaign(campaignId: number) {
    if (!contract) {
        throw new Error('Contract not initialized');
    }

    const campaign = await contract.getCampaign(campaignId);
    return {
        creator: campaign[0],
        title: campaign[1],
        description: campaign[2],
        fundingGoal: ethers.formatEther(campaign[3]),
        raisedAmount: ethers.formatEther(campaign[4]),
        releasedAmount: ethers.formatEther(campaign[5]),
        state: Number(campaign[6]),
        milestoneCount: Number(campaign[7]),
        currentMilestone: Number(campaign[8]),
        createdAt: Number(campaign[9]),
    };
}

export async function getMilestone(campaignId: number, milestoneIndex: number) {
    if (!contract) {
        throw new Error('Contract not initialized');
    }

    const milestone = await contract.getMilestone(campaignId, milestoneIndex);
    return {
        description: milestone[0],
        fundsAllocated: ethers.formatEther(milestone[1]),
        proofUrl: milestone[2],
        state: Number(milestone[3]),
        confidence: Number(milestone[4]),
    };
}

export async function getCampaignCount(): Promise<number> {
    if (!contract) {
        throw new Error('Contract not initialized');
    }

    const count = await contract.campaignCounter();
    return Number(count);
}

export function getExplorerUrl(txHash: string): string {
    return `https://testnet.monadexplorer.com/tx/${txHash}`;
}

export function getContractExplorerUrl(): string {
    const contractAddress = process.env.CONTRACT_ADDRESS;
    return `https://testnet.monadexplorer.com/address/${contractAddress}`;
}

export async function createCampaignOnChain(
    title: string,
    description: string,
    fundingGoal: string,
    milestoneDescriptions: string[],
    milestoneAllocations: number[]
): Promise<{ txHash: string; campaignId: number }> {
    if (!contract) {
        throw new Error('Contract not initialized. Check PRIVATE_KEY and CONTRACT_ADDRESS');
    }

    console.log(`\n📡 Creating campaign on blockchain...`);
    console.log(`   Title: ${title}`);
    console.log(`   Goal: ${fundingGoal} wei`);
    console.log(`   Milestones: ${milestoneDescriptions.length}`);

    try {
        const tx = await contract.createCampaign(
            title,
            description,
            BigInt(fundingGoal),
            milestoneDescriptions,
            milestoneAllocations
        );

        console.log(`📤 Transaction sent: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);

        // Get the campaign ID from the event
        const campaignCount = await contract.campaignCounter();
        const campaignId = Number(campaignCount) - 1;

        console.log(`🎉 Campaign created with ID: ${campaignId}`);

        return { txHash: tx.hash, campaignId };
    } catch (error: any) {
        console.error('❌ Campaign creation failed:', error.message);
        throw error;
    }
}

// Initialize on import
initializeChainService();

export default {
    verifyMilestoneOnChain,
    createCampaignOnChain,
    submitMilestoneOnChain,
    getCampaign,
    getMilestone,
    getCampaignCount,
    getExplorerUrl,
    getContractExplorerUrl,
};
