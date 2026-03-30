#!/usr/bin/env node

/**
 * Script to register EAS schemas on Base mainnet
 * Run this script to register all required schemas for the Minipad platform
 *
 * Usage (zero-resolver, free attestations):
 *   PRIVATE_KEY=0x... node scripts/register-eas-schemas.js
 *
 * Usage (with fee resolver for IDEA, CLAIM, COMPLETION):
 *   PRIVATE_KEY=0x... RESOLVER_ADDRESS=0x... node scripts/register-eas-schemas.js
 *
 * Set RESOLVER_ADDRESS after deploying MinipadFeeResolver:
 *   PRIVATE_KEY=0x... MIN_FEE_WEI=3300000000000 node scripts/deploy-resolver.js
 */

const { SchemaRegistry } = require("@ethereum-attestation-service/eas-sdk");
const { ethers } = require("ethers");

// EAS Configuration for Base
const EAS_CONTRACT_ADDRESS = "0x4200000000000000000000000000000000000021";
const SCHEMA_REGISTRY_ADDRESS = "0x4200000000000000000000000000000000000020";

// Schema definitions
const SCHEMA_DEFINITIONS = {
  IDEA: "string title,string description,string author,string authorFid,string ideaId,uint256 timestamp",
  REMIX: "string title,string description,string remixer,string remixerFid,string originalIdeaId,string remixId,uint256 timestamp",
  CLAIM: "string ideaId,string claimer,string claimerFid,uint256 timestamp",
  COMPLETION: "string ideaId,string claimer,string miniappUrl,string claimerFid,uint256 timestamp",
  BUILD_ENDORSEMENT: "string ideaId,string buildUrl,string endorser,string endorserFid,string builderId,uint256 timestamp",
};

// Schemas that route through MinipadFeeResolver when RESOLVER_ADDRESS is set.
// REMIX and BUILD_ENDORSEMENT remain zero-cost (zero resolver).
const FEE_SCHEMAS = new Set(["IDEA", "CLAIM", "COMPLETION"]);

async function registerSchemas() {
  // Check for private key
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error("❌ PRIVATE_KEY environment variable is required");
    console.log("Please set your private key: export PRIVATE_KEY=0x...");
    process.exit(1);
  }

  // Optional resolver address — if omitted all schemas use the zero resolver
  const resolverAddress = process.env.RESOLVER_ADDRESS || ethers.ZeroAddress;
  const usingResolver = resolverAddress !== ethers.ZeroAddress;

  if (usingResolver) {
    console.log(`🔗 Using fee resolver: ${resolverAddress}`);
    console.log("   IDEA, CLAIM, COMPLETION → resolver");
    console.log("   REMIX, BUILD_ENDORSEMENT → zero resolver (free)\n");
  } else {
    console.log("ℹ️  No RESOLVER_ADDRESS set — all schemas use zero resolver (free)\n");
  }

  try {
    // Create ethers signer — EAS SDK requires an ethers v6 Signer
    const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
    const signer = new ethers.Wallet(privateKey, provider);
    console.log("🔑 Using account:", signer.address);

    const schemaRegistry = new SchemaRegistry(SCHEMA_REGISTRY_ADDRESS);
    schemaRegistry.connect(signer);

    console.log("🌐 Connected to Base mainnet");
    console.log("📋 Registering schemas...\n");

    const registeredSchemas = {};

    // Register each schema
    for (const [schemaName, schemaDefinition] of Object.entries(SCHEMA_DEFINITIONS)) {
      try {
        const schemaResolver =
          usingResolver && FEE_SCHEMAS.has(schemaName) ? resolverAddress : ethers.ZeroAddress;

        console.log(`📝 Registering ${schemaName} schema...`);
        console.log(`   Definition: ${schemaDefinition}`);
        console.log(`   Resolver:   ${schemaResolver}`);

        const schemaUid = await schemaRegistry.register({
          schema: schemaDefinition,
          resolverAddress: schemaResolver,
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

    console.log("\n📋 Copy the above environment variables to your .env.local file");
    console.log("🚀 Restart your development server to use the new schemas");

  } catch (error) {
    console.error("❌ Error registering schemas:", error);
    process.exit(1);
  }
}

// Run the script
registerSchemas();
