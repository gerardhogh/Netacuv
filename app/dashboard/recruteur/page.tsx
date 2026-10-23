"use client";

import { useState, useEffect, Suspense } from "react";
import useSWR from "swr";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../../context/AuthContext";
import {
  Menu,
  Bell,
  ChevronDown,
  ChevronRight,
  Briefcase,
  Bookmark,
  Share2,
  Settings,
  LogOut,
  Home,
  Users,
  Search,
  X,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  LayoutDashboard,
  FileText,
  Gift,
  User,
  Globe,
  CreditCard,
  Crown,
  Star,
  MapPin,
  Clock,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { EmptyState } from "@/components/ui/EmptyState";
import TalentCard from "@/app/components/TalentCard";
import CandidaturesTab from "./components/CandidaturesTab";
import EmploisTab from "./components/EmploisTab";
import FavorisTab from "./components/FavorisTab";
import ParametresTab from "./components/ParametresTab";
import ProfilTab from "./components/ProfilTab";
import TransactionsTab from "./components/TransactionsTab";
import RecruteurPremium from "./components/RecruteurPremium";
import LogoutButton from "../../components/LogoutButton";
import NotificationBell from "@/app/components/NotificationBell";
import PremiumBanner from "../../components/PremiumBanner";

const fetcher = (url: string) => fetch(url).then(res => res.json());

// ─── Types ────────────────────────────────────────────────────────────────────
type RecruiterTab =
  | "dashboard"
  | "recherche"
  | "candidatures"
  | "emplois"
  | "transactions"
  | "favoris"
  | "parametres"
  | "profil"
  | "premium";

// ─── Component ─────────────────────────────────────────────────────────────────
function RecruteurDashboard() {
  const { user, logout } = useAuth();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations();
  
  const [searchQuery, setSearchQuery] = useState("");
  const { data: talentsRaw } = useSWR(`/api/talents?q=${encodeURIComponent(searchQuery)}`, fetcher);
  const talents = Array.isArray(talentsRaw) ? talentsRaw : (talentsRaw?.talents || []);
  const { data: emploisFetched = [] } = useSWR("/api/jobs?mine=true", fetcher);
  const emplois = Array.isArray(emploisFetched) ? emploisFetched : (emploisFetched.jobs || []);
  const { data: applicationsRaw } = useSWR("/api/applications?role=recruiter&limit=1", fetcher);
  const totalApplicationsCount = applicationsRaw?.totalCount ?? (Array.isArray(applicationsRaw) ? applicationsRaw.length : (applicationsRaw?.applications?.length || 0));

  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [recruiterAvatar, setRecruiterAvatar] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("recruiter_avatar");
    }
    return null;
  });
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});

  const fetchProfileAndPremium = () => {
    fetch("/api/recruiters/me", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          if (data.isPremium !== undefined) setIsPremium(data.isPremium);
          if (data.avatar) {
            setRecruiterAvatar(data.avatar);
            if (typeof window !== "undefined") {
              localStorage.setItem("recruiter_avatar", data.avatar);
            }
          }
        }
      })
      .catch((err) => console.error("Erreur chargement profil:", err));
  };

  useEffect(() => {
    fetchProfileAndPremium();

    // Rafraîchit quand l'utilisateur revient sur l'onglet (sync cross-appareils)
    const handleVisibility = () => {
      if (document.visibilityState === "visible") fetchProfileAndPremium();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const handleProfileUpdated = (e: any) => {
      if (e?.detail?.avatarUrl) {
        setRecruiterAvatar(e.detail.avatarUrl);
      }
      fetchProfileAndPremium();
    };
    if (typeof window !== "undefined") {
      window.addEventListener("recruiter_profile_updated", handleProfileUpdated);
    }

    // Rafraîchit toutes les 60 secondes
    const interval = setInterval(fetchProfileAndPremium, 60_000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      if (typeof window !== "undefined") {
        window.removeEventListener("recruiter_profile_updated", handleProfileUpdated);
      }
      clearInterval(interval);
    };
  }, []);

  const [activeTab, setActiveTab] = useState<RecruiterTab>("dashboard");

  const handleTabChange = (tab: RecruiterTab) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.pushState({}, "", url.toString());
    }
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const syncTabFromUrl = () => {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      const hash = window.location.hash.replace("#", "") as RecruiterTab;
      const tab = (params.get("tab") || hash) as RecruiterTab | null;
      if (
        tab &&
        [
          "dashboard",
          "recherche",
          "candidatures",
          "emplois",
          "transactions",
          "favoris",
          "parametres",
          "premium",
          "profil",
        ].includes(tab)
      ) {
        setActiveTab(tab);
      }
    };

    syncTabFromUrl();
    window.addEventListener("popstate", syncTabFromUrl);
    window.addEventListener("hashchange", syncTabFromUrl);
    const handleSwitchTab = (e: any) => {
      const tab = e?.detail?.tab || e?.detail || e;
      if (tab && typeof tab === "string") {
        setActiveTab(tab as RecruiterTab);
      }
    };
    window.addEventListener("switchRecruiterTab", handleSwitchTab);
    return () => {
      window.removeEventListener("popstate", syncTabFromUrl);
      window.removeEventListener("hashchange", syncTabFromUrl);
      window.removeEventListener("switchRecruiterTab", handleSwitchTab);
    };
  }, []);

  // Écoute réactive des searchParams pour les navigations App Router (router.push)
  useEffect(() => {
    const tab = searchParams.get("tab") as RecruiterTab | null;
    if (
      tab &&
      [
        "dashboard",
        "recherche",
        "candidatures",
        "emplois",
        "transactions",
        "favoris",
        "parametres",
        "premium",
        "profil",
      ].includes(tab)
    ) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    // 1. Initial load from localStorage
    const saved = localStorage.getItem("favorites");
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {}
    }

    // 2. Sync from backend API
    fetch("/api/favorites?type=TALENT")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.favorites && Array.isArray(data.favorites)) {
          const apiFavIds = data.favorites.map((f: any) => String(f.targetId));
          setFavorites((prev) => {
            const merged = Array.from(new Set([...prev, ...apiFavIds]));
            localStorage.setItem("favorites", JSON.stringify(merged));
            return merged;
          });
        }
      })
      .catch((err) => console.error("Error fetching recruiter favorites:", err));
  }, []);

  // Notifications
  const [notifications, setNotifications] = useState<any[]>([]);

  const companyName = (user as any)?.company || user?.name || "Grand-G Corp";
  const companyEmail = user?.email || "recruteur@grand-g.com";
  const unreadCount = notifications.filter((n) => !n.read).length;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleFavorite = (id?: string | number) => {
    if (!id) return;
    const strId = String(id);
    let newFavorites: string[];
    const isFav = favorites.includes(strId);

    if (isFav) {
      newFavorites = favorites.filter((f) => f !== strId);
      showToast("Profil retiré des favoris.");
    } else {
      newFavorites = [...favorites, strId];
      showToast("Profil ajouté aux favoris !");
    }

    setFavorites(newFavorites);
    localStorage.setItem("favorites", JSON.stringify(newFavorites));

    // Backend sync
    const talentObj = talents.find((t: any) => String(t.id) === strId);
    fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetType: "TALENT",
        targetId: strId,
        title: talentObj?.name || "Candidat",
        subtitle: talentObj?.profession || "Professionnel",
        location: talentObj?.location,
      }),
    }).catch(console.error);
  };

  // ─── Sidebar items ───────────────────────────────────────────────────────────
  const sidebarItems = [
    { key: "dashboard" as RecruiterTab, icon: LayoutDashboard, label: t("nav.dashboard") },
    { key: "recherche" as RecruiterTab, icon: Search, label: t("nav.searchTalents") },
    { key: "candidatures" as RecruiterTab, icon: Users, label: t("nav.applications") },
    { key: "emplois" as RecruiterTab, icon: Briefcase, label: t("nav.myJobs") },
    { key: "transactions" as RecruiterTab, icon: CreditCard, label: t("recruiter.transactions") },
    { key: "favoris" as RecruiterTab, icon: Bookmark, label: t("nav.favorites") },
    { key: "profil" as RecruiterTab, icon: User, label: t("nav.myProfile") },
    { key: "parametres" as RecruiterTab, icon: Settings, label: t("nav.settings") },
    { key: "premium" as RecruiterTab, icon: Crown, label: "Premium" },
  ];

  return (
    <>
    <div className="flex min-h-screen bg-[#fafbfc] text-slate-800 font-sans">

      {/* ── Toast ─────────────────────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-sm animate-fade-in border border-slate-700">
          <CheckCircle size={18} className="text-green-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Mobile overlay ────────────────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[50] md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ───────────────────────────────────────────────────────────── */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 z-[60]
          w-64 h-screen bg-white border-r border-slate-200
          flex flex-col transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <Link href="/" className="block">
            <div className="relative h-7 w-28 flex items-center">
              <img
                src="/Logo/PNG/Logo.png"
                alt="Netacuv Logo"
                className="h-7 w-auto object-contain object-left"
              />
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-slate-600 p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {sidebarItems.map(({ key, icon: Icon, label }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => { handleTabChange(key); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#32A8D7] text-white shadow-lg shadow-sky-500/25 translate-x-1"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon size={18} className="flex-shrink-0" />
                <span>{label}</span>
              </button>
            );
          })}
          
          {/* Mobile drawer uniquement : nom du pays à côté du drapeau */}
          <div className="mt-2 pt-2 border-t border-slate-100 px-4 md:hidden">
            <LanguageSwitcher variant="mobile" showLabel={true} onSelect={() => setSidebarOpen(false)} />
          </div>
        </nav>

      </aside>

      {/* ── MAIN CONTENT AREA ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        
        <PremiumBanner isPremium={isPremium} onUpgrade={() => handleTabChange("premium")} />

        {/* ── TOP HEADER ──────────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-[40] bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6">
          {/* Left: burger + Titre de la page */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-[#32A8D7] hover:bg-sky-50 p-2 rounded-lg transition-colors md:hidden"
              aria-label="Ouvrir le menu"
            >
              <Menu size={22} />
            </button>

            {activeTab === "dashboard" && (
              <h1 className="text-xl sm:text-2xl font-bold text-[#232323] tracking-tight">
                {t("recruiter.dashboard")}
              </h1>
            )}
            {activeTab === "recherche" && (
              <h1 className="text-xl sm:text-2xl font-bold text-[#232323] tracking-tight">
                {t("recruiter.searchTalents")}
              </h1>
            )}
            {activeTab === "candidatures" && (
              <h1 className="text-xl sm:text-2xl font-bold text-[#232323] tracking-tight">
                {t("recruiter.applications")}
              </h1>
            )}
            {activeTab === "emplois" && (
              <h1 className="text-xl sm:text-2xl font-bold text-[#232323] tracking-tight">
                {t("recruiter.myJobs")}
              </h1>
            )}
            {activeTab === "transactions" && (
              <h1 className="text-xl sm:text-2xl font-bold text-[#232323] tracking-tight">
                {t("recruiter.transactions")}
              </h1>
            )}
            {activeTab === "favoris" && (
              <h1 className="text-xl sm:text-2xl font-bold text-[#232323] tracking-tight">
                {t("recruiter.bookmarks")}
              </h1>
            )}
            {activeTab === "parametres" && (
              <h1 className="text-xl sm:text-2xl font-bold text-[#232323] tracking-tight">
                {t("recruiter.accountSettings")}
              </h1>
            )}
            {activeTab === "premium" && (
              <h1 className="text-xl sm:text-2xl font-bold text-[#232323] tracking-tight">
                {t("recruiter.premiumSubscription")}
              </h1>
            )}
            {activeTab === "profil" && (
              <h1 className="text-xl sm:text-2xl font-bold text-[#232323] tracking-tight">
                {t("recruiter.myProfile")}
              </h1>
            )}
          </div>

          {/* Right: lang + notifications + avatar */}
          <div className="flex items-center gap-3">
            {/* Quota Indicator / Premium */}
            {isPremium ? (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-full border border-yellow-500/30 text-yellow-600 shadow-inner">
                <Star size={14} className="fill-yellow-500 text-yellow-500" />
                <span className="text-xs font-bold">{t("recruiter.premiumUnlimited")}</span>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-medium leading-none mb-0.5">{t("recruiter.jobsCreatedThisMonth")}</span>
                  <span className="text-xs font-bold text-slate-800 leading-none">{emplois.length}</span>
                </div>
                <button onClick={() => setActiveTab("premium")} className="text-[10px] font-bold text-[#32A8D7] hover:text-[#2896c2] bg-sky-50 hover:bg-sky-100 px-2 py-1 rounded-full transition-colors ml-2">
                  {t("recruiter.upgradeToPremium")}
                </button>
              </div>
            )}



            {/* Desktop Language Switcher (Drapeau + flèche uniquement) */}
            <div className="hidden md:flex items-center">
              <LanguageSwitcher variant="desktop" showLabel={false} align="right" />
            </div>

            {/* Notification Bell temps réel */}
            <NotificationBell align="right" />

            {/* Avatar */}
            <div className="relative">
              <button
                onClick={() => { setProfileMenuOpen(!profileMenuOpen); setNotifMenuOpen(false); }}
                className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 relative">
                  <img
                    src={recruiterAvatar || user?.avatar || "/assets/avatar_africain.jpg"}
                    alt="Avatar"
                    width={32}
                    height={32}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/assets/avatar_africain.jpg";
                    }}
                    className="object-cover w-full h-full object-center"
                  />
                </div>
                <ChevronDown size={14} className="text-slate-500" />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-30 animate-fade-in">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-800 truncate">{companyName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{companyEmail}</p>
                  </div>
                  <button
                    onClick={() => { handleTabChange("profil"); setProfileMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 font-medium flex items-center gap-2"
                  >
                    <User size={14} /> {t("nav.myProfile")}
                  </button>
                  <button
                    onClick={() => { handleTabChange("parametres"); setProfileMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 font-medium flex items-center gap-2"
                  >
                    <Settings size={14} /> {t("nav.settings")}
                  </button>
                  <LogoutButton
                    onCancelClick={() => setProfileMenuOpen(false)}
                    className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-semibold border-t border-slate-100 mt-1 flex items-center gap-2"
                  >
                    <LogOut size={14} /> {t("nav.logout")}
                  </LogoutButton>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── PAGE CONTENT ────────────────────────────────────────────────────── */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">

          {/* TAB: DASHBOARD (ACCUEIL) */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Row 1 – Candidatures, Favoris */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                {/* Card 1: Candidatures */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-slate-900 text-base">{t("recruiter.applicationsCard.title")}</h3>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                        {totalApplicationsCount}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                      {totalApplicationsCount > 0 
                        ? `${totalApplicationsCount} candidature${totalApplicationsCount > 1 ? "s" : ""} reçue${totalApplicationsCount > 1 ? "s" : ""}. Consultez les profils et les évaluations.`
                        : t("recruiter.applicationsCard.empty")}
                    </p>
                  </div>
                  <button
                    onClick={() => handleTabChange("candidatures")}
                    className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-[#4bb3e6] hover:bg-[#32a8d7] transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <FileText size={15} /> {t("recruiter.applicationsCard.btn")}
                  </button>
                </div>

                {/* Card 2: Favoris */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-slate-900 text-base">{t("recruiter.favoritesCard.title")}</h3>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                        {favorites.length}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                      {t("recruiter.favoritesCard.desc")}
                    </p>
                  </div>
                  <button
                    onClick={() => handleTabChange("favoris")}
                    className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-[#0088cc] hover:bg-[#0077b3] transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Bookmark size={15} /> {t("recruiter.favoritesCard.btn")}
                  </button>
                </div>
              </div>

              {/* Row 2 – Emplois créés */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{t("recruiter.createdJobsCard.title")}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {emplois.length > 3 
                        ? "Affichage des 3 premières offres d'emploi"
                        : emplois.length === 1 
                        ? "1 offre d'emploi créée" 
                        : `${emplois.length} offre(s) d'emploi au total`}
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-sky-50 text-[#0071a2] border border-sky-100">
                    {t("recruiter.createdJobsCard.badge", { count: emplois.length })}
                  </span>
                </div>

                <div className="space-y-3 mb-5">
                  {emplois.length === 0 ? (
                    <div className="p-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center text-sm text-slate-500">
                      {t("recruiter.createdJobsCard.empty")}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {emplois.slice(0, 3).map((job: any) => {
                        const isClosed = job.status === "CLOSED" || (job.expiresAt && new Date(job.expiresAt) < new Date());
                        const applicationsCount = job._count?.applications ?? job.candidatures ?? 0;
                        return (
                          <div
                            key={job.id}
                            onClick={() => handleTabChange("emplois")}
                            className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-[#32A8D7]/40 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h4 className="font-bold text-sm text-slate-900 group-hover:text-[#32A8D7] transition-colors line-clamp-1">
                                  {job.title || job.titre}
                                </h4>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                  !isClosed
                                    ? "bg-green-50 text-green-700 border border-green-200"
                                    : "bg-slate-100 text-slate-500 border border-slate-200"
                                }`}>
                                  {!isClosed ? "Actif" : "Clôturé"}
                                </span>
                              </div>

                              <div className="space-y-1 text-xs text-slate-500 mb-3">
                                {(job.location || job.lieu) && (
                                  <div className="flex items-center gap-1.5 truncate">
                                    <MapPin size={12} className="text-slate-400 shrink-0" />
                                    <span className="truncate">{job.location || job.lieu}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2 pt-0.5">
                                  <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md text-[10px] font-semibold text-slate-600">
                                    {job.contractType || job.typeEmploi || "CDI"}
                                  </span>
                                  <span className="text-[11px] font-semibold text-[#0071a2] bg-sky-50 px-2 py-0.5 rounded-md">
                                    {applicationsCount} candidat{applicationsCount > 1 ? "s" : ""}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                              <span>
                                {job.createdAt 
                                  ? new Date(job.createdAt).toLocaleDateString("fr-FR")
                                  : "Récemment"}
                              </span>
                              <span className="text-[#32A8D7] font-semibold group-hover:underline">Gérer →</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleTabChange("emplois")}
                  className="w-full py-3 rounded-xl font-semibold text-xs text-white bg-[#32A8D7] hover:bg-[#2896c2] transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Gift size={15} /> {t("recruiter.createdJobsCard.btn")}
                </button>
              </div>

              {/* Row 3 – Créer un emploi & Paramètres */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                {/* Créer un emploi */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base mb-1">{t("recruiter.createJobCard.title")}</h3>
                    <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                      {t("recruiter.createJobCard.desc")}
                    </p>
                  </div>
                  <button
                    onClick={() => handleTabChange("emplois")}
                    className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-[#0071a2] hover:bg-[#005c84] transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <FileText size={15} /> {t("recruiter.createJobCard.btn")}
                  </button>
                </div>

                {/* Paramètres */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base mb-1">{t("recruiter.settingsCard.title")}</h3>
                    <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                      {t("recruiter.settingsCard.desc")}
                    </p>
                  </div>
                  <button
                    onClick={() => handleTabChange("parametres")}
                    className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-[#0099e6] hover:bg-[#0088cc] transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Settings size={15} /> {t("recruiter.settingsCard.btn")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: RECHERCHE PROFIL */}
          {activeTab === "recherche" && (
            <>
              {/* Search Bar */}
              <div className="flex w-full items-center gap-2 bg-white rounded-lg p-1.5 sm:p-2 border border-slate-200 shadow-sm">
                <div className="flex-1 flex items-center gap-2.5 px-3">
                  <Search className="w-5 h-5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 outline-none text-slate-800 bg-transparent text-sm placeholder:text-slate-400 font-medium"
                    placeholder={t("recruiter.search.placeholder")}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="p-1 hover:bg-slate-100 rounded-md text-slate-400 transition-colors"
                      aria-label="Effacer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  className="px-6 py-2.5 bg-[#32A8D7] hover:bg-[#2896c2] text-white rounded-md text-sm font-semibold transition-colors shadow-sm hover:shadow"
                >
                  {t("recruiter.search.btn")}
                </button>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 relative">
                {!isPremium && (
                  <div 
                    className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px] rounded-lg cursor-pointer"
                    onClick={() => setActiveTab("premium")}
                    title="Passer Premium pour utiliser les filtres avancés"
                  >
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
                      <Crown size={16} className="text-yellow-500" />
                      <span className="text-sm font-bold text-slate-700">{t("recruiter.search.premiumFilters")}</span>
                    </div>
                  </div>
                )}
                {[
                  { label: t("recruiter.search.diploma"), options: ["Toutes les licenses", "Licence Pro", "Master / Ingénieur", "Doctorat", "Certifié Netacuv"] },
                  { label: t("recruiter.search.gender"), options: ["Tous les genres", "Femme", "Homme"] },
                  { label: t("recruiter.search.country"), options: ["Tous les pays", "Bénin", "Côte d'Ivoire", "Sénégal", "Togo", "Cameroun", "France"] },
                  { label: t("recruiter.search.city"), options: ["Toutes les villes", "Cotonou", "Porto-Novo", "Abidjan", "Dakar", "Lomé", "Douala", "Paris"] },
                ].map((filter) => (
                  <CustomSelect
                    key={filter.label}
                    disabled={!isPremium}
                    value={filterValues[filter.label] || ""}
                    placeholder={filter.label}
                    options={filter.options}
                    onChange={(val) => setFilterValues((prev) => ({ ...prev, [filter.label]: val }))}
                  />
                ))}
              </div>

              {/* Talent Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
                {talents.length > 0 ? (
                  talents.map((tItem: any) => {
                    const profile = tItem.talentProfile || {};
                    return (
                      <TalentCard
                        key={tItem.id}
                        id={tItem.id}
                        name={tItem.name || "Candidat Anonyme"}
                        location={tItem.location}
                        profession={tItem.profession}
                        imageUrl={tItem.avatar || "/assets/avatar_africain.jpg"}
                        isVerified={tItem.isPremium || false}
                        isFavorite={favorites.includes(tItem.id)}
                        onFavorite={toggleFavorite}
                        blurSensitive={!user?.isPremium}
                        isPremium={tItem.isPremium}
                        hasVideo={tItem.videoOk}
                      />
                    );
                  })
                ) : (
                  <div className="col-span-full">
                    <EmptyState
                      type="talents"
                      title={t("recruiter.search.noTalentTitle")}
                      description={t("recruiter.search.noTalentDesc")}
                    />
                  </div>
                )}
              </div>

              {/* Pagination */}
              <div className="mt-2 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 pt-6">
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                  <button
                    type="button"
                    disabled
                    className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-md text-sm font-medium text-slate-400 bg-slate-50 cursor-not-allowed"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {t("recruiter.search.prevPage")}
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-2 px-5 py-2 bg-[#32A8D7] hover:bg-[#2896c2] text-white rounded-md text-sm font-semibold transition-colors shadow-sm"
                  >
                    {t("recruiter.search.nextPage")}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-sm text-slate-500 font-medium">
                  {t("recruiter.search.pageOf", { current: 1, total: 26 })}
                </div>
              </div>
            </>
          )}

          {/* TAB: CANDIDATURES */}
          {activeTab === "candidatures" && <CandidaturesTab />}

          {/* TAB: EMPLOIS */}
          {activeTab === "emplois" && (
            <EmploisTab />
          )}

          {/* TAB: TRANSACTIONS */}
          {activeTab === "transactions" && <TransactionsTab />}

          {/* TAB: FAVORIS */}
          {activeTab === "favoris" && (
            <FavorisTab
              favorites={favorites}
              talents={talents}
              toggleFavorite={toggleFavorite}
              onViewProfile={(id) => showToast(`Consultation du profil ${id}`)}
              onSendEmail={(name) => showToast(`Email envoyé à ${name}`)}
            />
          )}

          {/* TAB: PARAMETRES */}
          {activeTab === "parametres" && <ParametresTab />}

          {/* TAB: PROFIL */}
          {activeTab === "profil" && <ProfilTab />}

          {activeTab === "premium" && <RecruteurPremium isPremium={isPremium} />}

        </main>
      </div>
    </div>
    </>
  );
}

export default function RecruteurDashboardPage() {
  return (
    <Suspense fallback={null}>
      <RecruteurDashboard />
    </Suspense>
  );
}
