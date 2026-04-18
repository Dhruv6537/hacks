// Demo script to create a campaign, contribute, submit proof, and verify milestone
import { ethers } from 'hardhat';

const CONTRACT_ADDRESS = '0x11C88CdD5DcF83913cEe5d4a933d633a415E2437';

async function main() {
    console.log('🚀 Starting DeFund Demo Flow...\n');

    const [signer] = await ethers.getSigners();
    console.log('📍 Using account:', signer.address);

    const balance = await ethers.provider.getBalance(signer.address);
    console.log('💰 Balance:', ethers.formatEther(balance), 'MON\n');

    // Connect to deployed contract
    const DeFund = await ethers.getContractFactory('DeFund');
    const contract = DeFund.attach(CONTRACT_ADDRESS);

    // Step 1: Create a new campaign
    console.log('📝 Step 1: Creating new campaign...');
    const createTx = await contract.createCampaign(
        'AI-Powered DeFund Demo',
        'A demonstration campaign to showcase AI verification on Monad. This project aims to build autonomous crowdfunding with multi-agent AI consensus.',
        ethers.parseEther('0.1'), // 0.1 MON goal
        ['MVP Development', 'Beta Launch', 'Full Release'], // milestones
        [40, 35, 25] // allocations (must sum to 100)
    );

    const createReceipt = await createTx.wait();
    console.log('✅ Campaign created! TX:', createTx.hash);

    // Get campaign ID from event
    const campaignCreatedEvent = createReceipt?.logs.find((log: any) => {
        try {
            const parsed = contract.interface.parseLog({ topics: [...log.topics], data: log.data });
            return parsed?.name === 'CampaignCreated';
        } catch {
            return false;
        }
    });

    let campaignId: bigint;
    if (campaignCreatedEvent) {
        const parsed = contract.interface.parseLog({
            topics: [...campaignCreatedEvent.topics],
            data: campaignCreatedEvent.data
        });
        campaignId = parsed?.args[0];
        console.log('📊 Campaign ID:', campaignId.toString());
    } else {
        // Fallback: get latest campaign
        const counter = await contract.campaignCounter();
        campaignId = counter - 1n;
        console.log('📊 Campaign ID (from counter):', campaignId.toString());
    }

    // Step 2: Contribute to the campaign
    console.log('\n💸 Step 2: Contributing 0.001 MON...');
    const contributeTx = await contract.contribute(campaignId, {
        value: ethers.parseEther('0.001')
    });
    await contributeTx.wait();
    console.log('✅ Contribution successful! TX:', contributeTx.hash);

    // Step 3: Submit milestone proof
    console.log('\n📤 Step 3: Submitting milestone proof...');
    const proofUrl = 'https://github.com/example/defund-mvp/releases/tag/v1.0.0';
    const submitTx = await contract.submitMilestone(campaignId, proofUrl);
    await submitTx.wait();
    console.log('✅ Milestone proof submitted! TX:', submitTx.hash);
    console.log('🔗 Proof URL:', proofUrl);

    // Step 4: Trigger AI verification via backend API
    console.log('\n🤖 Step 4: Triggering AI verification...');
    try {
        const response = await fetch('http://localhost:3001/api/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                campaignId: Number(campaignId),
                milestoneIndex: 0,
                proofUrl: proofUrl
            })
        });

        const result = await response.json();
        console.log('✅ AI Verification Result:', JSON.stringify(result, null, 2));

        if (result.success && result.passed) {
            console.log('\n🎉 SUCCESS! Milestone verified and funds released!');
        } else if (result.success && !result.passed) {
            console.log('\n⚠️ Milestone verification failed:', result.feedback);
        } else {
            console.log('\n❌ Verification error:', result.error);
        }
    } catch (error) {
        console.log('⚠️ Could not call backend API. Is the backend running on port 3001?');
        console.log('   Run: cd backend && npm run dev');
        console.log('   Then call: POST http://localhost:3001/api/verify');
        console.log('   Body: { campaignId:', Number(campaignId), ', milestoneIndex: 0, proofUrl: "' + proofUrl + '" }');
    }

    // Show final campaign state
    console.log('\n📊 Final Campaign State:');
    const campaign = await contract.getCampaign(campaignId);
    console.log('   Title:', campaign.title);
    console.log('   Goal:', ethers.formatEther(campaign.fundingGoal), 'MON');
    console.log('   Raised:', ethers.formatEther(campaign.raisedAmount), 'MON');
    console.log('   State:', ['ACTIVE', 'COMPLETED', 'FAILED'][Number(campaign.state)]);
    console.log('   Current Milestone:', Number(campaign.currentMilestone));

    console.log('\n🔗 View on explorer:');
    console.log('   https://testnet.monadexplorer.com/address/' + CONTRACT_ADDRESS);
    console.log('\n🌐 View in frontend:');
    console.log('   http://localhost:5173/campaigns/' + campaignId);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Error:', error);
        process.exit(1);
    });
