/**
 * Utility functions for EAS (Ethereum Attestation Service) operations
 */

/**
 * Extract the attestation UID from an EAS transaction result
 * @param tx - The transaction result from EAS attestation
 * @returns The attestation UID string
 */
export function extractAttestationUid(tx: unknown): string {
  // EAS SDK returns transactions with a uid property
  // Type assertion needed due to SDK typing
  const txWithUid = tx as { uid?: string };
  if (!txWithUid.uid) {
    throw new Error("Attestation UID not found in transaction result");
  }
  return txWithUid.uid;
}

