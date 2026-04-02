import { useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { useIsMobile } from "../../hooks/use-is-mobile";
import { useFarcasterData } from "../../hooks/use-farcaster-data";
import { SettingsContent } from "./settings-content";
import { CopyNotification } from "./copy-notification";
import { useLoggedIn } from "./use-logged-in";
import { IdeasBoard } from "../ideas-board";
import { IdeaSubmissionForm } from "../idea-submission-form";
import { IdeaSubmissionConfirmation } from "../idea-submission-confirmation";
import { Header } from "./header";
import { LeaderboardModal } from "../leaderboard-modal";
import { UserProfileModal, type UserProfile } from "../user-profile-modal";
import { TABS, VIEWS, ADMIN_ADDRESS } from "../../lib/constants";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";

export const LoggedIn = () => {
  const {
    copied,
    activeTab,
    setActiveTab,
    handleSignOut,
    walletAddress,
    handleCopyAddress,
  } = useLoggedIn();

  const { isConnected } = useAccount();
  const { connectAsync, connectors, isPending: isConnecting } = useConnect();

  const handleConnectWallet = async () => {
    try {
      const baseConnector =
        connectors.find((c) => c.name.toLowerCase().includes("base")) || connectors[0];
      await connectAsync({ connector: baseConnector });
    } catch (error) {
      console.error("Wallet connection error:", error);
    }
  };

  const isMobile = useIsMobile();
  const [currentView, setCurrentView] = useState<"board" | "submit" | "complete" | "confirmation">(
    VIEWS.BOARD
  );
  const [pendingOpenIdeaId, setPendingOpenIdeaId] = useState<string | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [profileModalUser, setProfileModalUser] = useState<UserProfile | null>(null);
  const [isGridView, setIsGridView] = useState(false);
  const [isAllFeed, setIsAllFeed] = useState(false);
  const adminDeleteAllIdeas = useMutation(api.ideas.adminDeleteAllIdeas);
  const isAdmin = walletAddress?.toLowerCase() === ADMIN_ADDRESS.toLowerCase();

  const handleAdminDeleteAll = async () => {
    if (!walletAddress) return;
    try {
      await adminDeleteAllIdeas({ adminAddress: walletAddress });
      toast.success("All ideas deleted.");
    } catch {
      toast.error("Failed to delete ideas.");
    }
  };
  const farcasterData = useFarcasterData();
  const avatarUrl = farcasterData?.pfp?.url || null;

  const handleLogoClick = () => {
    setActiveTab(TABS.HOME);
    setCurrentView(VIEWS.BOARD);
  };

  const handleAvatarClick = () => {
    setActiveTab(TABS.SETTINGS);
  };

  const handleIdeaClick = (ideaId: string) => {
    setPendingOpenIdeaId(ideaId);
    setActiveTab(TABS.HOME);
    setCurrentView(VIEWS.BOARD);
  };

  const homeContent = (
    <>
      {currentView === VIEWS.BOARD && (
        <IdeasBoard
          onViewChange={setCurrentView}
          onProfileClick={(user) => {
            if (user.address === walletAddress) {
              setActiveTab(TABS.SETTINGS);
            } else {
              setProfileModalUser(user);
            }
          }}
          openIdeaId={pendingOpenIdeaId}
          onIdeaOpened={() => setPendingOpenIdeaId(null)}
          isGridView={isGridView}
          onToggleGrid={() => setIsGridView((g) => !g)}
          isAllFeed={isAllFeed}
        />
      )}
      {currentView === VIEWS.SUBMIT && (
        <IdeaSubmissionForm
          onSuccess={() => setCurrentView(VIEWS.BOARD)}
          onCancel={() => setCurrentView(VIEWS.BOARD)}
        />
      )}
      {currentView === VIEWS.CONFIRMATION && (
        <IdeaSubmissionConfirmation onReturnHome={() => setCurrentView(VIEWS.BOARD)} />
      )}
    </>
  );

  const settingsContent = (
    <SettingsContent
      walletAddress={walletAddress}
      copied={copied}
      onCopyAddress={handleCopyAddress}
      onSignOut={handleSignOut}
      onIdeaClick={handleIdeaClick}
      isAllFeed={isAllFeed}
      onToggleFeed={() => setIsAllFeed((v) => !v)}
      onAdminDeleteAll={isAdmin ? handleAdminDeleteAll : undefined}
    />
  );

  if (isMobile) {
    return (
      <>
        <div className="bg-slate-50 min-h-dvh flex flex-col">
          <Header
            avatarUrl={avatarUrl}
            isConnected={isConnected}
            isConnecting={isConnecting}
            onLogoClick={handleLogoClick}
            onAvatarClick={handleAvatarClick}
            onTrophyClick={() => setShowLeaderboard(true)}
            onConnectWallet={handleConnectWallet}
          />
          <div className="flex-1 px-6 pb-6 pt-3">
            {activeTab === TABS.HOME && homeContent}
            {activeTab === TABS.SETTINGS && settingsContent}
          </div>
        </div>
        <CopyNotification show={copied} />
        <LeaderboardModal
          isOpen={showLeaderboard}
          onClose={() => setShowLeaderboard(false)}
          onProfileClick={(user) => {
            setShowLeaderboard(false);
            if (user.address === walletAddress) { setActiveTab(TABS.SETTINGS); }
            else { setProfileModalUser(user); }
          }}
        />
        <UserProfileModal
          isOpen={!!profileModalUser}
          onClose={() => setProfileModalUser(null)}
          user={profileModalUser}
          onIdeaClick={handleIdeaClick}
        />
      </>
    );
  }

  return (
    <>
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-violet-100">
        <Header
          avatarUrl={avatarUrl}
          onLogoClick={handleLogoClick}
          onAvatarClick={handleAvatarClick}
          onTrophyClick={() => setShowLeaderboard(true)}
        />
        <div className="p-6 pt-3">
          {activeTab === TABS.HOME && homeContent}
          {activeTab === TABS.SETTINGS && settingsContent}
        </div>
      </div>
      <CopyNotification show={copied} />
      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        onProfileClick={(user) => {
          setShowLeaderboard(false);
          if (user.address === walletAddress) { setActiveTab(TABS.SETTINGS); }
          else { setProfileModalUser(user); }
        }}
      />
      <UserProfileModal
        isOpen={!!profileModalUser}
        onClose={() => setProfileModalUser(null)}
        user={profileModalUser}
        onIdeaClick={handleIdeaClick}
      />
    </>
  );
};
