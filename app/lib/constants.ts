export const COPY_NOTIFICATION_TIMEOUT = 2000;
export const AUTO_CONNECT_TIMEOUT = 3000;

export const TABS = { HOME: "home", SETTINGS: "settings" } as const;
export const VIEWS = { BOARD: "board", SUBMIT: "submit", CONFIRMATION: "confirmation", CLAIM_CONFIRMATION: "claim_confirmation" } as const;

export const ADMIN_ADDRESS = "0x6A0bA3707dF9D13A4445cD7E04274B2725930cD7";

// Minipad token — fill in once the token is deployed on Base.
// Logo click → swap and purple-check badge both activate automatically.
export const MINIPAD_TOKEN = {
  contractAddress: null as `0x${string}` | null,
  stakingContractAddress: null as `0x${string}` | null,
  minStakedForPurpleCheck: 1000n, // token units (no decimals)
  decimals: 18,
} as const;
