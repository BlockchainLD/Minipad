import { EAS, SchemaEncoder, SchemaRegistry } from "@ethereum-attestation-service/eas-sdk";
import { usePublicClient, useWalletClient } from "wagmi";
import { base } from "viem/chains";
import { useCallback, useEffect, useState } from "react";

// EAS Configuration for Base
const EAS_CONTRACT_ADDRESS = "0x4200000000000000000000000000000000000021";
const SCHEMA_REGISTRY_ADDRESS = "0x4200000000000000000000000000000000000020";

// Schema definitions for different types of attestations
export const SCHEMA_DEFINITIONS = {
  IDEA: "string title, string description, string author, string authorFid, string ideaId, uint256 timestamp",
  REMIX: "string title, string description, string remixer, string remixerFid, string originalIdeaId, string remixId, uint256 timestamp",
  CLAIM: "string ideaId, string claimer, string claimerFid, uint256 timestamp",
  COMPLETION: "string ideaId, string claimer, string miniappUrl, string claimerFid, uint256 timestamp",
};

// Schema UIDs - these will be registered and populated
export const SCHEMAS = {
  IDEA: process.env.NEXT_PUBLIC_IDEA_SCHEMA_UID || "",
  REMIX: process.env.NEXT_PUBLIC_REMIX_SCHEMA_UID || "",
  CLAIM: process.env.NEXT_PUBLIC_CLAIM_SCHEMA_UID || "",
  COMPLETION: process.env.NEXT_PUBLIC_COMPLETION_SCHEMA_UID || "",
};

// Custom hook for EAS functionality following Base/Farcaster best practices
export function useEAS() {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [eas, setEas] = useState<EAS | null>(null);
  const [schemaRegistry, setSchemaRegistry] = useState<SchemaRegistry | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);


  const initializeEAS = useCallback(async () => {
    if (!publicClient || !walletClient) {
      throw new Error("Wallet not connected");
    }

    // Ensure we're on Base network
    if (publicClient.chain?.id !== base.id) {
      throw new Error("Please switch to Base network");
    }

    console.log("🔗 Initializing EAS on Base mainnet...");

    // Initialize EAS with gasless transactions support
    const easInstance = new EAS(EAS_CONTRACT_ADDRESS);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    easInstance.connect(walletClient as any);
    
    // Configure for gasless transactions using Base Account
    setEas(easInstance);

    // Initialize Schema Registry
    const schemaRegistryInstance = new SchemaRegistry(SCHEMA_REGISTRY_ADDRESS);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    schemaRegistryInstance.connect(walletClient as any);
    setSchemaRegistry(schemaRegistryInstance);

    // Check if schemas are configured via environment variables
    const hasAllSchemas = Object.values(SCHEMAS).every(schema => schema && schema.length > 0);
    
    if (hasAllSchemas) {
      console.log("✅ All EAS schemas configured via environment variables");
      setIsInitialized(true);
    } else {
      console.error("❌ EAS schemas not configured. Please register schemas and add UIDs to environment variables.");
      throw new Error("EAS schemas not configured. Please run the schema registration script and update environment variables.");
    }
  }, [publicClient, walletClient]);

  useEffect(() => {
    if (publicClient && walletClient && !isInitialized) {
      initializeEAS().catch(console.error);
    }
  }, [publicClient, walletClient, isInitialized, initializeEAS]);

  // Check if EAS is properly configured
  const isEASConfigured = Object.values(SCHEMAS).every(schema => schema && schema.length > 0);

  return {
    eas,
    schemaRegistry,
    isInitialized,
    isEASConfigured,
    walletClient,
    initializeEAS
  };
}

// EAS helper functions
export async function createIdeaAttestation(
  eas: EAS,
  title: string,
  description: string,
  author: string,
  authorFid?: string,
  ideaId?: string
) {
  // Validate inputs
  if (!title || !description || !author) {
    throw new Error("Missing required fields for idea attestation");
  }

  if (!SCHEMAS.IDEA) {
    throw new Error("Idea schema not registered. Please ensure EAS is properly initialized.");
  }

  // Encode the data
  const schemaEncoder = new SchemaEncoder(SCHEMA_DEFINITIONS.IDEA);
  const encodedData = schemaEncoder.encodeData([
    { name: "title", value: title, type: "string" },
    { name: "description", value: description, type: "string" },
    { name: "author", value: author, type: "string" },
    { name: "authorFid", value: authorFid || "", type: "string" },
    { name: "ideaId", value: ideaId || "", type: "string" },
    { name: "timestamp", value: BigInt(Math.floor(Date.now() / 1000)), type: "uint256" },
  ]);

  // Create the attestation
  const tx = await eas.attest({
    schema: SCHEMAS.IDEA,
    data: {
      recipient: author,
      expirationTime: BigInt(0),
      revocable: true,
      data: encodedData,
    },
  });

  return tx;
}

// Create a remix attestation
export async function createRemixAttestation(
  eas: EAS,
  title: string,
  description: string,
  remixer: string,
  originalIdeaId: string,
  remixId: string,
  remixerFid?: string
) {
  if (!title || !description || !remixer || !originalIdeaId || !remixId) {
    throw new Error("Missing required fields for remix attestation");
  }

  if (!SCHEMAS.REMIX) {
    throw new Error("Remix schema not registered. Please ensure EAS is properly initialized.");
  }

  const schemaEncoder = new SchemaEncoder(SCHEMA_DEFINITIONS.REMIX);
  const encodedData = schemaEncoder.encodeData([
    { name: "title", value: title, type: "string" },
    { name: "description", value: description, type: "string" },
    { name: "remixer", value: remixer, type: "string" },
    { name: "remixerFid", value: remixerFid || "", type: "string" },
    { name: "originalIdeaId", value: originalIdeaId, type: "string" },
    { name: "remixId", value: remixId, type: "string" },
    { name: "timestamp", value: BigInt(Math.floor(Date.now() / 1000)), type: "uint256" },
  ]);

  const tx = await eas.attest({
    schema: SCHEMAS.REMIX,
    data: {
      recipient: remixer,
      expirationTime: BigInt(0),
      revocable: true,
      data: encodedData,
    },
  });

  return tx;
}

// Create a claim attestation
export async function createClaimAttestation(
  eas: EAS,
  ideaId: string,
  claimer: string,
  claimerFid?: string
) {
  if (!ideaId || !claimer) {
    throw new Error("Missing required fields for claim attestation");
  }

  if (!SCHEMAS.CLAIM) {
    throw new Error("Claim schema not registered. Please ensure EAS is properly initialized.");
  }

  const schemaEncoder = new SchemaEncoder(SCHEMA_DEFINITIONS.CLAIM);
  const encodedData = schemaEncoder.encodeData([
    { name: "ideaId", value: ideaId, type: "string" },
    { name: "claimer", value: claimer, type: "string" },
    { name: "claimerFid", value: claimerFid || "", type: "string" },
    { name: "timestamp", value: BigInt(Math.floor(Date.now() / 1000)), type: "uint256" },
  ]);

  const tx = await eas.attest({
    schema: SCHEMAS.CLAIM,
    data: {
      recipient: claimer,
      expirationTime: BigInt(0),
      revocable: true,
      data: encodedData,
    },
  });

  return tx;
}

// Create a completion attestation
export async function createCompletionAttestation(
  eas: EAS,
  ideaId: string,
  claimer: string,
  miniappUrl: string,
  claimerFid?: string
) {
  if (!ideaId || !claimer || !miniappUrl) {
    throw new Error("Missing required fields for completion attestation");
  }

  // Validate URL format
  try {
    new URL(miniappUrl);
  } catch {
    throw new Error("Invalid miniapp URL format");
  }

  if (!SCHEMAS.COMPLETION) {
    throw new Error("Completion schema not registered. Please ensure EAS is properly initialized.");
  }

  const schemaEncoder = new SchemaEncoder(SCHEMA_DEFINITIONS.COMPLETION);
  const encodedData = schemaEncoder.encodeData([
    { name: "ideaId", value: ideaId, type: "string" },
    { name: "claimer", value: claimer, type: "string" },
    { name: "miniappUrl", value: miniappUrl, type: "string" },
    { name: "claimerFid", value: claimerFid || "", type: "string" },
    { name: "timestamp", value: BigInt(Math.floor(Date.now() / 1000)), type: "uint256" },
  ]);

  const tx = await eas.attest({
    schema: SCHEMAS.COMPLETION,
    data: {
      recipient: claimer,
      expirationTime: BigInt(0),
      revocable: true,
      data: encodedData,
    },
  });

  return tx;
}


// Revoke an attestation by UID
export async function revokeAttestation(
  eas: EAS,
  attestationUid: string,
  schemaUid?: string
) {
  if (!attestationUid) {
    throw new Error("Attestation UID is required for revocation");
  }

  // If schema UID is not provided, we need to determine it from the attestation
  // For now, we'll require the schema UID to be passed
  if (!schemaUid) {
    throw new Error("Schema UID is required for revocation");
  }

  const tx = await eas.revoke({
    schema: schemaUid,
    data: {
      uid: attestationUid,
    },
  });

  return tx;
}


