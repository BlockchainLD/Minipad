import { TopBar } from "@worldcoin/mini-apps-ui-kit-react";
import { useIsMobile } from "../../hooks/use-is-mobile";
import { SettingsContent } from "./settings-content";
import { MobileTabs } from "./mobile-tabs";
import { CopyNotification } from "./copy-notification";
import { useLoggedIn } from "./use-logged-in";
import { IdeasBoard } from "../ideas-board";
import { IdeaSubmissionForm } from "../idea-submission-form";
import { IdeaSubmissionConfirmation } from "../idea-submission-confirmation";
import { useState } from "react";

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
  const [currentView, setCurrentView] = useState<"board" | "submit" | "complete" | "confirmation">("board");
  const [submittedIdeaTitle, setSubmittedIdeaTitle] = useState("");



  if (isMobile) {
    return (
        <>
          <div className="bg-white min-h-screen mb-20 flex flex-col">
            <TopBar 
              title="💡 Minipad"
              className="[&_*]:text-black"
            />
          
          <div className="flex-1 px-6 pb-24">
            {activeTab === "home" && (
              <div className="w-full">
                {currentView === "board" && (
                  <IdeasBoard 
                    onViewChange={setCurrentView}
                  />
                )}
                {currentView === "submit" && (
                  <IdeaSubmissionForm 
                    onSuccess={(title: string) => {
                      setSubmittedIdeaTitle(title);
                      setCurrentView("confirmation");
                    }}
                    onCancel={() => setCurrentView("board")}
                  />
                )}
                {currentView === "confirmation" && (
                  <IdeaSubmissionConfirmation 
                    onReturnHome={() => setCurrentView("board")}
                    ideaTitle={submittedIdeaTitle}
                  />
                )}
              </div>
            )}
            {activeTab === "settings" && (
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

        <MobileTabs 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          onViewChange={setCurrentView}
        />
        <CopyNotification show={copied} isMobile />
      </>
    );
  }

  return (
        <>
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <TopBar 
              title="💡 Minipad"
              className="[&_*]:text-black"
            />
        <div className="p-6 pt-4">
          {currentView === "board" && (
            <IdeasBoard 
              onViewChange={setCurrentView}
            />
          )}
          {currentView === "submit" && (
            <IdeaSubmissionForm 
              onSuccess={(title: string) => {
                setSubmittedIdeaTitle(title);
                setCurrentView("confirmation");
              }}
              onCancel={() => setCurrentView("board")}
            />
          )}
          {currentView === "confirmation" && (
            <IdeaSubmissionConfirmation 
              onReturnHome={() => setCurrentView("board")}
              ideaTitle={submittedIdeaTitle}
            />
          )}
        </div>
      </div>

      <CopyNotification show={copied} />
    </>
  );
};
