import { useIsMobile } from "../../hooks/use-is-mobile";
import { SettingsContent } from "./settings-content";
import { CopyNotification } from "./copy-notification";
import { useLoggedIn } from "./use-logged-in";
import { IdeasBoard } from "../ideas-board";
import { IdeaSubmissionForm } from "../idea-submission-form";
import { IdeaSubmissionConfirmation } from "../idea-submission-confirmation";
import { useState } from "react";
import { useFarcaster } from "../auto-connect-wrapper";
import { useFarcasterData } from "../../hooks/use-farcaster-data";
import { Header } from "./header";
import { TABS, VIEWS } from "../../lib/constants";

export const LoggedIn = () => {
  const {
    copied,
    copiedUserId,
    activeTab,
    setActiveTab,
    handleSignOut,
    walletAddress,
    handleCopyAddress,
    handleCopyUserId,
    userId,
  } = useLoggedIn();
  
  const isMobile = useIsMobile();
  const [currentView, setCurrentView] = useState<"board" | "submit" | "complete" | "confirmation">(VIEWS.BOARD);
  useFarcaster(); // Hook for Farcaster context
  const farcasterData = useFarcasterData();
  const avatarUrl = farcasterData?.pfp?.url || null;

  const handleLogoClick = () => {
    setActiveTab(TABS.HOME);
    setCurrentView(VIEWS.BOARD);
  };

  const handleAvatarClick = () => {
    setActiveTab(TABS.SETTINGS);
  };



  if (isMobile) {
    return (
        <>
          <div className="bg-white min-h-screen mb-20 flex flex-col">
            <Header 
              avatarUrl={avatarUrl}
              onLogoClick={handleLogoClick}
              onAvatarClick={handleAvatarClick}
            />
          
          <div className="flex-1 px-6 pb-6">
            {activeTab === TABS.HOME && (
              <div className="w-full">
                {currentView === VIEWS.BOARD && (
                  <IdeasBoard 
                    onViewChange={setCurrentView}
                    onProfileClick={(authorAddress) => {
                      if (authorAddress === walletAddress) {
                        setActiveTab(TABS.SETTINGS);
                      }
                    }}
                  />
                )}
                {currentView === VIEWS.SUBMIT && (
                  <IdeaSubmissionForm 
                    onSuccess={() => {
                      // Automatically return to ideas board after successful submission
                      setCurrentView(VIEWS.BOARD);
                    }}
                    onCancel={() => setCurrentView(VIEWS.BOARD)}
                  />
                )}
                {currentView === VIEWS.CONFIRMATION && (
                  <IdeaSubmissionConfirmation 
                    onReturnHome={() => setCurrentView(VIEWS.BOARD)}
                  />
                )}
              </div>
            )}
            {activeTab === TABS.SETTINGS && (
              <SettingsContent 
                walletAddress={walletAddress}
                copied={copied}
                onCopyAddress={handleCopyAddress}
                onSignOut={handleSignOut}
                userId={userId}
                copiedUserId={copiedUserId}
                onCopyUserId={handleCopyUserId}
              />
            )}
          </div>
        </div>

        <CopyNotification show={copied} isMobile />
      </>
    );
  }

  return (
        <>
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            <Header 
              avatarUrl={avatarUrl}
              onLogoClick={handleLogoClick}
              onAvatarClick={handleAvatarClick}
            />
        <div className="p-6 pt-4">
          {currentView === VIEWS.BOARD && (
            <IdeasBoard 
              onViewChange={setCurrentView}
              onProfileClick={(authorAddress) => {
                if (authorAddress === walletAddress) {
                  setActiveTab(TABS.SETTINGS);
                }
              }}
            />
          )}
          {currentView === VIEWS.SUBMIT && (
            <IdeaSubmissionForm 
              onSuccess={() => {
                // Automatically return to ideas board after successful submission
                setCurrentView(VIEWS.BOARD);
              }}
              onCancel={() => setCurrentView(VIEWS.BOARD)}
            />
          )}
          {currentView === VIEWS.CONFIRMATION && (
            <IdeaSubmissionConfirmation 
              onReturnHome={() => setCurrentView(VIEWS.BOARD)}
            />
          )}
        </div>
      </div>

      <CopyNotification show={copied} />
    </>
  );
};
