import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { usePublicClient, useWalletClient } from "wagmi";
import { base } from "viem/chains";
import type { WalletClient, PublicClient } from "viem";

// EAS Configuration for Base
const EAS_CONTRACT_ADDRESS = "0x4200000000000000000000000000000000000021" as const;

// Attested(address indexed recipient, address indexed attester, bytes32 uid, bytes32 indexed schemaUID)
const ATTESTED_TOPIC = "0x8bf46bf4cfd674fa735a3d63ec1c9ad4153f033c290341f3a588b75685141b35" as const;

const EAS_ABI = [
  {
    name: "attest",
    type: "function",
    stateMutability: "payable",
    inputs: [{ name: "request", type: "tuple", components: [
      { name: "schema", type: "bytes32" },
      { name: "data", type: "tuple", components: [
        { name: "recipient", type: "address" },
        { name: "expirationTime", type: "uint64" },
        { name: "revocable", type: "bool" },
        { name: "refUID", type: "bytes32" },
        { name: "data", type: "bytes" },
        { name: "value", type: "uint256" },
      ]},
    ]}],
    outputs: [{ name: "", type: "bytes32" }],
  },
  {
    name: "revoke",
    type: "function",
    stateMutability: "payable",
    inputs: [{ name: "request", type: "tuple", components: [
      { name: "schema", type: "bytes32" },
      { name: "data", type: "tuple", components: [
        { name: "uid", type: "bytes32" },
        { name: "value", type: "uint256" },
      ]},
    ]}],
    outputs: [],
  },
] as const;

// Schema definitions for different types of attestations
export const SCHEMA_DEFINITIONS = {
  IDEA: "string title, string description, string author, string authorFid, string ideaId, uint256 timestamp",
  REMIX: "string title, string description, string remixer, string remixerFid, string originalIdeaId, string remixId, uint256 timestamp",
  CLAIM: "string ideaId, string claimer, string claimerFid, uint256 timestamp",
  COMPLETION: "string ideaID,string claimer,string miniappUrl,string claimerFid,uint256 timestamp",
  BUILD_ENDORSEMENT: "string ideaID,string buildUrl,string endorser,string endorseFid,string builderId,uint256 timestamp",
};

// Schema UIDs populated from environment variables
export const SCHEMAS = {
  IDEA: process.env.NEXT_PUBLIC_IDEA_SCHEMA_UID || "",
  REMIX: process.env.NEXT_PUBLIC_REMIX_SCHEMA_UID || "",
  CLAIM: process.env.NEXT_PUBLIC_CLAIM_SCHEMA_UID || "",
  COMPLETION: process.env.NEXT_PUBLIC_COMPLETION_SCHEMA_UID || "",
  BUILD_ENDORSEMENT: process.env.NEXT_PUBLIC_BUILD_ENDORSEMENT_SCHEMA_UID || "",
};

export type EASContext = { walletClient: WalletClient; publicClient: PublicClient };

export function useEAS() {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const isEASConfigured = Object.values(SCHEMAS).every(s => s && s.length > 0);

  const eas: EASContext | null =
    walletClient && publicClient && publicClient.chain?.id === base.id
      ? { walletClient, publicClient }
      : null;

  return { eas, isEASConfigured };
}

// Internal helper — sends an attestation via viem and returns the UID from the receipt
async function sendAttestation(
  ctx: EASContext,
  schemaUid: string,
  encodedData: string,
  recipient: string
): Promise<string> {
  const hash = await ctx.walletClient.writeContract({
    address: EAS_CONTRACT_ADDRESS,
    abi: EAS_ABI,
    functionName: "attest",
    args: [{
      schema: schemaUid as `0x${string}`,
      data: {
        recipient: recipient as `0x${string}`,
        expirationTime: 0n,
        revocable: true,
        refUID: "0x0000000000000000000000000000000000000000000000000000000000000000",
        data: encodedData as `0x${string}`,
        value: 0n,
      },
    }],
  });

  const receipt = await ctx.publicClient.waitForTransactionReceipt({ hash });

  for (const log of receipt.logs) {
    if (
      log.address.toLowerCase() === EAS_CONTRACT_ADDRESS.toLowerCase() &&
      log.topics[0] === ATTESTED_TOPIC
    ) {
      return log.data; // uid is the only non-indexed field — lives in log.data
    }
  }
  throw new Error("Attestation UID not found in receipt");
}

export async function createIdeaAttestation(
  eas: EASContext,
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
    throw new Error("Idea schema not configured.");
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

  return sendAttestation(eas, SCHEMAS.IDEA, encodedData, author);
}

export async function createRemixAttestation(
  eas: EASContext,
  title: string,
  description: string,
  remixer: string,
  originalIdeaId: string | { toString(): string },
  remixId: string | { toString(): string },
  remixerFid?: string
): Promise<string> {
  const originalIdeaIdStr = typeof originalIdeaId === "string" ? originalIdeaId : originalIdeaId.toString();
  const remixIdStr = typeof remixId === "string" ? remixId : remixId.toString();

  if (!title || !description || !remixer || !originalIdeaIdStr || !remixIdStr) {
    throw new Error("Missing required fields for remix attestation");
  }
  if (!SCHEMAS.REMIX) {
    throw new Error("Remix schema not configured.");
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

  return sendAttestation(eas, SCHEMAS.REMIX, encodedData, remixer);
}

export async function createClaimAttestation(
  eas: EASContext,
  ideaId: string | { toString(): string },
  claimer: string,
  claimerFid?: string
): Promise<string> {
  const ideaIdStr = typeof ideaId === "string" ? ideaId : ideaId.toString();

  if (!ideaIdStr || !claimer) {
    throw new Error("Missing required fields for claim attestation");
  }
  if (!SCHEMAS.CLAIM) {
    throw new Error("Claim schema not configured.");
  }

  const schemaEncoder = new SchemaEncoder(SCHEMA_DEFINITIONS.CLAIM);
  const encodedData = schemaEncoder.encodeData([
    { name: "ideaId", value: ideaIdStr, type: "string" },
    { name: "claimer", value: claimer, type: "string" },
    { name: "claimerFid", value: claimerFid || "", type: "string" },
    { name: "timestamp", value: BigInt(Math.floor(Date.now() / 1000)), type: "uint256" },
  ]);

  return sendAttestation(eas, SCHEMAS.CLAIM, encodedData, claimer);
}

export async function createCompletionAttestation(
  eas: EASContext,
  ideaId: string | { toString(): string },
  claimer: string,
  miniappUrl: string,
  claimerFid?: string
): Promise<string> {
  const ideaIdStr = typeof ideaId === "string" ? ideaId : ideaId.toString();

  if (!ideaIdStr || !claimer || !miniappUrl) {
    throw new Error("Missing required fields for completion attestation");
  }
  try {
    new URL(miniappUrl);
  } catch {
    throw new Error("Invalid miniapp URL format");
  }
  if (!SCHEMAS.COMPLETION) {
    throw new Error("Completion schema not configured.");
  }

  const schemaEncoder = new SchemaEncoder(SCHEMA_DEFINITIONS.COMPLETION);
  const encodedData = schemaEncoder.encodeData([
    { name: "ideaID", value: ideaIdStr, type: "string" },
    { name: "claimer", value: claimer, type: "string" },
    { name: "miniappUrl", value: miniappUrl, type: "string" },
    { name: "claimerFid", value: claimerFid || "", type: "string" },
    { name: "timestamp", value: BigInt(Math.floor(Date.now() / 1000)), type: "uint256" },
  ]);

  return sendAttestation(eas, SCHEMAS.COMPLETION, encodedData, claimer);
}

export async function createBuildEndorsementAttestation(
  eas: EASContext,
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
    throw new Error("Build endorsement schema not configured.");
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

  return sendAttestation(eas, SCHEMAS.BUILD_ENDORSEMENT, encodedData, endorser);
}

export async function revokeAttestation(
  eas: EASContext,
  attestationUid: string,
  schemaUid: string
): Promise<void> {
  if (!attestationUid) throw new Error("Attestation UID is required for revocation");
  if (!schemaUid) throw new Error("Schema UID is required for revocation");

  await eas.walletClient.writeContract({
    address: EAS_CONTRACT_ADDRESS,
    abi: EAS_ABI,
    functionName: "revoke",
    args: [{
      schema: schemaUid as `0x${string}`,
      data: {
        uid: attestationUid as `0x${string}`,
        value: 0n,
      },
    }],
  });
}
