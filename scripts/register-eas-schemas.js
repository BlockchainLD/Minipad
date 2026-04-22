#!/usr/bin/env node

/**
 * Script to register EAS schemas on Base mainnet
 * Run this script to register all required schemas for the Minipad platform
 *
 * Usage (zero-resolver, free attestations — first-time setup):
 *   PRIVATE_KEY=0x... node scripts/register-eas-schemas.js
 *
 * Usage (with fee resolver for IDEA, CLAIM, COMPLETION — after deploying MinipadFeeResolver):
 *   PRIVATE_KEY=0x... RESOLVER_ADDRESS=0x... node scripts/register-eas-schemas.js
 *
 *   When RESOLVER_ADDRESS is set, only IDEA, CLAIM, and COMPLETION are registered
 *   (with the resolver). REMIX and BUILD_ENDORSEMENT already exist on-chain with the
 *   zero resolver from the initial setup — keep their UIDs from your .env.local.
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
// REMIX and BUILD_ENDORSEMENT remain zero-cost (zero resolver) and are only
// registered during initial setup (no RESOLVER_ADDRESS). Re-running with
// RESOLVER_ADDRESS skips them to avoid AlreadyExists errors on-chain.
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

  // When using a fee resolver, only register the fee schemas.
  // REMIX and BUILD_ENDORSEMENT were already registered with ZeroAddress on
  // first setup and cannot be re-registered — their UIDs stay in .env.local.
  const schemasToRegister = usingResolver
    ? Object.fromEntries(Object.entries(SCHEMA_DEFINITIONS).filter(([name]) => FEE_SCHEMAS.has(name)))
    : SCHEMA_DEFINITIONS;

  if (usingResolver) {
    console.log(`🔗 Using fee resolver: ${resolverAddress}`);
    console.log("   Registering: IDEA, CLAIM, COMPLETION → resolver");
    console.log("   Skipping:    REMIX, BUILD_ENDORSEMENT (already on-chain with zero resolver)\n");
  } else {
    console.log("ℹ️  No RESOLVER_ADDRESS set — registering all schemas with zero resolver (free)\n");
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
    for (const [schemaName, schemaDefinition] of Object.entries(schemasToRegister)) {
      try {
        const schemaResolver = usingResolver ? resolverAddress : ethers.ZeroAddress;

        console.log(`📝 Registering ${schemaName} schema...`);
        console.log(`   Definition: ${schemaDefinition}`);
        console.log(`   Resolver:   ${schemaResolver}`);

        const result = await schemaRegistry.register({
          schema: schemaDefinition,
          resolverAddress: schemaResolver,
          revocable: true,
        });

        // SDK v2.x returns a transaction object — wait for confirmation then compute UID.
        // UID is deterministic: keccak256(abi.encodePacked(schema, resolver, revocable))
        if (result && typeof result.wait === "function") {
          await result.wait();
        }
        const schemaUid = ethers.keccak256(
          ethers.solidityPacked(
            ["string", "address", "bool"],
            [schemaDefinition, schemaResolver, true]
          )
        );

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

    if (usingResolver) {
      console.log("\nℹ️  Keep your existing REMIX and BUILD_ENDORSEMENT UIDs from .env.local unchanged.");
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

