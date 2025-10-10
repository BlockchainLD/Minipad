import { Typography } from "@worldcoin/mini-apps-ui-kit-react";
import { Home, Plus, UserCircle } from "iconoir-react";

interface MobileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onViewChange?: (view: "board" | "submit" | "complete" | "confirmation") => void;
}

export const MobileTabs = ({ activeTab, onTabChange, onViewChange }: MobileTabsProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe">
      <div className="flex px-2 pt-2 pb-3">
        <button
          onClick={() => { onTabChange("home"); onViewChange?.("board"); }}
          className={`flex-1 flex flex-col items-center justify-center py-3 transition-all duration-200 ${
            activeTab === "home" ? "text-black" : "text-gray-400"
          }`}
        >
          <Home 
            width={24} 
            height={24} 
            className={`transition-all duration-200 ${activeTab === "home" ? "text-black" : "text-gray-400"}`}
            strokeWidth={activeTab === "home" ? 2.5 : 1.5}
          />
          <Typography variant="label" className={`mt-1 font-medium text-xs transition-all duration-200 ${activeTab === "home" ? "text-black" : "text-gray-400"}`}>
            Ideas
          </Typography>
        </button>
        <button
          onClick={() => { onTabChange("home"); onViewChange?.("submit"); }}
          className="flex-1 flex flex-col items-center justify-center py-3 transition-all duration-200 text-gray-400 hover:text-black"
        >
          <Plus 
            width={24} 
            height={24} 
            className="transition-all duration-200"
            strokeWidth={1.5}
          />
          <Typography variant="label" className="mt-1 font-medium text-xs text-gray-400 transition-all duration-200">
            Submit
          </Typography>
        </button>
        <button
          onClick={() => onTabChange("settings")}
          className={`flex-1 flex flex-col items-center justify-center py-3 transition-all duration-200 ${
            activeTab === "settings" ? "text-black" : "text-gray-400"
          }`}
        >
          <UserCircle 
            width={24} 
            height={24} 
            className={`transition-all duration-200 ${activeTab === "settings" ? "text-black" : "text-gray-400"}`}
            strokeWidth={activeTab === "settings" ? 2 : 1.5}
          />
          <Typography variant="label" className={`mt-1 font-medium text-xs transition-all duration-200 ${activeTab === "settings" ? "text-black" : "text-gray-400"}`}>
            Profile
          </Typography>
        </button>
      </div>
    </div>
  );
};
