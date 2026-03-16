import { useState } from "react";
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
import { TABS, VIEWS } from "../../lib/constants";

export const LoggedIn = () => {
  const {
    copied,
    activeTab,
    setActiveTab,
    handleSignOut,
    walletAddress,
    handleCopyAddress,
  } = useLoggedIn();

  const isMobile = useIsMobile();
  const [currentView, setCurrentView] = useState<"board" | "submit" | "complete" | "confirmation">(
    VIEWS.BOARD
  );
  const [pendingOpenIdeaId, setPendingOpenIdeaId] = useState<string | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
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
          onProfileClick={(authorAddress) => {
            if (authorAddress === walletAddress) {
              setActiveTab(TABS.SETTINGS);
            }
          }}
          openIdeaId={pendingOpenIdeaId}
          onIdeaOpened={() => setPendingOpenIdeaId(null)}
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
    />
  );

  if (isMobile) {
    return (
      <>
        <div className="bg-slate-50 min-h-dvh flex flex-col">
          <Header
            avatarUrl={avatarUrl}
            onLogoClick={handleLogoClick}
            onAvatarClick={handleAvatarClick}
            onTrophyClick={() => setShowLeaderboard(true)}
          />
          <div className="flex-1 px-6 pb-6">
            {activeTab === TABS.HOME && homeContent}
            {activeTab === TABS.SETTINGS && settingsContent}
          </div>
        </div>
        <CopyNotification show={copied} />
        <LeaderboardModal isOpen={showLeaderboard} onClose={() => setShowLeaderboard(false)} />
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
        <div className="p-6 pt-4">
          {activeTab === TABS.HOME && homeContent}
          {activeTab === TABS.SETTINGS && settingsContent}
        </div>
      </div>
      <CopyNotification show={copied} />
      <LeaderboardModal isOpen={showLeaderboard} onClose={() => setShowLeaderboard(false)} />
    </>
  );
};
