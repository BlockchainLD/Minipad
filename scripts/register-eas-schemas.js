#!/usr/bin/env node

/**
 * Script to register EAS schemas on Base mainnet
 * Run this script to register all required schemas for the Minipad platform
 */

const { EAS, SchemaRegistry } = require("@ethereum-attestation-service/eas-sdk");
const { createWalletClient, http, createPublicClient } = require("viem");
const { base } = require("viem/chains");
const { privateKeyToAccount } = require("viem/accounts");

// EAS Configuration for Base
const EAS_CONTRACT_ADDRESS = "0x4200000000000000000000000000000000000021";
const SCHEMA_REGISTRY_ADDRESS = "0x4200000000000000000000000000000000000020";

// Schema definitions
const SCHEMA_DEFINITIONS = {
  IDEA: "string title, string description, string author, string authorFid, string ideaId, uint256 timestamp",
  REMIX: "string title, string description, string remixer, string remixerFid, string originalIdeaId, string remixId, uint256 timestamp",
  CLAIM: "string ideaId, string claimer, string claimerFid, uint256 timestamp",
  COMPLETION: "string ideaId, string claimer, string miniappUrl, string claimerFid, uint256 timestamp",
};

async function registerSchemas() {
  // Check for private key
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error("❌ PRIVATE_KEY environment variable is required");
    console.log("Please set your private key: export PRIVATE_KEY=0x...");
    process.exit(1);
  }

  try {
    // Create account and clients
    const account = privateKeyToAccount(privateKey);
    console.log("🔑 Using account:", account.address);

    const publicClient = createPublicClient({
      chain: base,
      transport: http("https://mainnet.base.org"),
    });

    const walletClient = createWalletClient({
      account,
      chain: base,
      transport: http("https://mainnet.base.org"),
    });

    // Initialize EAS and Schema Registry
    const eas = new EAS(EAS_CONTRACT_ADDRESS);
    eas.connect(walletClient);

    const schemaRegistry = new SchemaRegistry(SCHEMA_REGISTRY_ADDRESS);
    schemaRegistry.connect(walletClient);

    console.log("🌐 Connected to Base mainnet");
    console.log("📋 Registering schemas...\n");

    const registeredSchemas = {};

    // Register each schema
    for (const [schemaName, schemaDefinition] of Object.entries(SCHEMA_DEFINITIONS)) {
      try {
        console.log(`📝 Registering ${schemaName} schema...`);
        console.log(`   Definition: ${schemaDefinition}`);

        const schemaUid = await schemaRegistry.register({
          schema: schemaDefinition,
          resolverAddress: EAS_CONTRACT_ADDRESS,
          revocable: true,
        });

        registeredSchemas[schemaName] = schemaUid;
        console.log(`✅ ${schemaName} schema registered: ${schemaUid}\n`);

      } catch (error) {
        console.error(`❌ Failed to register ${schemaName} schema:`, error.message);
        throw error;
      }
    }

    // Output environment variables
    console.log("🎉 All schemas registered successfully!\n");
    console.log("📋 Add these environment variables to your .env.local file:\n");
    
    for (const [schemaName, schemaUid] of Object.entries(registeredSchemas)) {
      console.log(`NEXT_PUBLIC_${schemaName}_SCHEMA_UID=${schemaUid}`);
    }

    console.log("\n💡 Copy the above environment variables to your .env.local file");
    console.log("🚀 Restart your development server to use the new schemas");

  } catch (error) {
    console.error("❌ Error registering schemas:", error);
    process.exit(1);
  }
}

// Run the script
registerSchemas();
