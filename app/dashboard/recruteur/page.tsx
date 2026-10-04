"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
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
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";
import TalentCard from "@/app/components/TalentCard";
import CandidaturesTab from "./components/CandidaturesTab";
import EmploisTab from "./components/EmploisTab";
import FavorisTab from "./components/FavorisTab";
import AffiliationTab from "./components/AffiliationTab";
import ParametresTab from "./components/ParametresTab";
import ProfilTab from "./components/ProfilTab";
import TransactionsTab from "./components/TransactionsTab";
import RecruteurPremium from "./components/RecruteurPremium";
import LogoutButton from "../../components/LogoutButton";
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
  | "affiliation"
  | "parametres"
  | "profil"
  | "premium";

// ─── Component ─────────────────────────────────────────────────────────────────
export default function RecruteurDashboard() {
  const { user, logout } = useAuth();
  const locale = useLocale();
  const t = useTranslations();
  
  const [searchQuery, setSearchQuery] = useState("");
  const { data: talentsRaw } = useSWR(`/api/talents?q=${encodeURIComponent(searchQuery)}`, fetcher);
  const talents = Array.isArray(talentsRaw) ? talentsRaw : (talentsRaw?.talents || []);
  const { data: emploisFetched = [] } = useSWR("/api/jobs?mine=true", fetcher);
  const emplois = Array.isArray(emploisFetched) ? emploisFetched : (emploisFetched.jobs || []);

  const [isPremium, setIsPremium] = useState<boolean>(false);

  useEffect(() => {
    fetch("/api/recruiters/me", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          if (data.isPremium !== undefined) setIsPremium(data.isPremium);
        }
      })
      .catch((err) => console.error("Erreur chargement profil:", err));
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
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab") as RecruiterTab | null;
      if (
        tab &&
        [
          "dashboard",
          "recherche",
          "candidatures",
          "emplois",
          "transactions",
          "favoris",
          "affiliation",
          "parametres",
          "premium",
        ].includes(tab)
      ) {
        setActiveTab(tab);
      }
    }
  }, []);

  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("favorites");
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {}
    }
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
    let newFavorites;
    if (favorites.includes(strId)) {
      newFavorites = favorites.filter((f) => f !== strId);
      showToast("Profil retiré des favoris.");
    } else {
      newFavorites = [...favorites, strId];
      showToast("Profil ajouté aux favoris !");
    }
    setFavorites(newFavorites);
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
  };

  // ─── Sidebar items ───────────────────────────────────────────────────────────
  const sidebarItems = [
    { key: "dashboard" as RecruiterTab, icon: LayoutDashboard, label: t("nav.home") },
    { key: "recherche" as RecruiterTab, icon: Search, label: t("nav.searchTalents") },
    { key: "candidatures" as RecruiterTab, icon: Users, label: t("nav.applications") },
    { key: "emplois" as RecruiterTab, icon: Briefcase, label: t("nav.myJobs") },
    { key: "transactions" as RecruiterTab, icon: CreditCard, label: "Transactions" },
    { key: "favoris" as RecruiterTab, icon: Bookmark, label: t("nav.favorites") },
    { key: "affiliation" as RecruiterTab, icon: Share2, label: t("nav.affiliation") },
    { key: "parametres" as RecruiterTab, icon: Settings, label: t("nav.settings") },
    { key: "premium" as RecruiterTab, icon: Crown, label: "Premium" },
  ];

  return (
    <>
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">

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
            <div className="relative h-7 w-28">
              <Image
                src="/Logo/PNG/Logo.png"
                alt="Netacuv Logo"
                fill
                priority
                className="object-contain object-left"
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
          
          <div className="mt-2 pt-2 border-t border-slate-100 px-4">
            <LanguageSwitcher />
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
                Tableau de <span className="text-[#32A8D7]">bord</span>
              </h1>
            )}
            {activeTab === "recherche" && (
              <h1 className="text-xl sm:text-2xl font-bold text-[#232323] tracking-tight">
                Recherche <span className="text-[#32A8D7]">profil</span>
              </h1>
            )}
            {activeTab === "candidatures" && (
              <h1 className="text-xl sm:text-2xl font-bold text-[#232323] tracking-tight">
                Candidatures <span className="text-[#32A8D7]">reçues</span>
              </h1>
            )}
            {activeTab === "emplois" && (
              <h1 className="text-xl sm:text-2xl font-bold text-[#232323] tracking-tight">
                Offres d&apos;<span className="text-[#32A8D7]">emplois</span>
              </h1>
            )}
            {activeTab === "transactions" && (
              <h1 className="text-xl sm:text-2xl font-bold text-[#232323] tracking-tight">
                Mes <span className="text-[#32A8D7]">transactions</span>
              </h1>
            )}
            {activeTab === "favoris" && (
              <h1 className="text-xl sm:text-2xl font-bold text-[#232323] tracking-tight">
                Mes <span className="text-[#32A8D7]">enregistrements</span>
              </h1>
            )}
            {activeTab === "affiliation" && (
              <h1 className="text-xl sm:text-2xl font-bold text-[#232323] tracking-tight">
                Parrainez et <span className="text-[#32A8D7]">gagnez</span>
              </h1>
            )}
            {activeTab === "parametres" && (
              <h1 className="text-xl sm:text-2xl font-bold text-[#232323] tracking-tight">
                Paramètres du <span className="text-[#32A8D7]">compte</span>
              </h1>
            )}
            {activeTab === "premium" && (
              <h1 className="text-xl sm:text-2xl font-bold text-[#232323] tracking-tight">
                Abonnement <span className="text-[#32A8D7]">Premium</span>
              </h1>
            )}
          </div>

          {/* Right: lang + notifications + avatar */}
          <div className="flex items-center gap-3">
            {/* Quota Indicator / Premium */}
            {isPremium ? (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-full border border-yellow-500/30 text-yellow-600 shadow-inner">
                <Star size={14} className="fill-yellow-500 text-yellow-500" />
                <span className="text-xs font-bold">Premium - Illimité</span>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-medium leading-none mb-0.5">Offres créées ce mois</span>
                  <span className="text-xs font-bold text-slate-800 leading-none">{emplois.length}</span>
                </div>
                <button onClick={() => setActiveTab("premium")} className="text-[10px] font-bold text-[#32A8D7] hover:text-[#2896c2] bg-sky-50 hover:bg-sky-100 px-2 py-1 rounded-full transition-colors ml-2">
                  Passer au Premium
                </button>
              </div>
            )}



            {/* Bell */}
            <div className="relative">
              <button
                onClick={() => { setNotifMenuOpen(!notifMenuOpen); setProfileMenuOpen(false); }}
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative"
                aria-label="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifMenuOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-30 animate-fade-in">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-800">Notifications ({unreadCount})</p>
                    <button
                      onClick={() => setNotifications(notifications.map((n) => ({ ...n, read: true })))}
                      className="text-[10px] text-[#32A8D7] hover:underline font-semibold"
                    >
                      Tout marquer comme lu
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 text-xs hover:bg-slate-50 transition-colors ${!notif.read ? "bg-sky-50/40" : ""}`}
                      >
                        <p className="text-slate-800 font-medium leading-snug">{notif.text}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">{notif.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Avatar */}
            <div className="relative">
              <button
                onClick={() => { setProfileMenuOpen(!profileMenuOpen); setNotifMenuOpen(false); }}
                className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 relative">
                  <Image
                    src={user?.avatar || "/assets/avatar_africain.jpg"}
                    alt="Avatar"
                    width={32}
                    height={32}
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
              {/* Row 1 – Candidatures, Favoris, Affiliation */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
                {/* Card 1: Candidatures */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-slate-900 text-base">Candidatures</h3>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                        0
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                      Aucune candidature reçue pour le moment.
                    </p>
                  </div>
                  <button
                    onClick={() => handleTabChange("candidatures")}
                    className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-[#4bb3e6] hover:bg-[#32a8d7] transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <FileText size={15} /> Voir les candidatures
                  </button>
                </div>

                {/* Card 2: Favoris */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-slate-900 text-base">Favoris</h3>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                        {favorites.length}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                      Liste de vos favoris. Profils sauvegardés
                    </p>
                  </div>
                  <button
                    onClick={() => handleTabChange("favoris")}
                    className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-[#0088cc] hover:bg-[#0077b3] transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Bookmark size={15} /> Voir les favoris
                  </button>
                </div>

                {/* Card 3: Affiliation */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-slate-900 text-base">Affiliation</h3>
                    </div>
                    <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                      Vous avez parrainé 4 personnes au total
                    </p>
                  </div>
                  <button
                    onClick={() => handleTabChange("affiliation")}
                    className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-[#08304c] hover:bg-[#062439] transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Share2 size={15} /> Voir les détails
                  </button>
                </div>
              </div>

              {/* Row 2 – Emplois créés */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 text-base">Emplois créés</h3>
                  <span className="text-xs font-medium px-3.5 py-1 rounded-full bg-sky-50 text-[#0071a2]">
                    {emplois.length} emplois
                  </span>
                </div>

                <div className="space-y-3 mb-5">
                  <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 text-center text-sm text-slate-500">
                    {emplois.length === 0 ? "Vous n'avez pas encore créé d'offre d'emploi." : `Vous avez créé ${emplois.length} offre(s) d'emploi au total.`}
                  </div>
                </div>

                <button
                  onClick={() => handleTabChange("emplois")}
                  className="w-full py-3 rounded-xl font-semibold text-xs text-white bg-[#60bbf7] hover:bg-[#4aaef5] transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <Gift size={15} /> Voir toutes les offres d'emplois créés
                </button>
              </div>

              {/* Row 3 – Créer un emploi & Paramètres */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                {/* Créer un emploi */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base mb-1">Créer un emploi</h3>
                    <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                      Créer un emploi, changer des vies certainement.
                    </p>
                  </div>
                  <button
                    onClick={() => handleTabChange("emplois")}
                    className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-[#0071a2] hover:bg-[#005c84] transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <FileText size={15} /> Commencer
                  </button>
                </div>

                {/* Paramètres */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base mb-1">Paramètres</h3>
                    <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                      Gérez vos préférences et votre compte
                    </p>
                  </div>
                  <button
                    onClick={() => handleTabChange("parametres")}
                    className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-[#0099e6] hover:bg-[#0088cc] transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Settings size={15} /> Accéder
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
                    placeholder="Rechercher par compétences, métier..."
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
                  Rechercher
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
                      <span className="text-sm font-bold text-slate-700">Filtres Premium</span>
                    </div>
                  </div>
                )}
                {[
                  { label: "Diplôme", options: ["Toutes les licenses", "Licence Pro", "Master / Ingénieur", "Doctorat", "Certifié Netacuv"] },
                  { label: "Genre", options: ["Tous les genres", "Femme", "Homme"] },
                  { label: "Pays", options: ["Tous les pays", "Bénin", "Côte d'Ivoire", "Sénégal", "Togo", "Cameroun", "France"] },
                  { label: "Ville", options: ["Toutes les villes", "Cotonou", "Porto-Novo", "Abidjan", "Dakar", "Lomé", "Douala", "Paris"] },
                ].map((filter) => (
                  <div key={filter.label} className="relative">
                    <select 
                      disabled={!isPremium}
                      className="w-full appearance-none bg-slate-100 hover:bg-slate-200/70 border border-slate-200/80 rounded-md py-2.5 pl-4 pr-9 text-sm font-medium text-slate-700 outline-none hover:border-slate-300 focus:border-[#32A8D7] focus:bg-white cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">{filter.label}</option>
                      {filter.options.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
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
                        isVerified={tItem.isVerified ?? true}
                        isFavorite={favorites.includes(tItem.id)}
                        onFavorite={toggleFavorite}
                        blurSensitive={!user?.isPremium}
                        isPremium={tItem.isPremium}
                        hasVideo={tItem.videoOk}
                      />
                    );
                  })
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-xl border border-slate-100 shadow-sm">
                    <Search className="w-12 h-12 mb-4 text-slate-300" />
                    <p className="text-lg font-medium text-slate-500 mb-1">Aucun talent trouvé</p>
                    <p className="text-sm">Nous n'avons pas trouvé de talents correspondant à votre recherche.</p>
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
                    Page précédente
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-2 px-5 py-2 bg-[#32A8D7] hover:bg-[#2896c2] text-white rounded-md text-sm font-semibold transition-colors shadow-sm"
                  >
                    Page suivante
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-sm text-slate-500 font-medium">
                  Page 1 de 26
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

          {/* TAB: AFFILIATION */}
          {activeTab === "affiliation" && <AffiliationTab />}

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
