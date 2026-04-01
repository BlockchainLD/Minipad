import { Id } from "../../convex/_generated/dataModel";

export type Idea = {
  _id: Id<"ideas">;
  title: string;
  description: string;
  author: string;
  authorFid?: number;
  authorAvatar?: string;
  authorDisplayName?: string;
  authorUsername?: string;
  timestamp: number;
  upvotes: number;
  status: "open" | "claimed" | "completed";
  claimedBy?: string;
  claimedByFid?: number;
  claimedByAvatar?: string;
  claimedByDisplayName?: string;
  claimedByUsername?: string;
  isRemix?: boolean;
  originalIdeaId?: Id<"ideas">;
  attestationUid?: string;
  completionAttestationUid?: string;
  githubUrl?: string;
  deploymentUrl?: string;
  remixCount?: number;
  claimedAt?: number;
  completedAt?: number;
};

export type Remix = {
  _id: Id<"remixes">;
  _creationTime: number;
  ideaId: Id<"ideas">;
  author: string;
  authorFid?: number;
  authorAvatar?: string;
  authorDisplayName?: string;
  authorUsername?: string;
  content: string;
  type: "addition" | "edit" | "comment";
  timestamp: number;
  upvotes: number;
  attestationUid?: string;
};

export interface FarcasterUser {
  fid: number;
  displayName?: string;
  username?: string;
  profile?: {
    bio?: { text?: string };
    location?: { description?: string };
    url?: string;
    bannerImageUrl?: string;
  };
  followerCount?: number;
  followingCount?: number;
  pfp?: { url?: string; verified?: boolean };
  connectedAccounts?: Array<{ platform: string; username: string }>;
}
