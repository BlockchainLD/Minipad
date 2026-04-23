"use client";

// Returns true when an address holds >= MINIPAD_TOKEN.minStakedForPurpleCheck
// tokens in the staking contract. Inactive until both contract addresses are set.
//
// To activate:
//   1. Set MINIPAD_TOKEN.contractAddress in app/lib/constants.ts
//   2. Set MINIPAD_TOKEN.stakingContractAddress in app/lib/constants.ts
//   3. Uncomment the useReadContract call below and provide the staking ABI

import { MINIPAD_TOKEN } from "../lib/constants";

// const STAKING_ABI = [
//   {
//     name: "stakedBalance",
//     type: "function",
//     stateMutability: "view",
//     inputs: [{ name: "account", type: "address" }],
//     outputs: [{ name: "", type: "uint256" }],
//   },
// ] as const;

export function usePurpleCheck(_address: string | undefined): boolean {
  if (!MINIPAD_TOKEN.stakingContractAddress || !_address) return false;

  // Uncomment when staking contract is deployed:
  // const { data } = useReadContract({
  //   address: MINIPAD_TOKEN.stakingContractAddress,
  //   abi: STAKING_ABI,
  //   functionName: "stakedBalance",
  //   args: [_address as `0x${string}`],
  // });
  // return (data ?? 0n) >= MINIPAD_TOKEN.minStakedForPurpleCheck;

  return false;
}
