"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useTranslations, useLocale } from "next-intl";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";
import LogoutButton from "../../components/LogoutButton";
import {
  Menu,
  Bell,
  ChevronDown,
  Upload,
  Video,
  Briefcase,
  Settings,
  LogOut,
  Home,
  Share2,
  FileText,
  X,
  MessageCircle,
  CheckCircle,
  Copy,
  Search,
  Camera,
  Check,
  Download,
  Edit,
  Star,
  Globe,
  History,
  CreditCard,
  QrCode,
  AlertTriangle,
  ChevronRight,
  Lock,
  Bookmark,
} from "lucide-react";

import OffresEmplois from "./components/OffresEmplois";
import TalentPremium from "./components/TalentPremium";
import ProfilTalent from "./components/ProfilTalent";
import TransactionsTab from "./components/TransactionsTab";
import FavorisTalentTab from "./components/FavorisTab";
import ParametresTab from "./components/ParametresTab";
import PremiumBanner from "../../components/PremiumBanner";
import PremiumRequiredModal from "../../components/PremiumRequiredModal";
import NotificationBell from "@/app/components/NotificationBell";

type TalentTab =
  | "dashboard"
  | "profil"
  | "transactions"
  | "video"
  | "emplois"
  | "favoris"
  | "premium"
  | "affiliation"
  | "parametres";

export default function TalentDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TalentTab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const lang = useLocale();
  const t = useTranslations();

  // Dynamic Dashboard States
  const [profilePct, setProfilePct] = useState(0);
  const [stars, setStars] = useState(0);
  const [hasValidVideo, setHasValidVideo] = useState(false);
  const [hasPersonalInfo, setHasPersonalInfo] = useState(false);
  const [hasSocialLinks, setHasSocialLinks] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [cvFileName, setCvFileName] = useState("CV_Candidat_2025.pdf");
  const [cvUploadedAt, setCvUploadedAt] = useState("Mis à jour il y a 2 jours");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Affiliation
  const [affiliationCount, setAffiliationCount] = useState(0);
  const [affiliationBalance, setAffiliationBalance] = useState(0);
  const [affiliations, setAffiliations] = useState<any[]>([]);
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const [withdrawPhone, setWithdrawPhone] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("MTN MoMo");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  // Modals state
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoStep, setVideoStep] = useState<"intro" | "recording" | "done">("intro");
  const [affiliationModalOpen, setAffiliationModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [profileGuideOpen, setProfileGuideOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [showVideoPremiumModal, setShowVideoPremiumModal] = useState(false);

  // Profile editable state
  const [userName, setUserName] = useState(user?.name || "Candidat");
  const [userAvatar, setUserAvatar] = useState(user?.avatar || "/assets/avatar_africain.jpg");
  
  // Premium & Quota
  const [isPremium, setIsPremium] = useState(false);
  const [applicationsCount, setApplicationsCount] = useState(0);

  const isFirstRender = useRef(true);

  // Sync activeTab with URL Query / Hash for persistence on reload or redirect
  useEffect(() => {
    const syncTabFromUrl = () => {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      const hash = window.location.hash.replace("#", "");
      const targetTab = (tabParam || hash) as TalentTab;
      if (
        targetTab &&
        [
          "dashboard",
          "profil",
          "transactions",
          "video",
          "emplois",
          "favoris",
          "premium",
          "affiliation",
          "parametres",
        ].includes(targetTab)
      ) {
        setActiveTab(targetTab);
      }
    };

    syncTabFromUrl();
    window.addEventListener("popstate", syncTabFromUrl);
    window.addEventListener("hashchange", syncTabFromUrl);
    const handleSwitchTab = (e: any) => {
      const tab = e?.detail || e;
      if (tab && typeof tab === "string") {
        setActiveTab(tab as TalentTab);
      }
    };
    window.addEventListener("switchTalentTab", handleSwitchTab);
    return () => {
      window.removeEventListener("popstate", syncTabFromUrl);
      window.removeEventListener("hashchange", syncTabFromUrl);
      window.removeEventListener("switchTalentTab", handleSwitchTab);
    };
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    window.history.replaceState(null, "", `#${activeTab}`);
  }, [activeTab]);

  const fetchDashboardData = () => {
    fetch("/api/talents/me", { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          if (data.name) setUserName(data.name);
          if (data.avatar) setUserAvatar(data.avatar);
          if (data.isPremium !== undefined) setIsPremium(data.isPremium);
          if (data.applicationsCountThisMonth !== undefined) setApplicationsCount(data.applicationsCountThisMonth);
          if (data.talentProfile?.cvUrl) {
            const url = data.talentProfile.cvUrl;
            // Decode URI component to remove %20 etc, then extract filename
            const rawFileName = url.split('/').pop()?.split('?')[0] || "CV.pdf";
            const decodedName = decodeURIComponent(rawFileName);
            // Remove the timestamp part (e.g. 172948274-file.pdf -> file.pdf) if possible, or just keep it
            // We know the pattern is usually: userId-timestamp-filename
            const nameParts = decodedName.split('-');
            if (nameParts.length > 2) {
              setCvFileName(nameParts.slice(2).join('-').replace(/_/g, ' '));
              
              const timestamp = parseInt(nameParts[1], 10);
              if (!isNaN(timestamp) && timestamp > 1000000000000) {
                const date = new Date(timestamp);
                setCvUploadedAt(date.toLocaleDateString("fr-FR", {
                  day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                }).replace(':', 'h'));
              } else {
                setCvUploadedAt(new Date(data.talentProfile.updatedAt || Date.now()).toLocaleDateString("fr-FR", {
                  day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                }).replace(':', 'h'));
              }
            } else {
              setCvFileName(decodedName.replace(/_/g, ' '));
              setCvUploadedAt(new Date(data.talentProfile.updatedAt || Date.now()).toLocaleDateString("fr-FR", {
                day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
              }).replace(':', 'h'));
            }
          } else {
            const hasLocalCv = typeof window !== "undefined" && localStorage.getItem("check_cv_has_pdf") === "true";
            if (hasLocalCv) {
              setCvFileName(localStorage.getItem("check_cv_name") || "CV.pdf");
              setCvUploadedAt(localStorage.getItem("check_cv_date") || "Mis à jour récemment");
            } else {
              setCvFileName("Aucun CV ajouté");
              setCvUploadedAt("Pas de CV");
            }
          }
          
          const hasDbVid = !!data.talentProfile?.videoUrl;
          const hasLocalRecorded = typeof window !== "undefined" && (
            localStorage.getItem("interview_recorded") === "true" ||
            (data.id && localStorage.getItem(`interview_recorded_${data.id}`) === "true")
          );
          const hasVid = hasDbVid || hasLocalRecorded;
          setHasValidVideo(hasVid);

          // Social links: ALL 5 networks must be filled
          const hasSocial = !!(data.talentProfile?.facebook && data.talentProfile?.linkedin && data.talentProfile?.twitter && data.talentProfile?.pinterest && data.talentProfile?.behance);
          setHasSocialLinks(hasSocial);

          // Personal info requires all main fields + skills
          const isInfoComplete = !!(
            data.name?.trim() &&
            data.talentProfile?.degree?.trim() &&
            data.talentProfile?.gender?.trim() &&
            data.talentProfile?.country?.trim() &&
            data.talentProfile?.city?.trim() &&
            data.talentProfile?.phone?.trim() &&
            data.talentProfile?.bio?.trim() &&
            data.talentProfile?.skills?.trim()
          );
          setHasPersonalInfo(isInfoComplete);

          // The completion percentage is now dynamically calculated by a useEffect based on these states.
        }
      })
      .catch(console.error);

    fetch("/api/affiliation/me", { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setAffiliationBalance(data.cagnotte || 0);
          setAffiliations(data.affilies || []);
          setAffiliationCount(data.affilies?.length || 0);
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchDashboardData();

    // Listen for profile updates from child components (e.g. ProfilTalent)
    const handleUpdate = () => fetchDashboardData();
    window.addEventListener("dashboardProfileUpdated", handleUpdate);

    // Rafraîchit isPremium quand l'utilisateur revient sur l'onglet (depuis un autre appareil / page)
    const handleVisibility = () => {
      if (document.visibilityState === "visible") fetchDashboardData();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // Rafraîchit toutes les 60 secondes → sync cross-appareils garanti
    const interval = setInterval(fetchDashboardData, 60_000);

    return () => {
      window.removeEventListener("dashboardProfileUpdated", handleUpdate);
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let pct = 0;
    if (hasPersonalInfo) pct += 25;
    if (userAvatar && userAvatar !== "/assets/avatar_africain.jpg") pct += 10;
    if (cvFileName && cvFileName !== "Aucun CV ajouté" && cvFileName !== "Pas de CV") pct += 25;
    if (hasValidVideo) pct += 40;
    
    setProfilePct(pct);
    
    if (pct === 100) setStars(5);
    else if (pct >= 80) setStars(4);
    else if (pct >= 60) setStars(3);
    else if (pct >= 40) setStars(2);
    else if (pct >= 1) setStars(1);
    else setStars(0);
    
    if (pct === 100) {
      const hasSeenConfetti = typeof window !== "undefined" && localStorage.getItem("confetti_shown");
      if (!hasSeenConfetti) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
        if (typeof window !== "undefined") {
          localStorage.setItem("confetti_shown", "true");
        }
      }
    }
  }, [hasPersonalInfo, userAvatar, cvFileName, hasValidVideo]);

  const [userTitle, setUserTitle] = useState("Aucun profil");
  const [userPhone, setUserPhone] = useState((user as any)?.phone || "+229 97 00 00 00");
  const [userBio, setUserBio] = useState(
    "Passionné par le développement web moderne, l'architecture logicielle et les interfaces fluides."
  );

  // Jobs state
  const [jobSearch, setJobSearch] = useState("");
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [allJobs, setAllJobs] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/jobs?recommended=true&limit=10")
      .then(res => res.json())
      .then(data => {
        if (data && data.jobs) {
          setAllJobs(data.jobs);
        }
      })
      .catch(err => console.error("Error fetching recommended jobs:", err));
  }, []);
  // Notifications
  const [notifications, setNotifications] = useState<any[]>([]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isPremium) {
      showToast(t("talent.uploadCvPremiumOnly"));
      e.target.value = '';
      return;
    }
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCvFileName(file.name);
      setCvUploadedAt(t("talent.updatedJustNow"));
      showToast(t("talent.cvImportSuccess", { name: file.name }));
    }
  };

  const handleApplyJob = (jobId: string, title: string) => {
    if (appliedJobs.includes(jobId)) return;
    setAppliedJobs([...appliedJobs, jobId]);
    showToast(t("talent.applySuccess", { title }));
  };

  const handleCompleteVideoInterview = () => {
    setVideoStep("done");
    setHasValidVideo(true);
    showToast(t("talent.videoValidatedSuccess"));
    setTimeout(() => {
      setVideoModalOpen(false);
      setVideoStep("intro");
    }, 1500);
  };

  const handleWithdrawalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawalModalOpen(false);
    try {
      const montant = Number(withdrawAmount);
      const res = await fetch("/api/affiliation/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ montant, operateur: withdrawMethod, numero: withdrawPhone })
      });
      if (res.ok) {
        showToast(`Demande de retrait de ${montant.toLocaleString()} CFA via ${withdrawMethod} envoyée !`);
        setAffiliationBalance(prev => prev - montant);
        setWithdrawAmount("");
        setWithdrawPhone("");
      } else {
        const err = await res.json();
        showToast(err.error || "Erreur lors de la demande de retrait");
      }
    } catch (error) {
      showToast("Erreur de connexion.");
    }
  };

  const handleCopyAffiliation = () => {
    const link = `https://netacuv.com/inscription?ref=${(user?.name || "CANDIDAT").toUpperCase().replace(/\s+/g, "")}-750`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    showToast(t("talent.linkCopied"));
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const sidebarItems = [
    { key: "dashboard" as TalentTab, icon: Home, label: t("nav.dashboard") },
    { key: "profil" as TalentTab, icon: FileText, label: t("nav.myProfile") },
    { key: "transactions" as TalentTab, icon: History, label: t("nav.transactions") },
    { key: "video" as TalentTab, icon: Video, label: t("nav.videoInterview") },
    { key: "emplois" as TalentTab, icon: Briefcase, label: t("nav.jobOffers") },
    { key: "favoris" as TalentTab, icon: Bookmark, label: t("nav.favorites") },
    { key: "premium" as TalentTab, icon: Star, label: t("nav.premiumTalents") },
    { key: "affiliation" as TalentTab, icon: Share2, label: t("nav.affiliation") },
    { key: "parametres" as TalentTab, icon: Settings, label: t("nav.settings") },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex min-h-screen bg-[#fafbfc] text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-sm animate-fade-in border border-slate-700">
          <CheckCircle size={18} className="text-green-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hidden CV File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".pdf,.doc,.docx"
        className="hidden"
      />

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[50] md:hidden backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 z-[60]
          w-64 h-screen overflow-hidden bg-white border-r border-slate-200
          flex flex-col justify-between transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Brand Header */}
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

          {/* Sidebar Nav Items */}
          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            {sidebarItems.map(({ key, icon: Icon, label }) => {
              const isActive = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    if (key === "video") {
                      setActiveTab("video");
                    } else {
                      setActiveTab(key);
                    }
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25 translate-x-1"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                >
                  <Icon size={18} />
                  <span className="whitespace-nowrap text-sm font-medium">{label}</span>
                </button>
              );
            })}

            {/* Mobile drawer uniquement : nom du pays à côté du drapeau */}
            <div className="mt-2 pt-2 border-t border-slate-100 px-4 md:hidden">
              <LanguageSwitcher variant="mobile" showLabel={true} onSelect={() => setSidebarOpen(false)} />
            </div>
          </nav>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <PremiumBanner isPremium={isPremium} onUpgrade={() => setActiveTab("premium")} />
        {/* Top Header */}
        <header className="sticky top-0 z-[40] bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-slate-600 hover:text-slate-900 p-1 md:hidden"
              aria-label="Menu"
            >
              <Menu size={22} />
            </button>
            <div>
              <h1 className="text-xl font-normal text-slate-700 leading-tight">
                {t("talent.welcome")}{" "}
                <span className="font-extrabold text-slate-900">
                  {userName.split(" ")[0]}
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">
                {t("talent.candidateArea")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Quota Indicator */}
            {isPremium ? (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-full border border-yellow-500/30 text-yellow-600 shadow-inner">
                <Star size={14} className="fill-yellow-500 text-yellow-500" />
                <span className="text-xs font-bold">{t("talent.premiumUnlimited")}</span>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-medium leading-none mb-0.5">{t("talent.applicationsThisMonth")}</span>
                  <span className="text-xs font-bold text-slate-800 leading-none">{applicationsCount} / 1</span>
                </div>
                <button onClick={() => setActiveTab("premium")} className="text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-full transition-colors ml-2">
                  {t("talent.upgradeToPremium")}
                </button>
              </div>
            )}



            {/* Desktop Language Switcher (Drapeau + flèche uniquement) */}
            <div className="hidden md:flex items-center">
              <LanguageSwitcher variant="desktop" showLabel={false} align="right" />
            </div>

            {/* Notification Bell temps réel */}
            <NotificationBell align="right" />

            {/* Profile Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileMenuOpen(!profileMenuOpen)
                }
                }
                className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors"
              >
                <div className="w-9 h-9 rounded-full overflow-hidden relative border border-slate-200 bg-slate-100">
                  <img
                    src={userAvatar || "/assets/avatar_africain.jpg"}
                    alt="Avatar"
                    width={36}
                    height={36}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/assets/avatar_africain.jpg";
                    }}
                    className="object-cover w-full h-full object-center"
                  />
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-3 w-52 bg-white rounded-3xl shadow-2xl border border-slate-100 py-2 z-30 animate-fade-in">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {userName}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {user?.email || "candidat@email.com"}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab("profil");
                      setProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 font-medium flex items-center gap-2"
                  >
                    <FileText size={14} /> {t("nav.myProfile")}
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("parametres");
                      setProfileMenuOpen(false);
                    }}
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

        {/* ── DYNAMIC CONTENT BY TAB ── */}
        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* TAB: DASHBOARD (HOME) */}
          {activeTab === "dashboard" && (
            <>
              {/* Row 1 – Profile & certification */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile completion */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden">
                  {/* Confetti celebration overlay */}
                  {showConfetti && (
                    <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 via-emerald-300/10 to-teal-400/10 animate-pulse" />
                      {[...Array(20)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-2 h-2 rounded-full animate-bounce"
                          style={{
                            backgroundColor: ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"][i % 6],
                            left: `${(i * 5.2 + 2) % 95}%`,
                            top: `${(i * 7.3 + 5) % 80}%`,
                            animationDelay: `${(i * 0.12)}s`,
                            animationDuration: `${0.5 + (i % 3) * 0.2}s`,
                          }}
                        />
                      ))}
                      <div className="relative z-20 text-center bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-xl border border-green-200">
                        <div className="text-2xl mb-1">🎉</div>
                        <p className="text-sm font-bold text-green-700">Profil complété à 100% !</p>
                        <p className="text-xs text-green-600">Certification 5 étoiles décrochée !</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-slate-800 text-sm">
                      {t("talent.profileCompletion")}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        profilePct === 100 ? "text-green-700 bg-green-50" :
                        profilePct === 0 ? "text-red-600 bg-red-50" :
                        "text-blue-600 bg-blue-50"
                      }`}>
                        {t("talent.pctCompleted", { pct: profilePct })}
                      </span>
                      <button
                        onClick={() => setProfileGuideOpen(!profileGuideOpen)}
                        className="text-xs text-slate-400 hover:text-blue-600 underline transition-colors"
                      >
                        {t("talent.guide")}
                      </button>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        profilePct === 100
                          ? "bg-gradient-to-r from-green-400 to-emerald-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                          : profilePct === 0
                          ? "bg-red-500"
                          : "bg-blue-600"
                      }`}
                      style={{ width: `${profilePct}%` }}
                    />
                  </div>
                  <p className={`text-xs ${
                    profilePct === 100 ? "text-green-600 font-medium" :
                    profilePct === 0 ? "text-red-400" :
                    "text-slate-400"
                  }`}>
                    {profilePct === 100
                      ? t("talent.congrats100")
                      : profilePct === 0
                      ? t("talent.zeroPctMsg")
                      : t("talent.completeStepsMsg")}
                  </p>
                  {/* Profile completion guide */}
                  {profileGuideOpen && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 animate-fade-in">
                      {[
                        { label: t("talent.stepPersonalInfo"), done: hasPersonalInfo, pct: 25, tab: "profil" },
                        { label: t("talent.stepProfilePhoto"), done: !!userAvatar && userAvatar !== "/assets/avatar_africain.jpg", pct: 10, tab: "profil" },
                        { label: t("talent.stepCvUploaded"), done: cvFileName !== "Aucun CV ajouté" && cvFileName !== "Pas de CV", pct: 25, tab: "profil" },
                        { label: t("talent.stepVideoValidated"), done: hasValidVideo, pct: 40, tab: "video" },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`w-4 h-4 flex-shrink-0 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${item.done ? "bg-green-500" : "bg-slate-200"}`}>
                              {item.done ? "✓" : ""}
                            </span>
                            <span className={`text-xs ${item.done ? "text-slate-400 line-through" : "text-slate-700 font-medium"}`}>{item.label}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {!item.done && (
                              <button
                                onClick={() => setActiveTab(item.tab as TalentTab)}
                                className="text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-full transition-colors whitespace-nowrap"
                              >
                                {t("talent.completeStepBtn")}
                              </button>
                            )}
                            <span className={`text-xs font-bold ${item.done ? "text-green-600" : "text-blue-600"}`}>+{item.pct}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Certification level */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
                  <h3 className="font-bold text-slate-800 text-sm mb-2">
                    {t("talent.certificationLevel")}
                  </h3>
                  <div className="flex gap-1.5 my-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span
                        key={s}
                        className={`text-2xl transition-all ${s <= stars ? "text-amber-400 scale-105" : "text-slate-200"
                          }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-xs font-semibold text-slate-500">
                    {t("talent.starsObtained", { stars })} {hasValidVideo ? t("talent.badgeAiVideo") : ""}
                  </p>
                </div>
              </div>

              {/* Row 2 – CV, Vidéo, Affiliation */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* CV Card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2">
                      {t("talent.cvTitle")}
                      {!isPremium && <Lock size={14} className="text-amber-500" />}
                    </h3>
                    <div className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-xs text-slate-600 bg-slate-50 mb-2 truncate flex items-center justify-between">
                      <span className="truncate font-medium">
                        {cvFileName === "Aucun CV ajouté" ? t("talent.noCvAdded") : cvFileName}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mb-5">
                      {cvUploadedAt === "Pas de CV" ? t("talent.noCv") : cvUploadedAt === "Mis à jour à l'instant" ? t("talent.updatedJustNow") : cvUploadedAt === "Mis à jour récemment" ? t("talent.updatedRecently") : cvUploadedAt}
                    </p>
                  </div>
                  
                  {isPremium ? (
                    <button
                      onClick={() => setActiveTab("profil")}
                      className="w-full py-3 rounded-2xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                      id="btn-upload-cv"
                    >
                      <Upload size={15} /> {t("talent.updateCv")}
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveTab("premium")}
                      className="w-full py-3 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2"
                    >
                      <Lock size={15} /> {t("talent.unlockWithPremium")}
                    </button>
                  )}
                </div>

                {/* Entretien Vidéo Card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        {t("talent.videoInterview")}
                        {!isPremium && <Lock size={14} className="text-amber-500" />}
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full text-white ${hasValidVideo ? "bg-green-500" : "bg-red-500"
                          }`}
                      >
                        {hasValidVideo ? t("talent.validated") : t("talent.notValidated")}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                      {hasValidVideo
                        ? t("talent.videoPassedDesc")
                        : t("talent.videoNotPassedDesc")}
                    </p>
                  </div>
                  {isPremium ? (
                    <button
                      onClick={() => setActiveTab("video")}
                      className="w-full py-3 rounded-2xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                      id="btn-launch-video"
                    >
                      <Video size={15} />{" "}
                      {hasValidVideo ? t("talent.viewVideo") : t("talent.startVideo")}
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowVideoPremiumModal(true)}
                      className="w-full py-3 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2"
                    >
                      <Lock size={15} /> {t("talent.unlockAiInterview")}
                    </button>
                  )}
                </div>

                {/* Affiliation Card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm mb-2">
                      {t("talent.affiliation")}
                    </h3>
                    <p className="text-xs text-slate-500 mb-1 leading-relaxed">
                      {t("talent.sponsoredCount", { count: affiliationCount })}
                    </p>
                    <p className="text-[11px] font-bold text-green-600 mb-5">
                      {t("talent.availableEarnings", { amount: affiliationBalance.toLocaleString(lang === "en" ? "en-US" : "fr-FR") })}
                    </p>
                  </div>
                  <button
                    onClick={() => setAffiliationModalOpen(true)}
                    className="w-full py-3 rounded-2xl font-bold text-xs text-white bg-[#0071a2] hover:bg-[#005f88] shadow-lg shadow-blue-900/15 transition-all flex items-center justify-center gap-2"
                    id="btn-affiliation"
                  >
                    <Share2 size={15} /> {t("talent.viewDetails")}
                  </button>
                </div>
              </div>

              {/* Row 3 – Emplois Disponibles */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800 text-sm">
                    {t("talent.recommendedJobs")}
                  </h3>
                  <span className="text-xs font-bold text-slate-400">
                    {t("talent.activeJobsCount", { count: allJobs.length })}
                  </span>
                </div>
                <div className="space-y-3 mb-5">
                  {allJobs.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                      <Briefcase size={24} className="mx-auto text-slate-300 mb-2" />
                      {t("talent.noRecommendedJobs")}
                    </div>
                  ) : (
                    allJobs.slice(0, 3).map((job) => {
                      const isApplied = appliedJobs.includes(job.id);
                      return (
                        <div
                          key={job.id}
                          className="p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{job.title}</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {job.company} — {job.location} •{" "}
                              <span className="text-blue-600 font-semibold">
                                {job.salary}
                              </span>
                            </p>
                          </div>
                          <button
                            onClick={() => handleApplyJob(job.id, job.title)}
                            disabled={isApplied}
                            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${isApplied
                              ? "bg-green-100 text-green-700 cursor-default"
                              : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                              }`}
                          >
                            {isApplied ? t("talent.applied") : t("talent.apply")}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
                <button
                  onClick={() => setActiveTab("emplois")}
                  className="w-full py-3.5 rounded-2xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                  id="btn-voir-emplois"
                >
                  <Briefcase size={16} /> {t("talent.viewAllJobs")}
                </button>
              </div>

              {/* Row 4 – Quick actions matching Figma */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm mb-1">
                      {t("talent.createCv")}
                    </h3>
                    <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                      {t("talent.createCvDesc")}
                    </p>
                  </div>
                  <a
                    href="https://www.moncvparfait.fr/"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 rounded-2xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all flex items-center justify-center gap-2 text-center"
                    id="btn-creer-cv"
                  >
                    <FileText size={15} /> {t("talent.startBtn")}
                  </a>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm mb-1">
                      {t("talent.settingsCard")}
                    </h3>
                    <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                      {t("talent.settingsCardDesc")}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("parametres")}
                    className="w-full py-3 rounded-2xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all flex items-center justify-center gap-2"
                    id="btn-parametres-talent"
                  >
                    <Settings size={15} /> {t("talent.accessBtn")}
                  </button>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm mb-1">
                      {t("talent.joinCommunity")}
                    </h3>
                    <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                      {t("talent.joinCommunityDesc")}
                    </p>
                  </div>
                  <a
                    href="https://chat.whatsapp.com/HxYOiCDSjOI7L1Wj6Fedd9"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 rounded-2xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all flex items-center justify-center gap-2 text-center"
                    id="btn-rejoindre-whatsapp"
                  >
                    <MessageCircle size={15} /> {t("talent.joinWhatsapp")}
                  </a>
                </div>
              </div>
            </>
          )}

          {/* TAB: MON PROFIL */}
          {activeTab === "profil" && <ProfilTalent />}

          {/* TAB: ENTRETIEN VIDÉO – redirects to ProfilTalent video tab */}
          {activeTab === "video" && <ProfilTalent initialTab="video" />}

          {/* TAB: MES TRANSACTIONS */}
          {activeTab === "transactions" && <TransactionsTab />}

          {/* TAB: OFFRES D'EMPLOI */}
          {activeTab === "emplois" && (
            <OffresEmplois 
              isPremium={isPremium} 
              applicationsCount={applicationsCount} 
              onLimitReached={() => setUpgradeModalOpen(true)}
              onApplySuccess={() => setApplicationsCount(prev => prev + 1)}
            />
          )}

          {/* TAB: FAVORIS */}
          {activeTab === "favoris" && (
            <FavorisTalentTab onNavigateToJobs={() => setActiveTab("emplois")} />
          )}

          {/* TAB: PREMIUM */}
          {activeTab === "premium" && <TalentPremium isPremium={isPremium} />}

          {/* TAB: AFFILIATION */}
          {activeTab === "affiliation" && (
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {t("affiliation.title")}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {t("affiliation.subtitle")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                    {t("affiliation.balance", { amount: affiliationBalance.toLocaleString(lang === "en" ? "en-US" : "fr-FR") })}
                  </span>
                  <button
                    onClick={() => { setAffiliationCount(0); setAffiliationBalance(0); showToast("Compteur remis à zéro."); }}
                    className="text-xs text-slate-400 hover:text-red-500 border border-slate-200 hover:border-red-200 px-3 py-1 rounded-full transition-colors"
                  >
                    {t("affiliation.reset")}
                  </button>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                <div>
                  <h3 className="font-extrabold text-lg mb-1">
                    {t("affiliation.uniqueLink")}
                  </h3>
                  <p className="text-xs text-blue-100">
                    {t("affiliation.linkDesc")}
                  </p>
                </div>
                <button
                  onClick={handleCopyAffiliation}
                  className="px-6 py-3 rounded-full font-bold text-xs bg-white text-blue-700 hover:bg-blue-50 transition-all shadow-lg flex items-center gap-2"
                >
                  {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                  {copiedLink ? t("affiliation.linkCopied") : t("affiliation.copyLink")}
                </button>
              </div>

              {/* Referral list */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-3">{t("affiliation.myReferrals", { count: affiliationCount })}</h4>
                <div className="space-y-2">
                  {affiliations.slice(0, affiliationCount).map((f) => (
                    <div key={f.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{f.name}</p>
                        <p className="text-xs text-slate-400">{f.date}</p>
                      </div>
                      <span className="text-xs font-bold text-green-600">+{f.gain.toLocaleString(lang === "en" ? "en-US" : "fr-FR")} FCFA</span>
                    </div>
                  ))}
                  {affiliationCount === 0 && (
                    <p className="text-xs text-slate-400 text-center py-4">{t("affiliation.noReferrals")}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-xs text-slate-400">{t("affiliation.registeredReferrals")}</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{affiliationCount}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-xs text-slate-400">{t("affiliation.totalGains")}</p>
                  <p className="text-2xl font-black text-green-600 mt-1">{affiliationBalance.toLocaleString(lang === "en" ? "en-US" : "fr-FR")} FCFA</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">{t("affiliation.availableWithdrawal")}</p>
                    <p className="text-sm font-bold text-slate-800 mt-1">Mobile Money</p>
                  </div>
                  <button
                    onClick={() => setWithdrawalModalOpen(true)}
                    disabled={affiliationBalance < 1000}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                  >
                    {t("affiliation.withdraw")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PARAMETRES */}
          {activeTab === "parametres" && <ParametresTab />}
        </main>
      </div>

      {/* ── MODAL: SIMULATION TEST VIDEO IA ── */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 text-center relative">
            <button
              onClick={() => setVideoModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>

            {videoStep === "intro" && (
              <div className="py-4 space-y-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                  <Video size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Entretien Vidéo Automatisé par IA
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                  Question 1/3 :{" "}
                  <strong>
                    « Présentez brièvement vos compétences clés et votre valeur ajoutée pour un employeur. »
                  </strong>
                </p>
                <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-500 text-left space-y-1">
                  <p>• Durée d'enregistrement : 60 secondes max</p>
                  <p>• Essais disponibles : 3</p>
                  <p>• Scoring automatique sur la clarté et l'élocution</p>
                </div>
                <button
                  onClick={() => setVideoStep("recording")}
                  className="btn-primary w-full justify-center py-3 text-xs"
                >
                  Démarrer l'enregistrement
                </button>
              </div>
            )}

            {videoStep === "recording" && (
              <div className="py-6 space-y-4">
                <div className="w-24 h-24 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto animate-pulse">
                  <Camera size={36} />
                </div>
                <div className="flex items-center justify-center gap-2 text-red-600 text-xs font-bold">
                  <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping"></span>
                  Enregistrement en cours (00:42 / 01:00)
                </div>
                <p className="text-xs text-slate-500">
                  Parlez clairement face à votre caméra.
                </p>
                <button
                  onClick={handleCompleteVideoInterview}
                  className="btn-primary w-full justify-center py-3 text-xs bg-green-600 hover:bg-green-700"
                >
                  Valider et terminer l'enregistrement
                </button>
              </div>
            )}

            {videoStep === "done" && (
              <div className="py-8 space-y-3">
                <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                  <CheckCircle size={32} />
                </div>
                <h4 className="text-lg font-bold text-slate-900">
                  Analyse IA terminée avec succès !
                </h4>
                <p className="text-xs text-slate-500">
                  Votre badge et vos 5 étoiles ont été attribués.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL: AFFILIATION DETAILS ── */}
      {affiliationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 text-center relative">
            <button
              onClick={() => setAffiliationModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>
            <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <Share2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Détails de vos parrainages
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              4 personnes se sont inscrites via votre recommandation.
            </p>

            <div className="space-y-2 text-left mb-6 text-xs divide-y divide-slate-100">
              <div className="pt-2 flex justify-between">
                <span>Marc A. (Talent)</span>
                <span className="font-bold text-green-600">+1 500 FCFA</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span>Sophie D. (Talent)</span>
                <span className="font-bold text-green-600">+1 500 FCFA</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span>Alain K. (Talent)</span>
                <span className="font-bold text-green-600">+1 500 FCFA</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span>Fatou M. (Talent)</span>
                <span className="font-bold text-green-600">+1 500 FCFA</span>
              </div>
            </div>

            <button
              onClick={handleCopyAffiliation}
              className="btn-primary w-full justify-center py-3 text-xs mb-2"
            >
              Copier mon lien de parrainage
            </button>
          </div>
        </div>
      )}
      {/* ── MODAL: UPGRADE TO PREMIUM ── */}
      {upgradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative overflow-hidden animate-scale-up">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600" />
            <button
              onClick={() => setUpgradeModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={24} />
            </button>
            <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mb-6 text-amber-500">
              <Star size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">{t("talent.upgradeModal.title")}</h2>
            <p className="text-slate-600 mb-6 leading-relaxed">
              {t("talent.upgradeModal.desc")}
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setUpgradeModalOpen(false);
                  setActiveTab("premium");
                }}
                className="w-full py-3.5 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-[1.02]"
              >
                {t("talent.upgradeModal.discoverOffers")}
              </button>
              <button
                onClick={() => setUpgradeModalOpen(false)}
                className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
              >
                {t("talent.upgradeModal.later")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: RETRAIT ── */}
      {withdrawalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 relative animate-scale-up">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{t("talent.withdrawalModal.title")}</h3>
                <p className="text-sm text-slate-500">{t("talent.withdrawalModal.balance")} <span className="font-bold text-green-600">{affiliationBalance.toLocaleString()} FCFA</span></p>
              </div>
              <button onClick={() => setWithdrawalModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleWithdrawalRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t("talent.withdrawalModal.operator")}</label>
                <div className="relative">
                  <select
                    value={withdrawMethod}
                    onChange={(e) => setWithdrawMethod(e.target.value)}
                    className="w-full appearance-none px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none focus:border-[#32A8D7] focus:bg-white"
                  >
                    <option>MTN MoMo</option>
                    <option>Moov Money</option>
                    <option>Wave</option>
                    <option>Orange Money</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t("talent.withdrawalModal.phone")}</label>
                <input
                  type="tel"
                  required
                  value={withdrawPhone}
                  onChange={(e) => setWithdrawPhone(e.target.value)}
                  placeholder="+229 90 00 00 00"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none focus:border-[#32A8D7] focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t("talent.withdrawalModal.amount")}</label>
                <input
                  type="number"
                  required
                  min={500}
                  max={affiliationBalance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Ex: 5000"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none focus:border-[#32A8D7] focus:bg-white"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setWithdrawalModalOpen(false)} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50">
                  {t("talent.withdrawalModal.cancel")}
                </button>
                <button type="submit" className="flex-1 py-3 bg-[#32A8D7] text-white rounded-xl font-semibold hover:bg-[#2896c2]">
                  {t("talent.withdrawalModal.withdraw")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showVideoPremiumModal && (
        <PremiumRequiredModal
          onClose={() => setShowVideoPremiumModal(false)}
          title={lang === "en" ? "AI Video Interview reserved for Premium" : "Entretien Vidéo IA réservé au Premium"}
          message={lang === "en" ? "AI-certified video interview and skills badges are reserved for Premium members. Subscribe for only 700 FCFA/month with no commitment." : "L'entretien vidéo certifié par l'IA et l'obtention des badges de compétences sont réservés aux talents membres Premium. Souscrivez pour seulement 700 FCFA/mois sans engagement."}
          onUpgrade={() => setActiveTab("premium")}
        />
      )}

    </div>
  );
}
