import { useIsMobile } from "../../hooks/use-is-mobile";
import { SettingsContent } from "./settings-content";
import { MobileTabs } from "./mobile-tabs";
import { CopyNotification } from "./copy-notification";
import { useLoggedIn } from "./use-logged-in";
import { IdeasBoard } from "../ideas-board";
import { IdeaSubmissionForm } from "../idea-submission-form";
import { IdeaSubmissionConfirmation } from "../idea-submission-confirmation";
import { useEffect, useState } from "react";
import { LightBulb } from "iconoir-react";
import Image from "next/image";
import { useFarcaster } from "../auto-connect-wrapper";

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
  const { fid, isInMiniApp } = useFarcaster();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchAvatar = async () => {
      if (!fid || !isInMiniApp) return;
      try {
        const response = await fetch(`/api/farcaster/${fid}`);
        if (!response.ok) return;
        const data = await response.json();
        const url: string | undefined = data?.result?.user?.pfp?.url;
        if (url) setAvatarUrl(url);
      } catch {
        // ignore avatar load failures in header
      }
    };
    fetchAvatar();
  }, [fid, isInMiniApp]);



  if (isMobile) {
    return (
        <>
          <div className="bg-white min-h-screen mb-20 flex flex-col">
            <div className="flex items-center justify-center p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <LightBulb width={24} height={24} className="text-black" />
                <span className="text-xl font-bold text-gray-900">Minipad</span>
                {avatarUrl && (
                  <button
                    onClick={() => setActiveTab("settings")}
                    className="ml-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300"
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
                <LightBulb width={24} height={24} className="text-black" />
                <span className="text-xl font-bold text-gray-900">Minipad</span>
                {avatarUrl && (
                  <button
                    onClick={() => setActiveTab("settings")}
                    className="ml-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300"
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
