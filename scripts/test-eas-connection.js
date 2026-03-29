#!/usr/bin/env node

/**
 * Script to test EAS connection on Base mainnet
 * This script verifies that EAS is accessible and the network is working
 */

const { EAS, SchemaRegistry } = require("@ethereum-attestation-service/eas-sdk");
const { ethers } = require("ethers");

// EAS Configuration for Base
const EAS_CONTRACT_ADDRESS = "0x4200000000000000000000000000000000000021";
const SCHEMA_REGISTRY_ADDRESS = "0x4200000000000000000000000000000000000020";

async function testEASConnection() {
  try {
    console.log("🔍 Testing EAS connection on Base mainnet...\n");

    // Create ethers provider — EAS SDK requires an ethers v6 provider/signer
    const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");

    // Test network connection
    console.log("🌐 Testing network connection...");
    const blockNumber = await provider.getBlockNumber();
    console.log(`✅ Connected to Base mainnet (Block: ${blockNumber})\n`);

    // Test EAS contract
    console.log("📋 Testing EAS contract...");
    const eas = new EAS(EAS_CONTRACT_ADDRESS);
    eas.connect(provider);

    // Try to get EAS version
    try {
      const version = await eas.getVersion();
      console.log(`✅ EAS contract accessible (Version: ${version})\n`);
    } catch (error) {
      console.log("⚠️ EAS contract accessible but version check failed:", error.message);
    }

    // Test Schema Registry
    console.log("📝 Testing Schema Registry...");
    const schemaRegistry = new SchemaRegistry(SCHEMA_REGISTRY_ADDRESS);
    schemaRegistry.connect(provider);
    
    // Try to get a schema (this will fail if no schemas exist, but that's OK)
    try {
      // This will fail if no schemas are registered, which is expected
      await schemaRegistry.getSchema("0x0000000000000000000000000000000000000000000000000000000000000000");
    } catch (error) {
      if (error.message.includes("Schema not found") || error.message.includes("not found")) {
        console.log("✅ Schema Registry accessible (no schemas registered yet)\n");
      } else {
        console.log("⚠️ Schema Registry accessible but test failed:", error.message);
      }
    }

    console.log("🎉 EAS connection test completed successfully!");
    console.log("📋 Next steps:");
    console.log("   1. Set your PRIVATE_KEY environment variable");
    console.log("   2. Run 'npm run register-schemas' to register schemas");
    console.log("   3. Add the schema UIDs to your .env.local file");
    console.log("   4. Restart your development server");

  } catch (error) {
    console.error("❌ EAS connection test failed:", error);
    console.log("\n🔧 Troubleshooting:");
    console.log("   - Check your internet connection");
    console.log("   - Verify Base mainnet is accessible");
    console.log("   - Make sure you're not behind a firewall");
    process.exit(1);
  }
}

// Run the test
testEASConnection();
