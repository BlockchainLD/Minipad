#!/usr/bin/env node

/**
 * Deploy MinipadFeeResolver to Base mainnet.
 *
 * Prerequisites:
 *   1. Install Foundry: curl -L https://foundry.paradigm.xyz | bash && foundryup
 *   2. Compile the contract: cd contracts && forge build && cd ..
 *
 * Usage:
 *   PRIVATE_KEY=0x... GUARDIAN_ADDRESS=0x... node scripts/deploy-resolver.js
 *   PRIVATE_KEY=0x... GUARDIAN_ADDRESS=0x... MIN_FEE_WEI=3300000000000 node scripts/deploy-resolver.js
 *
 * Required env vars:
 *   PRIVATE_KEY        — deployer wallet (becomes the contract owner)
 *   GUARDIAN_ADDRESS   — permanent safety address; can pause and veto owner unpause.
 *                        Use a hardware wallet / cold wallet different from PRIVATE_KEY.
 *                        IMMUTABLE: cannot be changed after deployment.
 *
 * Optional env vars:
 *   MIN_FEE_WEI        — default 3300000000000 wei (~$0.01 at $3,000/ETH)
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

  const guardianAddress = process.env.GUARDIAN_ADDRESS;
  if (!guardianAddress) {
    console.error("❌ GUARDIAN_ADDRESS environment variable is required");
    console.log("   This is the permanent safety address that can pause and veto owner unpause.");
    console.log("   Use a hardware wallet or cold wallet DIFFERENT from your deployer key.");
    console.log("   WARNING: This address is immutable and cannot be changed after deployment.");
    process.exit(1);
  }

  if (!ethers.isAddress(guardianAddress)) {
    console.error("❌ GUARDIAN_ADDRESS is not a valid Ethereum address:", guardianAddress);
    process.exit(1);
  }

  const minFeeWei = process.env.MIN_FEE_WEI || DEFAULT_MIN_FEE_WEI;
  console.log(`💰 Min fee: ${minFeeWei} wei (${ethers.formatEther(minFeeWei)} ETH)`);
  console.log(`🛡️  Guardian: ${guardianAddress}`);

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

  console.log("🔑 Deploying from (owner):", signer.address);
  console.log("🌐 Network: Base mainnet");

  if (signer.address.toLowerCase() === guardianAddress.toLowerCase()) {
    console.error("❌ GUARDIAN_ADDRESS must be different from the deployer address.");
    console.log("   The guardian is a safety fallback — using the same address defeats the purpose.");
    process.exit(1);
  }

  const balance = await provider.getBalance(signer.address);
  console.log("💳 Balance:", ethers.formatEther(balance), "ETH");

  if (balance === 0n) {
    console.error("❌ Wallet has no ETH — add funds to pay for deployment gas");
    process.exit(1);
  }

  // ── Deploy ───────────────────────────────────────────────────────────────────
  console.log("\n📦 Deploying MinipadFeeResolver...");
  const factory = new ethers.ContractFactory(abi, bytecode, signer);
  const contract = await factory.deploy(EAS_ADDRESS, minFeeWei, guardianAddress);

  console.log("⏳ Waiting for transaction:", contract.deploymentTransaction()?.hash);
  await contract.waitForDeployment();

  const resolverAddress = await contract.getAddress();

  // ── Verify deployment ────────────────────────────────────────────────────────
  const deployedEas      = await contract.eas();
  const deployedOwner    = await contract.owner();
  const deployedGuardian = await contract.guardian();
  const deployedMinFee   = await contract.minFee();
  const deployedPaused   = await contract.paused();

  console.log("\n✅ MinipadFeeResolver deployed successfully!");
  console.log("   Address:  ", resolverAddress);
  console.log("   EAS:      ", deployedEas);
  console.log("   Owner:    ", deployedOwner);
  console.log("   Guardian: ", deployedGuardian);
  console.log("   MinFee:   ", deployedMinFee.toString(), "wei");
  console.log("   Paused:   ", deployedPaused);

  // ── Output env vars ──────────────────────────────────────────────────────────
  console.log("\n📋 Add these to your .env.local:\n");
  console.log(`RESOLVER_ADDRESS=${resolverAddress}`);
  console.log(`NEXT_PUBLIC_MIN_FEE_WEI=${minFeeWei}`);
  console.log(`NEXT_PUBLIC_GUARDIAN_ADDRESS=${guardianAddress}`);
  console.log("\n📋 Then re-register fee schemas:");
  console.log(`   PRIVATE_KEY=0x... RESOLVER_ADDRESS=${resolverAddress} node scripts/register-eas-schemas.js`);
}

main().catch((err) => {
  console.error("❌ Deployment failed:", err);
  process.exit(1);
});
