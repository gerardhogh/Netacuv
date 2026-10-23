"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Trash2,
  Briefcase,
  CheckCircle2,
  Video,
  UserPlus,
  AlertTriangle,
  BarChart3,
  Building2,
  ShieldAlert,
  Clock,
  Sparkles,
} from "lucide-react";
import { useNotifications, NotificationItem } from "../context/NotificationContext";
import { useAuth } from "../context/AuthContext";
import { useTranslations, useLocale } from "next-intl";

interface NotificationBellProps {
  align?: "left" | "right";
  variant?: "default" | "dark" | "transparent";
}

// Résolution et normalisation garantie du lien de redirection de la notification
function resolveNotificationLink(notif: NotificationItem, userRole?: string): string {
  let link = notif.link?.trim() || "";

  // 1. Fallback si aucun lien n'est stocké dans la notification
  if (!link) {
    switch (notif.type) {
      case "JOB_ALERT":
      case "APPLICATION_STATUS":
        link = "/dashboard/talent?tab=emplois";
        break;
      case "INTERVIEW_REMINDER":
        link = "/dashboard/talent?tab=video";
        break;
      case "NEW_APPLICATION":
      case "APPLICATION_SUMMARY":
        link = "/dashboard/recruteur?tab=candidatures";
        break;
      case "JOB_EXPIRING_SOON":
        link = "/dashboard/recruteur?tab=emplois";
        break;
      case "NEW_COMPANY_PENDING":
        link = "/dashboard/admin/recruteurs";
        break;
      case "SYSTEM_ALERT":
      default:
        const lower = (notif.title + " " + notif.message).toLowerCase();
        if (lower.includes("offre") || lower.includes("emploi") || lower.includes("opportunité")) {
          link = "/dashboard/talent?tab=emplois";
        } else if (lower.includes("candidat") || lower.includes("postul")) {
          link = userRole === "RECRUTEUR" ? "/dashboard/recruteur?tab=candidatures" : "/dashboard/talent?tab=emplois";
        } else if (lower.includes("entretien") || lower.includes("interview") || lower.includes("vidéo")) {
          link = "/dashboard/talent?tab=video";
        } else if (userRole === "RECRUTEUR") {
          link = "/dashboard/recruteur";
        } else if (userRole === "ADMIN" || userRole === "Super Admin") {
          link = "/dashboard/admin";
        } else {
          link = "/dashboard/talent";
        }
        break;
    }
  }

  // 2. Normalisation des routes publiques ou anciennes
  if (link === "/talents" || link.startsWith("/talents#") || link.startsWith("/talents?")) {
    link = link.replace("/talents", "/dashboard/talent");
  }
  if (link === "/recruteurs" || link.startsWith("/recruteurs#") || link.startsWith("/recruteurs?")) {
    link = link.replace("/recruteurs", "/dashboard/recruteur");
  }

  // 3. Normalisation des fragments de hash (#) en query params (?tab=)
  if (link.includes("#")) {
    link = link
      .replace("/dashboard/talent#emplois", "/dashboard/talent?tab=emplois")
      .replace("/dashboard/talent#profil", "/dashboard/talent?tab=profil")
      .replace("/dashboard/talent#video", "/dashboard/talent?tab=video")
      .replace("/dashboard/talent#favoris", "/dashboard/talent?tab=favoris")
      .replace("/dashboard/talent#premium", "/dashboard/talent?tab=premium")
      .replace("/dashboard/talent#parametres", "/dashboard/talent?tab=parametres")
      .replace("/dashboard/talent#transactions", "/dashboard/talent?tab=transactions")
      .replace("/dashboard/recruteur#candidatures", "/dashboard/recruteur?tab=candidatures")
      .replace("/dashboard/recruteur#mes-offres", "/dashboard/recruteur?tab=emplois")
      .replace("/dashboard/recruteur#emplois", "/dashboard/recruteur?tab=emplois")
      .replace("/dashboard/recruteur#recherche", "/dashboard/recruteur?tab=recherche")
      .replace("/dashboard/recruteur#favoris", "/dashboard/recruteur?tab=favoris")
      .replace("/dashboard/recruteur#parametres", "/dashboard/recruteur?tab=parametres")
      .replace("/dashboard/recruteur#transactions", "/dashboard/recruteur?tab=transactions")
      .replace("/dashboard/recruteur#profil", "/dashboard/recruteur?tab=profil");

    if (link.startsWith("#")) {
      const tab = link.replace("#", "");
      link = userRole === "RECRUTEUR" ? `/dashboard/recruteur?tab=${tab}` : `/dashboard/talent?tab=${tab}`;
    } else if (link.includes("#")) {
      link = link.replace("#", link.includes("?") ? "&tab=" : "?tab=");
    }
  }

  return link;
}

// Helper pour formater la date relative selon la langue
function formatRelativeTime(dateString: string, t: any, locale: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return t("justNow");
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return t("minutesAgo", { count: diffInMinutes });
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return t("hoursAgo", { count: diffInHours });
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return t("yesterday");
    if (diffInDays < 7) return t("daysAgo", { count: diffInDays });

    return date.toLocaleDateString(locale === "en" ? "en-US" : "fr-FR", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return "";
  }
}

// Configuration d'affichage par type de notification
function getNotificationMeta(type: NotificationItem["type"], t: any) {
  switch (type) {
    case "JOB_ALERT":
      return {
        icon: Briefcase,
        color: "text-[#32A8D7] bg-sky-50 border-sky-100",
        label: t("types.jobAlert"),
      };
    case "APPLICATION_STATUS":
      return {
        icon: CheckCircle2,
        color: "text-emerald-600 bg-emerald-50 border-emerald-100",
        label: t("types.applicationStatus"),
      };
    case "INTERVIEW_REMINDER":
      return {
        icon: Video,
        color: "text-indigo-600 bg-indigo-50 border-indigo-100",
        label: t("types.interviewReminder"),
      };
    case "NEW_APPLICATION":
      return {
        icon: UserPlus,
        color: "text-blue-600 bg-blue-50 border-blue-100",
        label: t("types.newApplication"),
      };
    case "JOB_EXPIRING_SOON":
      return {
        icon: AlertTriangle,
        color: "text-amber-600 bg-amber-50 border-amber-100",
        label: t("types.jobExpiringSoon"),
      };
    case "APPLICATION_SUMMARY":
      return {
        icon: BarChart3,
        color: "text-cyan-600 bg-cyan-50 border-cyan-100",
        label: t("types.applicationSummary"),
      };
    case "NEW_COMPANY_PENDING":
      return {
        icon: Building2,
        color: "text-violet-600 bg-violet-50 border-violet-100",
        label: t("types.newCompanyPending"),
      };
    case "SYSTEM_ALERT":
    default:
      return {
        icon: ShieldAlert,
        color: "text-rose-600 bg-rose-50 border-rose-100",
        label: t("types.systemAlert"),
      };
  }
}

export default function NotificationBell({
  align = "right",
  variant = "default",
}: NotificationBellProps) {
  const t = useTranslations("notifications");
  const locale = useLocale();
  const router = useRouter();
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loading,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Fermer le menu lors d'un clic en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  const handleNotificationClick = async (notif: NotificationItem) => {
    try {
      if (!notif.read) {
        await markAsRead(notif.id);
      }
    } catch (e) {
      console.error("Erreur markAsRead:", e);
    }

    setIsOpen(false);
    const targetLink = resolveNotificationLink(notif, user?.role);
    if (!targetLink) return;

    try {
      const url = new URL(targetLink, typeof window !== "undefined" ? window.location.origin : "http://localhost");
      const targetPath = url.pathname;
      const targetTab = url.searchParams.get("tab") || (url.hash ? url.hash.replace("#", "") : null);
      const targetJobId = url.searchParams.get("jobId");
      const currentPath = typeof window !== "undefined" ? window.location.pathname : "";

      // Si l'utilisateur est déjà sur l'espace Talent
      if (currentPath === "/dashboard/talent" && (targetPath === "/dashboard/talent" || targetPath === "")) {
        if (targetTab) {
          window.dispatchEvent(new CustomEvent("switchTalentTab", { detail: targetTab }));
        }
        if (targetJobId) {
          window.dispatchEvent(new CustomEvent("selectJobId", { detail: targetJobId }));
        } else if (targetTab === "emplois") {
          window.dispatchEvent(new CustomEvent("resetJobView"));
        }
        window.history.pushState(null, "", targetLink);
        router.push(targetLink);
        return;
      }

      // Si l'utilisateur est déjà sur l'espace Recruteur
      if (currentPath === "/dashboard/recruteur" && (targetPath === "/dashboard/recruteur" || targetPath === "")) {
        if (targetTab) {
          window.dispatchEvent(new CustomEvent("switchRecruiterTab", { detail: targetTab }));
        }
        window.history.pushState(null, "", targetLink);
        router.push(targetLink);
        return;
      }

      // Navigation vers une autre page
      router.push(targetLink);
    } catch {
      router.push(targetLink);
    }
  };

  const isDarkVariant = variant === "dark";

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Bouton Cloche */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-full transition-all duration-200 outline-none focus:ring-2 focus:ring-[#32A8D7]/40 ${
          isDarkVariant
            ? "text-blue-100 hover:text-white hover:bg-white/10"
            : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
        }`}
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell size={20} className="transition-transform active:scale-95" />

        {/* Badge non lu avec effet pulsating */}
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 px-1 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex items-center justify-center rounded-full h-4 min-w-4 px-1 bg-red-500 text-white text-[10px] font-bold shadow-sm">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Menu Dropdown */}
      {isOpen && (
        <div
          className={`absolute ${
            align === "right" ? "right-0" : "left-0"
          } mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] border border-slate-100 py-3 z-50 animate-fade-in backdrop-blur-xl`}
        >
          {/* Header */}
          <div className="px-5 py-3 border-b border-slate-100/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 text-sm">
                {t("title")}
              </span>
              {unreadCount > 0 && (
                <span className="bg-[#32A8D7]/10 text-[#1e8ae9] text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} {t("newBadge")}
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-xs font-semibold text-[#1e8ae9] hover:text-[#0071a2] flex items-center gap-1 transition-colors"
                title={t("markAllRead")}
              >
                <CheckCheck size={14} />
                <span>{t("markReadShort")}</span>
              </button>
            )}
          </div>

          {/* Onglets Filtres */}
          <div className="px-5 pt-2 pb-1 flex items-center gap-2 border-b border-slate-50">
            <button
              onClick={() => setFilter("all")}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                filter === "all"
                  ? "bg-[#32A8D7] text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              }`}
            >
              {t("all")} ({notifications.length})
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                filter === "unread"
                  ? "bg-[#32A8D7] text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              }`}
            >
              {t("unread")} ({unreadCount})
            </button>
          </div>

          {/* Liste des notifications */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50/80 scrollbar-thin">
            {loading ? (
              <div className="py-10 text-center text-slate-400 text-xs">
                <div className="w-5 h-5 border-2 border-slate-200 border-t-[#32A8D7] rounded-full animate-spin mx-auto mb-2" />
                {t("loading")}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="py-10 px-6 text-center text-slate-400 text-xs">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-300">
                  <Sparkles size={24} />
                </div>
                <p className="font-semibold text-slate-600 mb-1">
                  {filter === "unread"
                    ? t("noUnread")
                    : t("empty")}
                </p>
                <p className="text-[11px] text-slate-400">
                  {t("realtimeNotice")}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const meta = getNotificationMeta(notif.type, t);
                const IconComponent = meta.icon;

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`group relative p-3.5 transition-colors flex items-start gap-3 cursor-pointer ${
                      !notif.read
                        ? "bg-sky-50/40 hover:bg-sky-50/70"
                        : "hover:bg-slate-50/80"
                    }`}
                  >
                    {/* Icône du type */}
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 border shadow-xs ${meta.color}`}
                    >
                      <IconComponent size={16} />
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          {meta.label}
                        </span>
                        {!notif.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#32A8D7]" />
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-slate-800 leading-snug truncate">
                        {notif.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed line-clamp-2">
                        {notif.message}
                      </p>

                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1.5">
                        <Clock size={11} />
                        <span>{formatRelativeTime(notif.createdAt, t, locale)}</span>
                      </div>
                    </div>

                    {/* Actions au survol */}
                    <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notif.id);
                        }}
                        className="p-1 text-slate-400 hover:text-red-500 rounded-md hover:bg-white transition-colors"
                        title={t("deleteTooltip")}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
