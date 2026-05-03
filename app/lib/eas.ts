import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { usePublicClient, useWalletClient } from "wagmi";
import { base } from "viem/chains";
import type { WalletClient, PublicClient, Chain, Transport } from "viem";

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

// Schema definitions for different types of attestations.
// Mirror in scripts/register-eas-schemas.js — both must match exactly,
// otherwise the schema UIDs computed during registration won't equal the UIDs
// queried by the front-end.
const SCHEMA_DEFINITIONS = {
  IDEA: "string title,string description,string author,string authorFid,string ideaId,uint256 timestamp",
  REMIX: "string title,string description,string remixer,string remixerFid,string originalIdeaId,string remixId,uint256 timestamp",
  CLAIM: "string ideaId,string claimer,string claimerFid,uint256 timestamp",
  COMPLETION: "string ideaId,string claimer,string miniappUrl,string claimerFid,uint256 timestamp",
  BUILD_ENDORSEMENT: "string ideaId,string buildUrl,string endorser,string endorserFid,string builderId,uint256 timestamp",
};

// Schema UIDs populated from environment variables
export const SCHEMAS = {
  IDEA: process.env.NEXT_PUBLIC_IDEA_SCHEMA_UID || "",
  REMIX: process.env.NEXT_PUBLIC_REMIX_SCHEMA_UID || "",
  CLAIM: process.env.NEXT_PUBLIC_CLAIM_SCHEMA_UID || "",
  COMPLETION: process.env.NEXT_PUBLIC_COMPLETION_SCHEMA_UID || "",
  BUILD_ENDORSEMENT: process.env.NEXT_PUBLIC_BUILD_ENDORSEMENT_SCHEMA_UID || "",
};

// Fee (in wei) required by MinipadFeeResolver for IDEA, CLAIM, and COMPLETION attestations.
// REMIX and BUILD_ENDORSEMENT use a zero resolver and remain free.
// Default: 3300000000000 wei ≈ $0.01 at $3,000/ETH. Adjust NEXT_PUBLIC_MIN_FEE_WEI as needed.
const ATTESTATION_FEE = BigInt(process.env.NEXT_PUBLIC_MIN_FEE_WEI || "3300000000000");

export type EASContext = { walletClient: WalletClient<Transport, Chain>; publicClient: PublicClient };

export function useEAS() {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const isEASConfigured = Object.values(SCHEMAS).every(s => s && s.length > 0);

  const eas: EASContext | null =
    walletClient && publicClient &&
    walletClient.chain?.id === base.id && publicClient.chain?.id === base.id
      ? { walletClient: walletClient as WalletClient<Transport, Chain>, publicClient }
      : null;

  return { eas, isEASConfigured };
}

// Internal helper — sends an attestation via viem and returns the UID from the receipt.
// `fee` must be non-zero for schemas backed by MinipadFeeResolver (IDEA, CLAIM, COMPLETION).
// It is sent both as the transaction's ETH value (msg.value to EAS) and as
// AttestationRequestData.value so EAS forwards it to the resolver.
async function sendAttestation(
  ctx: EASContext,
  schemaUid: string,
  encodedData: string,
  recipient: string,
  fee: bigint = 0n
): Promise<string> {
  const hash = await ctx.walletClient.writeContract({
    address: EAS_CONTRACT_ADDRESS,
    abi: EAS_ABI,
    functionName: "attest",
    chain: base,
    account: ctx.walletClient.account ?? null,
    value: fee,
    args: [{
      schema: schemaUid as `0x${string}`,
      data: {
        recipient: recipient as `0x${string}`,
        expirationTime: 0n,
        revocable: true,
        refUID: "0x0000000000000000000000000000000000000000000000000000000000000000",
        data: encodedData as `0x${string}`,
        value: fee,
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

// Encodes the schema fields (auto-appending timestamp) and submits via sendAttestation.
type Field = { name: string; value: string | bigint; type: string };
async function buildAttestation<K extends keyof typeof SCHEMAS>(
  eas: EASContext,
  schemaKey: K,
  recipient: string,
  fields: Field[],
  fee: bigint = 0n,
): Promise<string> {
  if (!SCHEMAS[schemaKey]) throw new Error(`${schemaKey} schema not configured.`);
  const schemaEncoder = new SchemaEncoder(SCHEMA_DEFINITIONS[schemaKey]);
  const encodedData = schemaEncoder.encodeData([
    ...fields,
    { name: "timestamp", value: BigInt(Math.floor(Date.now() / 1000)), type: "uint256" },
  ]);
  return sendAttestation(eas, SCHEMAS[schemaKey], encodedData, recipient, fee);
}

export async function createIdeaAttestation(
  eas: EASContext,
  title: string,
  description: string,
  author: string,
  authorFid?: string,
  ideaId?: string,
): Promise<string> {
  if (!title || !description || !author) throw new Error("Missing required fields for idea attestation");
  return buildAttestation(eas, "IDEA", author, [
    { name: "title", value: title, type: "string" },
    { name: "description", value: description, type: "string" },
    { name: "author", value: author, type: "string" },
    { name: "authorFid", value: authorFid || "", type: "string" },
    { name: "ideaId", value: ideaId || "", type: "string" },
  ], ATTESTATION_FEE);
}

export async function createRemixAttestation(
  eas: EASContext,
  title: string,
  description: string,
  remixer: string,
  originalIdeaId: string | { toString(): string },
  remixId: string | { toString(): string },
  remixerFid?: string,
): Promise<string> {
  const originalIdeaIdStr = typeof originalIdeaId === "string" ? originalIdeaId : originalIdeaId.toString();
  const remixIdStr = typeof remixId === "string" ? remixId : remixId.toString();
  if (!title || !description || !remixer || !originalIdeaIdStr || !remixIdStr) {
    throw new Error("Missing required fields for remix attestation");
  }
  return buildAttestation(eas, "REMIX", remixer, [
    { name: "title", value: title, type: "string" },
    { name: "description", value: description, type: "string" },
    { name: "remixer", value: remixer, type: "string" },
    { name: "remixerFid", value: remixerFid || "", type: "string" },
    { name: "originalIdeaId", value: originalIdeaIdStr, type: "string" },
    { name: "remixId", value: remixIdStr, type: "string" },
  ]);
}

export async function createClaimAttestation(
  eas: EASContext,
  ideaId: string | { toString(): string },
  claimer: string,
  claimerFid?: string,
): Promise<string> {
  const ideaIdStr = typeof ideaId === "string" ? ideaId : ideaId.toString();
  if (!ideaIdStr || !claimer) throw new Error("Missing required fields for claim attestation");
  return buildAttestation(eas, "CLAIM", claimer, [
    { name: "ideaId", value: ideaIdStr, type: "string" },
    { name: "claimer", value: claimer, type: "string" },
    { name: "claimerFid", value: claimerFid || "", type: "string" },
  ], ATTESTATION_FEE);
}

export async function createCompletionAttestation(
  eas: EASContext,
  ideaId: string | { toString(): string },
  claimer: string,
  miniappUrl: string,
  claimerFid?: string,
): Promise<string> {
  const ideaIdStr = typeof ideaId === "string" ? ideaId : ideaId.toString();
  if (!ideaIdStr || !claimer || !miniappUrl) throw new Error("Missing required fields for completion attestation");
  try { new URL(miniappUrl); } catch { throw new Error("Invalid miniapp URL format"); }
  return buildAttestation(eas, "COMPLETION", claimer, [
    { name: "ideaId", value: ideaIdStr, type: "string" },
    { name: "claimer", value: claimer, type: "string" },
    { name: "miniappUrl", value: miniappUrl, type: "string" },
    { name: "claimerFid", value: claimerFid || "", type: "string" },
  ], ATTESTATION_FEE);
}

export async function createBuildEndorsementAttestation(
  eas: EASContext,
  ideaId: string,
  buildUrl: string,
  endorser: string,
  endorserFid?: string,
  builderId?: string,
): Promise<string> {
  if (!ideaId || !endorser) throw new Error("Missing required fields for build endorsement attestation");
  return buildAttestation(eas, "BUILD_ENDORSEMENT", endorser, [
    { name: "ideaId", value: ideaId, type: "string" },
    { name: "buildUrl", value: buildUrl || "", type: "string" },
    { name: "endorser", value: endorser, type: "string" },
    { name: "endorserFid", value: endorserFid || "", type: "string" },
    { name: "builderId", value: builderId || "", type: "string" },
  ]);
}

export async function revokeAttestation(
  eas: EASContext,
  attestationUid: string,
  schemaUid: string
): Promise<void> {
  if (!attestationUid) throw new Error("Attestation UID is required for revocation");
  if (!schemaUid) throw new Error("Schema UID is required for revocation");

  const hash = await eas.walletClient.writeContract({
    address: EAS_CONTRACT_ADDRESS,
    abi: EAS_ABI,
    functionName: "revoke",
    chain: base,
    account: eas.walletClient.account ?? null,
    args: [{
      schema: schemaUid as `0x${string}`,
      data: {
        uid: attestationUid as `0x${string}`,
        value: 0n,
      },
    }],
  });

  await eas.publicClient.waitForTransactionReceipt({ hash });
}
