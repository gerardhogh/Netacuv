"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type:
    | "JOB_ALERT"
    | "APPLICATION_STATUS"
    | "INTERVIEW_REMINDER"
    | "NEW_APPLICATION"
    | "JOB_EXPIRING_SOON"
    | "APPLICATION_SUMMARY"
    | "NEW_COMPANY_PENDING"
    | "SYSTEM_ALERT";
  read: boolean;
  link?: string | null;
  createdAt: string;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

// Synthétiseur audio doux via Web Audio API (ne dépend d'aucun fichier externe)
function playGentleChime() {
  try {
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(880, now);
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.15); // D6

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);
  } catch {
    // Silently ignore audio context block in browsers
  }
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const activeChannelRef = useRef<any>(null);

  // Charger les notifications depuis l'API
  const fetchNotifications = useCallback(async (isInitial = false) => {
    if (!user?.id) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      if (isInitial) setLoading(true);
      const res = await fetch("/api/notifications?limit=40", {
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Failed to load notifications");
      const data = await res.json();

      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error("[NotificationContext] Erreur chargement:", err);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [user?.id]);

  // Initial load
  useEffect(() => {
    fetchNotifications(true);
  }, [fetchNotifications]);

  // Polling fallback et revalidation au focus (toutes les 45 secondes)
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      fetchNotifications(false);
    }, 45000);

    const onFocus = () => {
      fetchNotifications(false);
    };

    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [user?.id, fetchNotifications]);

  // Écoute Supabase Realtime Broadcast
  useEffect(() => {
    if (!user?.id) return;

    // Fermer l'ancien canal si présent
    if (activeChannelRef.current) {
      supabase.removeChannel(activeChannelRef.current);
      activeChannelRef.current = null;
    }

    const channelName = `notifications:${user.id}`;
    const channel = supabase.channel(channelName);

    channel
      .on("broadcast", { event: "new_notification" }, (payload: any) => {
        const newNotif = payload?.payload as NotificationItem;
        if (!newNotif || !newNotif.id) return;

        // Éviter les doublons
        setNotifications((prev) => {
          if (prev.some((n) => n.id === newNotif.id)) return prev;
          return [newNotif, ...prev];
        });
        setUnreadCount((prev) => prev + 1);

        // Son doux et toast visuel
        playGentleChime();
        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? "animate-enter" : "animate-leave"
              } max-w-sm w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black/5 p-4 border border-blue-100/60`}
            >
              <div className="flex-1">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#32A8D7] to-[#1e8ae9] flex items-center justify-center text-white shrink-0 shadow-md">
                    🔔
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {newNotif.title}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                      {newNotif.message}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="ml-2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            </div>
          ),
          { duration: 4500, position: "top-right" }
        );
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          activeChannelRef.current = channel;
        }
      });

    return () => {
      supabase.removeChannel(channel);
      activeChannelRef.current = null;
    };
  }, [user?.id]);

  // Marquer une notification comme lue
  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
    } catch (err) {
      console.error("[NotificationContext] Erreur markAsRead:", err);
      // Re-synchroniser en cas d'erreur
      fetchNotifications(false);
    }
  };

  // Tout marquer comme lu
  const markAllAsRead = async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      await fetch("/api/notifications", {
        method: "PATCH",
      });
    } catch (err) {
      console.error("[NotificationContext] Erreur markAllAsRead:", err);
      fetchNotifications(false);
    }
  };

  // Supprimer une notification
  const deleteNotification = async (id: string) => {
    const target = notifications.find((n) => n.id === id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (target && !target.read) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    try {
      await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("[NotificationContext] Erreur deleteNotification:", err);
      fetchNotifications(false);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refresh: () => fetchNotifications(false),
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications doit être utilisé à l'intérieur d'un NotificationProvider"
    );
  }
  return context;
}
