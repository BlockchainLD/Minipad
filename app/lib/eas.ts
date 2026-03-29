import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import { usePublicClient, useWalletClient } from "wagmi";
import { base } from "viem/chains";
import { useCallback, useEffect, useState } from "react";

// EAS Configuration for Base
const EAS_CONTRACT_ADDRESS = "0x4200000000000000000000000000000000000021";

// Schema definitions for different types of attestations
export const SCHEMA_DEFINITIONS = {
  IDEA: "string title, string description, string author, string authorFid, string ideaId, uint256 timestamp",
  REMIX: "string title, string description, string remixer, string remixerFid, string originalIdeaId, string remixId, uint256 timestamp",
  CLAIM: "string ideaId, string claimer, string claimerFid, uint256 timestamp",
  COMPLETION: "string ideaID,string claimer,string miniappUrl,string claimerFid,uint256 timestamp",
  BUILD_ENDORSEMENT: "string ideaID,string buildUrl,string endorser,string endorseFid,string builderId,uint256 timestamp",
};

// Schema UIDs - these will be registered and populated
export const SCHEMAS = {
  IDEA: process.env.NEXT_PUBLIC_IDEA_SCHEMA_UID || "",
  REMIX: process.env.NEXT_PUBLIC_REMIX_SCHEMA_UID || "",
  CLAIM: process.env.NEXT_PUBLIC_CLAIM_SCHEMA_UID || "",
  COMPLETION: process.env.NEXT_PUBLIC_COMPLETION_SCHEMA_UID || "",
  BUILD_ENDORSEMENT: process.env.NEXT_PUBLIC_BUILD_ENDORSEMENT_SCHEMA_UID || "",
};

// Custom hook for EAS functionality following Base/Farcaster best practices
export function useEAS() {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [eas, setEas] = useState<EAS | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeEAS = useCallback(async () => {
    if (!publicClient || !walletClient) {
      throw new Error("Wallet not connected");
    }

    // Ensure we're on Base network
    if (publicClient.chain?.id !== base.id) {
      throw new Error("Please switch to Base network");
    }

    // Convert viem wallet client to ethers signer (EAS SDK requires ethers)
    const { account, chain, transport } = walletClient;
    const network = { chainId: chain.id, name: chain.name };
    const provider = new BrowserProvider(transport, network);
    const ethersSigner = new JsonRpcSigner(provider, account.address);

    // Initialize EAS
    const easInstance = new EAS(EAS_CONTRACT_ADDRESS);
    easInstance.connect(ethersSigner);
    setEas(easInstance);

    // Check if schemas are configured via environment variables
    const hasAllSchemas = Object.values(SCHEMAS).every(schema => schema && schema.length > 0);

    if (hasAllSchemas) {
      setIsInitialized(true);
    } else {
      console.error("EAS schemas not configured. Please run the schema registration script and update environment variables.");
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
    isInitialized,
    isEASConfigured,
    walletClient,
    initializeEAS
  };
}

// EAS helper functions — all return the attestation UID string directly

export async function createIdeaAttestation(
  eas: EAS,
  title: string,
  description: string,
  author: string,
  authorFid?: string,
  ideaId?: string
): Promise<string> {
  if (!title || !description || !author) {
    throw new Error("Missing required fields for idea attestation");
  }

  if (!SCHEMAS.IDEA) {
    throw new Error("Idea schema not registered. Please ensure EAS is properly initialized.");
  }

  const schemaEncoder = new SchemaEncoder(SCHEMA_DEFINITIONS.IDEA);
  const encodedData = schemaEncoder.encodeData([
    { name: "title", value: title, type: "string" },
    { name: "description", value: description, type: "string" },
    { name: "author", value: author, type: "string" },
    { name: "authorFid", value: authorFid || "", type: "string" },
    { name: "ideaId", value: ideaId || "", type: "string" },
    { name: "timestamp", value: BigInt(Math.floor(Date.now() / 1000)), type: "uint256" },
  ]);

  const tx = await eas.attest({
    schema: SCHEMAS.IDEA,
    data: {
      recipient: author,
      expirationTime: BigInt(0),
      revocable: true,
      data: encodedData,
    },
  });

  return await tx.wait();
}

// Create a remix attestation
export async function createRemixAttestation(
  eas: EAS,
  title: string,
  description: string,
  remixer: string,
  originalIdeaId: string | { toString(): string },
  remixId: string | { toString(): string },
  remixerFid?: string
): Promise<string> {
  const originalIdeaIdStr = typeof originalIdeaId === 'string' ? originalIdeaId : originalIdeaId.toString();
  const remixIdStr = typeof remixId === 'string' ? remixId : remixId.toString();

  if (!title || !description || !remixer || !originalIdeaIdStr || !remixIdStr) {
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
    { name: "originalIdeaId", value: originalIdeaIdStr, type: "string" },
    { name: "remixId", value: remixIdStr, type: "string" },
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

  return await tx.wait();
}

// Create a claim attestation
export async function createClaimAttestation(
  eas: EAS,
  ideaId: string | { toString(): string },
  claimer: string,
  claimerFid?: string
): Promise<string> {
  const ideaIdStr = typeof ideaId === 'string' ? ideaId : ideaId.toString();

  if (!ideaIdStr || !claimer) {
    throw new Error("Missing required fields for claim attestation");
  }

  if (!SCHEMAS.CLAIM) {
    throw new Error("Claim schema not registered. Please ensure EAS is properly initialized.");
  }

  const schemaEncoder = new SchemaEncoder(SCHEMA_DEFINITIONS.CLAIM);
  const encodedData = schemaEncoder.encodeData([
    { name: "ideaId", value: ideaIdStr, type: "string" },
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

  return await tx.wait();
}

// Create a completion attestation
export async function createCompletionAttestation(
  eas: EAS,
  ideaId: string | { toString(): string },
  claimer: string,
  miniappUrl: string,
  claimerFid?: string
): Promise<string> {
  const ideaIdStr = typeof ideaId === 'string' ? ideaId : ideaId.toString();

  if (!ideaIdStr || !claimer || !miniappUrl) {
    throw new Error("Missing required fields for completion attestation");
  }

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
    { name: "ideaID", value: ideaIdStr, type: "string" },
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

  return await tx.wait();
}

// Create a build endorsement attestation (user attesting they've tried the build)
export async function createBuildEndorsementAttestation(
  eas: EAS,
  ideaId: string,
  buildUrl: string,
  endorser: string,
  endorserFid?: string,
  builderId?: string
): Promise<string> {
  if (!ideaId || !endorser) {
    throw new Error("Missing required fields for build endorsement attestation");
  }

  if (!SCHEMAS.BUILD_ENDORSEMENT) {
    throw new Error("Build endorsement schema not registered. Please ensure EAS is properly initialized.");
  }

  const schemaEncoder = new SchemaEncoder(SCHEMA_DEFINITIONS.BUILD_ENDORSEMENT);
  const encodedData = schemaEncoder.encodeData([
    { name: "ideaID", value: ideaId, type: "string" },
    { name: "buildUrl", value: buildUrl || "", type: "string" },
    { name: "endorser", value: endorser, type: "string" },
    { name: "endorseFid", value: endorserFid || "", type: "string" },
    { name: "builderId", value: builderId || "", type: "string" },
    { name: "timestamp", value: BigInt(Math.floor(Date.now() / 1000)), type: "uint256" },
  ]);

  const tx = await eas.attest({
    schema: SCHEMAS.BUILD_ENDORSEMENT,
    data: {
      recipient: endorser,
      expirationTime: BigInt(0),
      revocable: true,
      data: encodedData,
    },
  });

  return await tx.wait();
}

// Revoke an attestation by UID
export async function revokeAttestation(
  eas: EAS,
  attestationUid: string,
  schemaUid: string
): Promise<void> {
  if (!attestationUid) {
    throw new Error("Attestation UID is required for revocation");
  }

  if (!schemaUid) {
    throw new Error("Schema UID is required for revocation");
  }

  const tx = await eas.revoke({
    schema: schemaUid,
    data: {
      uid: attestationUid,
    },
  });

  await tx.wait();
}
