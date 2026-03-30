#!/usr/bin/env node

/**
 * Deploy MinipadFeeResolver to Base mainnet.
 *
 * Prerequisites:
 *   1. Install Foundry: curl -L https://foundry.paradigm.xyz | bash && foundryup
 *   2. Compile the contract: cd contracts && forge build && cd ..
 *
 * Usage:
 *   PRIVATE_KEY=0x... node scripts/deploy-resolver.js
 *   PRIVATE_KEY=0x... MIN_FEE_WEI=3300000000000 node scripts/deploy-resolver.js
 *
 * Default MIN_FEE_WEI = 3300000000000 wei (~$0.01 at $3,000/ETH).
 * Adjust quarterly or via setMinFee() on the deployed contract.
 */

const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

const EAS_ADDRESS = "0x4200000000000000000000000000000000000021"; // Base mainnet
const DEFAULT_MIN_FEE_WEI = "3300000000000"; // 0.0000033 ETH ≈ $0.01 at $3,000/ETH

async function main() {
  // ── Validate inputs ──────────────────────────────────────────────────────────
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error("❌ PRIVATE_KEY environment variable is required");
    console.log("   export PRIVATE_KEY=0x...");
    process.exit(1);
  }

  const minFeeWei = process.env.MIN_FEE_WEI || DEFAULT_MIN_FEE_WEI;
  console.log(`💰 Min fee: ${minFeeWei} wei (${ethers.formatEther(minFeeWei)} ETH)`);

  // ── Load compiled artifact ───────────────────────────────────────────────────
  const artifactPath = path.join(
    __dirname,
    "../contracts/out/MinipadFeeResolver.sol/MinipadFeeResolver.json"
  );

  if (!fs.existsSync(artifactPath)) {
    console.error("❌ Compiled artifact not found at:", artifactPath);
    console.log("   Run: cd contracts && forge build && cd ..");
    process.exit(1);
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const abi = artifact.abi;
  const bytecode = artifact.bytecode.object;

  if (!bytecode || bytecode === "0x") {
    console.error("❌ Empty bytecode in artifact — did forge build succeed?");
    process.exit(1);
  }

  // ── Connect ──────────────────────────────────────────────────────────────────
  const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
  const signer = new ethers.Wallet(privateKey, provider);

  const network = await provider.getNetwork();
  if (network.chainId !== 8453n) {
    console.error(`❌ Connected to chain ${network.chainId}, expected Base mainnet (8453)`);
    process.exit(1);
  }

  console.log("🔑 Deploying from:", signer.address);
  console.log("🌐 Network: Base mainnet");

  const balance = await provider.getBalance(signer.address);
  console.log("💳 Balance:", ethers.formatEther(balance), "ETH");

  if (balance === 0n) {
    console.error("❌ Wallet has no ETH — add funds to pay for deployment gas");
    process.exit(1);
  }

  // ── Deploy ───────────────────────────────────────────────────────────────────
  console.log("\n📦 Deploying MinipadFeeResolver...");
  const factory = new ethers.ContractFactory(abi, bytecode, signer);
  const contract = await factory.deploy(EAS_ADDRESS, minFeeWei);

  console.log("⏳ Waiting for transaction:", contract.deploymentTransaction()?.hash);
  await contract.waitForDeployment();

  const resolverAddress = await contract.getAddress();

  // ── Verify deployment ────────────────────────────────────────────────────────
  const deployedEas = await contract.eas();
  const deployedOwner = await contract.owner();
  const deployedMinFee = await contract.minFee();

  console.log("\n✅ MinipadFeeResolver deployed successfully!");
  console.log("   Address:", resolverAddress);
  console.log("   EAS:    ", deployedEas);
  console.log("   Owner:  ", deployedOwner);
  console.log("   MinFee: ", deployedMinFee.toString(), "wei");

  // ── Output env vars ──────────────────────────────────────────────────────────
  console.log("\n📋 Add these to your .env.local:\n");
  console.log(`RESOLVER_ADDRESS=${resolverAddress}`);
  console.log(`NEXT_PUBLIC_MIN_FEE_WEI=${minFeeWei}`);
  console.log("\n📋 Then re-register fee schemas:");
  console.log(`   PRIVATE_KEY=0x... RESOLVER_ADDRESS=${resolverAddress} node scripts/register-eas-schemas.js`);
}

main().catch((err) => {
  console.error("❌ Deployment failed:", err);
  process.exit(1);
});
