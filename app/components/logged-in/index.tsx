import { useIsMobile } from "../../hooks/use-is-mobile";
import { SettingsContent } from "./settings-content";
import { MobileTabs } from "./mobile-tabs";
import { CopyNotification } from "./copy-notification";
import { useLoggedIn } from "./use-logged-in";
import { IdeasBoard } from "../ideas-board";
import { IdeaSubmissionForm } from "../idea-submission-form";
import { IdeaSubmissionConfirmation } from "../idea-submission-confirmation";
import { useState } from "react";
import { Lamp } from "iconoir-react";

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
            <div className="flex items-center justify-center p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <Lamp width={24} height={24} className="text-yellow-500" />
                <span className="text-xl font-bold text-gray-900">Minipad</span>
              </div>
            </div>
          
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
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="flex items-center justify-center p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <Lamp width={24} height={24} className="text-yellow-500" />
                <span className="text-xl font-bold text-gray-900">Minipad</span>
              </div>
            </div>
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
