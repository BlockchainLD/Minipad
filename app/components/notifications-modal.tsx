"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Bell, Settings, Xmark, NavArrowLeft } from "iconoir-react";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import { UserAvatar } from "./ui/user-avatar";

type Notif = Doc<"notifications">;

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
  onIdeaClick: (ideaId: string) => void;
}

// Each row is ~72px. 7 rows + a peek of an 8th gives users a visible cue
// that the list is scrollable when there are more notifications.
const LIST_PEEK_HEIGHT = 7 * 72 + 36;

const NOTIF_LABELS: Record<Notif["type"], string> = {
  idea_claimed: "claimed your idea",
  build_submitted: "submitted a build for your idea",
  like: "liked",
  remix: "remixed your idea",
  endorsement: "endorsed your build",
};

const TYPE_PILL: Record<Notif["type"], { label: string; className: string }> = {
  idea_claimed: { label: "Claim", className: "bg-amber-100 text-amber-700" },
  build_submitted: { label: "Build", className: "bg-emerald-100 text-emerald-700" },
  like: { label: "Like", className: "bg-rose-100 text-rose-700" },
  remix: { label: "Remix", className: "bg-violet-100 text-violet-700" },
  endorsement: { label: "Endorse", className: "bg-yellow-100 text-yellow-700" },
};

const formatRelative = (ts: number) => {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(ts).toLocaleDateString();
};

const TOGGLE_ROWS: { key: "ideaClaimed" | "buildSubmitted" | "like" | "remix" | "endorsement"; label: string; help: string }[] = [
  { key: "ideaClaimed", label: "Idea claimed", help: "When someone claims an idea you submitted" },
  { key: "buildSubmitted", label: "Build submitted", help: "When a builder ships a build for your idea" },
  { key: "like", label: "Likes", help: "Upvotes on your ideas and remixes" },
  { key: "remix", label: "Remixes", help: "When someone remixes your idea" },
  { key: "endorsement", label: "Endorsements", help: "When someone endorses a build you shipped" },
];

const Toggle = ({ checked, onChange, ariaLabel }: { checked: boolean; onChange: (v: boolean) => void; ariaLabel: string }) => (
  <button
    role="switch"
    aria-checked={checked}
    aria-label={ariaLabel}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-10 flex-shrink-0 items-center rounded-full transition-colors ${checked ? "bg-violet-500" : "bg-gray-200"}`}
  >
    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`} />
  </button>
);

export const NotificationsModal = ({ isOpen, onClose, walletAddress, onIdeaClick }: NotificationsModalProps) => {
  const [showSettings, setShowSettings] = useState(false);

  const notifs = useQuery(
    api.notifications.listForUser,
    isOpen && walletAddress ? { recipient: walletAddress } : "skip",
  );
  const prefs = useQuery(
    api.notifications.getPrefs,
    isOpen && walletAddress ? { address: walletAddress } : "skip",
  );
  const markAllRead = useMutation(api.notifications.markAllRead);
  const updatePrefs = useMutation(api.notifications.updatePrefs);

  // Mark all notifications as read once when the modal opens.
  useEffect(() => {
    if (isOpen && walletAddress) {
      markAllRead({ recipient: walletAddress }).catch(() => {});
    }
  }, [isOpen, walletAddress, markAllRead]);

  // Reset to list view whenever the modal re-opens.
  useEffect(() => {
    if (!isOpen) setShowSettings(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const togglePref = (key: typeof TOGGLE_ROWS[number]["key"], value: boolean) => {
    updatePrefs({ address: walletAddress, [key]: value }).catch(() => {});
  };

  const toggleEnabled = (value: boolean) => {
    updatePrefs({ address: walletAddress, enabled: value }).catch(() => {});
  };

  const hasMore = !!notifs && notifs.length > 7;

  return (
    <div
      className="fixed inset-0 bg-violet-950 bg-opacity-60 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {showSettings ? (
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 -ml-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Back to notifications"
              >
                <NavArrowLeft width={20} height={20} />
              </button>
            ) : (
              <Bell width={22} height={22} className="text-violet-500" />
            )}
            <h2 className="text-xl font-bold text-gray-900">
              {showSettings ? "Notification settings" : "Notifications"}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            {!showSettings && (
              <button
                onClick={() => setShowSettings(true)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Notification settings"
                title="Notification settings"
              >
                <Settings width={18} height={18} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <Xmark width={20} height={20} />
            </button>
          </div>
        </div>

        {showSettings ? (
          <SettingsPanel
            prefs={prefs}
            onToggleEnabled={toggleEnabled}
            onTogglePref={togglePref}
          />
        ) : (
          <NotifList
            notifs={notifs}
            hasMore={hasMore}
            onIdeaClick={(id) => { onIdeaClick(id); onClose(); }}
          />
        )}
      </div>
    </div>
  );
};

const NotifList = ({
  notifs,
  hasMore,
  onIdeaClick,
}: {
  notifs: Notif[] | undefined;
  hasMore: boolean;
  onIdeaClick: (id: string) => void;
}) => {
  if (notifs === undefined) {
    return (
      <div className="p-6 space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }
  if (notifs.length === 0) {
    return (
      <div className="text-center py-16 px-6 text-gray-400">
        <Bell width={40} height={40} className="text-violet-300 mx-auto mb-3" />
        <p className="text-sm">No notifications yet.</p>
        <p className="text-xs mt-1">When someone interacts with your work, it shows up here.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        className="overflow-y-auto p-2"
        style={{ maxHeight: hasMore ? LIST_PEEK_HEIGHT : "none" }}
      >
        {notifs.map((n) => (
          <NotifRow key={n._id} notif={n} onIdeaClick={onIdeaClick} />
        ))}
      </div>
      {hasMore && (
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      )}
    </div>
  );
};

const NotifRow = ({ notif, onIdeaClick }: { notif: Notif; onIdeaClick: (id: string) => void }) => {
  const pill = TYPE_PILL[notif.type];
  const actorName = notif.actorDisplayName || notif.actorUsername || `${notif.actor.slice(0, 6)}…`;
  const action = NOTIF_LABELS[notif.type];
  const isClickable = !!notif.ideaId;

  return (
    <button
      type="button"
      disabled={!isClickable}
      onClick={() => notif.ideaId && onIdeaClick(notif.ideaId as Id<"ideas">)}
      className={`w-full flex items-start gap-3 p-3 rounded-2xl text-left transition-colors ${
        notif.read ? "hover:bg-gray-50" : "bg-violet-50/60 hover:bg-violet-50"
      } ${isClickable ? "cursor-pointer" : "cursor-default"}`}
    >
      <UserAvatar
        author={notif.actor}
        authorAvatar={notif.actorAvatar}
        authorDisplayName={notif.actorDisplayName}
        authorUsername={notif.actorUsername}
        size={36}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${pill.className}`}>
            {pill.label}
          </span>
          <span className="text-xs text-gray-400">{formatRelative(notif.timestamp)}</span>
        </div>
        <p className="text-sm text-gray-800 leading-snug">
          <span className="font-semibold">{actorName}</span> {action}
          {notif.ideaTitle && (
            <>
              {" "}<span className="font-medium text-gray-900">&ldquo;{notif.ideaTitle}&rdquo;</span>
            </>
          )}
        </p>
      </div>
      {!notif.read && (
        <span className="mt-2 inline-block w-2 h-2 rounded-full bg-violet-500 flex-shrink-0" aria-label="Unread" />
      )}
    </button>
  );
};

const SettingsPanel = ({
  prefs,
  onToggleEnabled,
  onTogglePref,
}: {
  prefs: { enabled: boolean; ideaClaimed: boolean; buildSubmitted: boolean; like: boolean; remix: boolean; endorsement: boolean } | undefined;
  onToggleEnabled: (v: boolean) => void;
  onTogglePref: (key: typeof TOGGLE_ROWS[number]["key"], v: boolean) => void;
}) => {
  if (!prefs) {
    return (
      <div className="p-6 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-1">
      <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50">
        <div className="flex-1 pr-3">
          <p className="text-sm font-semibold text-gray-900">All notifications</p>
          <p className="text-xs text-gray-500">Master toggle. Off hides every notification.</p>
        </div>
        <Toggle checked={prefs.enabled} onChange={onToggleEnabled} ariaLabel="Toggle all notifications" />
      </div>
      <div className={`pt-1 ${prefs.enabled ? "" : "opacity-50 pointer-events-none"}`}>
        {TOGGLE_ROWS.map((row) => (
          <div key={row.key} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50">
            <div className="flex-1 pr-3">
              <p className="text-sm font-semibold text-gray-900">{row.label}</p>
              <p className="text-xs text-gray-500">{row.help}</p>
            </div>
            <Toggle
              checked={prefs[row.key]}
              onChange={(v) => onTogglePref(row.key, v)}
              ariaLabel={`Toggle ${row.label}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
