import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const ABI = [
    'function campaignCounter() external view returns (uint256)',
    'function getCampaign(uint256 _campaignId) external view returns (tuple(address creator, string title, string description, uint256 fundingGoal, uint256 raisedAmount, uint256 releasedAmount, uint8 state, uint256 milestoneCount, uint256 currentMilestone, uint256 createdAt))'
];

async function main() {
    const rpcUrl = process.env.MONAD_RPC || 'https://testnet-rpc.monad.xyz';
    const contractAddress = process.env.CONTRACT_ADDRESS;

    if (!contractAddress) {
        console.error('No CONTRACT_ADDRESS in .env');
        return;
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(contractAddress, ABI, provider);

    try {
        const count = await contract.campaignCounter();
        console.log(`Total Campaigns: ${count}`);

        for (let i = 0; i < Number(count); i++) {
            const c = await contract.getCampaign(i);
            console.log(`\nCampaign ${i}:`);
            console.log(`  Title: ${c.title}`);
            console.log(`  Goal: ${ethers.formatEther(c.fundingGoal)} MON`);
            console.log(`  Raised: ${ethers.formatEther(c.raisedAmount)} MON`);
            console.log(`  State: ${c.state}`);
        }
    } catch (e) {
        console.error(e);
    }
}

main();
