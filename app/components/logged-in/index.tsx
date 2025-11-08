import { useIsMobile } from "../../hooks/use-is-mobile";
import { SettingsContent } from "./settings-content";
import { CopyNotification } from "./copy-notification";
import { useLoggedIn } from "./use-logged-in";
import { IdeasBoard } from "../ideas-board";
import { IdeaSubmissionForm } from "../idea-submission-form";
import { IdeaSubmissionConfirmation } from "../idea-submission-confirmation";
import { useState } from "react";
import { LightBulb } from "iconoir-react";
import Image from "next/image";
import { useFarcaster } from "../auto-connect-wrapper";
import { useFarcasterData } from "../../hooks/use-farcaster-data";

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
  useFarcaster(); // Hook for Farcaster context
  const farcasterData = useFarcasterData();
  const avatarUrl = farcasterData?.pfp?.url || null;



  if (isMobile) {
    return (
        <>
          <div className="bg-white min-h-screen mb-20 flex flex-col">
            <div className="flex items-center justify-center p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3 w-full justify-between">
                <button
                  onClick={() => {
                    setActiveTab("home");
                    setCurrentView("board");
                  }}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <LightBulb width={24} height={24} className="text-black" />
                  <span className="text-xl font-bold text-gray-900">Minipad</span>
                </button>
                {avatarUrl && (
                  <button
                    onClick={() => setActiveTab("settings")}
                    className="rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300 hover:ring-2 hover:ring-blue-200 transition-all"
                    aria-label="Open profile"
                  >
                    <Image
                      src={avatarUrl}
                      alt="Profile avatar"
                      width={28}
                      height={28}
                      className="w-7 h-7 rounded-full"
                    />
                  </button>
                )}
              </div>
            </div>
          
          <div className="flex-1 px-6 pb-6">
            {activeTab === "home" && (
              <div className="w-full">
                {currentView === "board" && (
                  <IdeasBoard 
                    onViewChange={setCurrentView}
                    onProfileClick={(authorAddress) => {
                      if (authorAddress === walletAddress) {
                        setActiveTab("settings");
                      }
                    }}
                  />
                )}
                {currentView === "submit" && (
                  <IdeaSubmissionForm 
                    onSuccess={() => {
                      // Automatically return to ideas board after successful submission
                      setCurrentView("board");
                    }}
                    onCancel={() => setCurrentView("board")}
                  />
                )}
                {currentView === "confirmation" && (
                  <IdeaSubmissionConfirmation 
                    onReturnHome={() => setCurrentView("board")}
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

        <CopyNotification show={copied} isMobile />
      </>
    );
  }

  return (
        <>
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="flex items-center justify-center p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3 w-full justify-between">
                <button
                  onClick={() => {
                    setActiveTab("home");
                    setCurrentView("board");
                  }}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <LightBulb width={24} height={24} className="text-black" />
                  <span className="text-xl font-bold text-gray-900">Minipad</span>
                </button>
                {avatarUrl && (
                  <button
                    onClick={() => setActiveTab("settings")}
                    className="rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300 hover:ring-2 hover:ring-blue-200 transition-all"
                    aria-label="Open profile"
                  >
                    <Image
                      src={avatarUrl}
                      alt="Profile avatar"
                      width={28}
                      height={28}
                      className="w-7 h-7 rounded-full"
                    />
                  </button>
                )}
              </div>
            </div>
        <div className="p-6 pt-4">
          {currentView === "board" && (
            <IdeasBoard 
              onViewChange={setCurrentView}
              onProfileClick={(authorAddress) => {
                if (authorAddress === walletAddress) {
                  setActiveTab("settings");
                }
              }}
            />
          )}
          {currentView === "submit" && (
            <IdeaSubmissionForm 
              onSuccess={() => {
                // Automatically return to ideas board after successful submission
                setCurrentView("board");
              }}
              onCancel={() => setCurrentView("board")}
            />
          )}
          {currentView === "confirmation" && (
            <IdeaSubmissionConfirmation 
              onReturnHome={() => setCurrentView("board")}
            />
          )}
        </div>
      </div>

      <CopyNotification show={copied} />
    </>
  );
};
