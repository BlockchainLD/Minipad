import { TopBar } from "@worldcoin/mini-apps-ui-kit-react";
import { useIsMobile } from "../../hooks/use-is-mobile";
import { SettingsContent } from "./settings-content";
import { MobileTabs } from "./mobile-tabs";
import { CopyNotification } from "./copy-notification";
import { useLoggedIn } from "./use-logged-in";
import { IdeasBoard } from "../ideas-board";
import { IdeaSubmissionForm } from "../idea-submission-form";
import { CompletionForm } from "../completion-form";
import { useState } from "react";
import { Id } from "../../../convex/_generated/dataModel";

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
  const [currentView, setCurrentView] = useState<"board" | "submit" | "complete">("board");
  const [selectedIdeaId, setSelectedIdeaId] = useState<Id<"ideas"> | null>(null);

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
                    onIdeaClick={(ideaId) => {
                      setSelectedIdeaId(ideaId);
                      setCurrentView("complete");
                    }}
                    onViewChange={setCurrentView}
                  />
                )}
                {currentView === "submit" && (
                  <IdeaSubmissionForm 
                    onSuccess={() => setCurrentView("board")}
                    onCancel={() => setCurrentView("board")}
                  />
                )}
                {currentView === "complete" && selectedIdeaId && (
                  <CompletionForm 
                    ideaId={selectedIdeaId}
                    onSuccess={() => {
                      setCurrentView("board");
                      setSelectedIdeaId(null);
                    }}
                    onCancel={() => {
                      setCurrentView("board");
                      setSelectedIdeaId(null);
                    }}
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
              onIdeaClick={(ideaId) => {
                setSelectedIdeaId(ideaId);
                setCurrentView("complete");
              }}
              onViewChange={setCurrentView}
            />
          )}
          {currentView === "submit" && (
            <IdeaSubmissionForm 
              onSuccess={() => setCurrentView("board")}
              onCancel={() => setCurrentView("board")}
            />
          )}
          {currentView === "complete" && selectedIdeaId && (
            <CompletionForm 
              ideaId={selectedIdeaId}
              onSuccess={() => {
                setCurrentView("board");
                setSelectedIdeaId(null);
              }}
              onCancel={() => {
                setCurrentView("board");
                setSelectedIdeaId(null);
              }}
            />
          )}
        </div>
      </div>

      <CopyNotification show={copied} />
    </>
  );
};
