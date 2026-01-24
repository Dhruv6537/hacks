import { ethers } from "hardhat";

async function main() {
    console.log("🚀 Deploying DeFund to Monad...\n");

    const [deployer] = await ethers.getSigners();
    console.log("📍 Deploying with account:", deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "MON\n");

    // Deploy DeFund contract with deployer as initial verifier
    const DeFund = await ethers.getContractFactory("DeFund");
    const defund = await DeFund.deploy(deployer.address);

    await defund.waitForDeployment();
    const contractAddress = await defund.getAddress();

    console.log("✅ DeFund deployed successfully!");
    console.log("📄 Contract Address:", contractAddress);
    console.log("🔗 Monad Explorer:", `https://testnet.monadexplorer.com/address/${contractAddress}`);
    console.log("\n📋 Next Steps:");
    console.log("1. Update backend/.env with CONTRACT_ADDRESS=" + contractAddress);
    console.log("2. Update frontend with the contract address");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
