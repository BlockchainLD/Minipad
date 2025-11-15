/**
 * Application-wide constants
 */

// Timeouts (in milliseconds)
export const COPY_NOTIFICATION_TIMEOUT = 2000;
export const AUTO_CONNECT_TIMEOUT = 7000;

// UI Limits
export const IDEAS_PER_SECTION = 3; // Number of ideas shown in profile sections
export const DEFAULT_IDEAS_LIMIT = 20; // Default limit for ideas query

// Idea Status
export const IDEA_STATUS = {
  OPEN: "open",
  CLAIMED: "claimed",
  COMPLETED: "completed",
} as const;

// Claim Status
export const CLAIM_STATUS = {
  CLAIMED: "claimed",
  COMPLETED: "completed",
} as const;

// Tab Names
export const TABS = {
  HOME: "home",
  SETTINGS: "settings",
} as const;

// View Names
export const VIEWS = {
  BOARD: "board",
  SUBMIT: "submit",
  COMPLETE: "complete",
  CONFIRMATION: "confirmation",
} as const;

