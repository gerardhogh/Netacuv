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
} from "lucide-react";

import OffresEmplois from "./components/OffresEmplois";
import TalentPremium from "./components/TalentPremium";
import ProfilTalent from "./components/ProfilTalent";
import TransactionsTab from "./components/TransactionsTab";
import ParametresTab from "./components/ParametresTab";
import PremiumBanner from "../../components/PremiumBanner";

type TalentTab =
  | "dashboard"
  | "profil"
  | "transactions"
  | "video"
  | "emplois"
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

  // Profile editable state
  const [userName, setUserName] = useState(user?.name || "Candidat");
  const [userAvatar, setUserAvatar] = useState(user?.avatar || "/assets/avatar_africain.jpg");
  
  // Premium & Quota
  const [isPremium, setIsPremium] = useState(false);
  const [applicationsCount, setApplicationsCount] = useState(0);

  const isFirstRender = useRef(true);

  // Sync activeTab with URL Hash for persistence on reload
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && ["dashboard", "profil", "transactions", "video", "emplois", "premium", "affiliation", "parametres"].includes(hash)) {
      setActiveTab(hash as TalentTab);
    }
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
          
          let hasVid = false;
          if (data.talentProfile?.videoUrl) {
            hasVid = true;
          } else {
            // Fallback to checking localStorage since videos are saved in IndexedDB currently
            // Tie it to the current user ID to prevent showing old cache for new accounts
            const isRecorded = typeof window !== "undefined" && user?.id && localStorage.getItem(`interview_recorded_${user.id}`) === "true";
            hasVid = isRecorded || false;
          }
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
    return () => window.removeEventListener("dashboardProfileUpdated", handleUpdate);
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
      showToast("L'upload de CV est réservé aux talents Premium.");
      e.target.value = '';
      return;
    }
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCvFileName(file.name);
      setCvUploadedAt("Mis à jour à l'instant");
      showToast(`CV "${file.name}" importé et analysé avec succès !`);
    }
  };

  const handleApplyJob = (jobId: string, title: string) => {
    if (appliedJobs.includes(jobId)) return;
    setAppliedJobs([...appliedJobs, jobId]);
    showToast(`Candidature envoyée pour le poste "${title}" !`);
  };

  const handleCompleteVideoInterview = () => {
    setVideoStep("done");
    setHasValidVideo(true);
    showToast("Félicitations ! Entretien vidéo validé avec succès");
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
    showToast("Lien de parrainage copié dans le presse-papier !");
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const sidebarItems = [
    { key: "dashboard" as TalentTab, icon: Home, label: "Tableau de bord" },
    { key: "profil" as TalentTab, icon: FileText, label: "Mon profil" },
    { key: "transactions" as TalentTab, icon: History, label: "Mes transactions" },
    { key: "video" as TalentTab, icon: Video, label: "Entretien vidéo" },
    { key: "emplois" as TalentTab, icon: Briefcase, label: "Offres d'emploi" },
    { key: "premium" as TalentTab, icon: Star, label: "Talents Premium" },
    { key: "affiliation" as TalentTab, icon: Share2, label: "Affiliation" },
    { key: "parametres" as TalentTab, icon: Settings, label: "Paramètres" },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex min-h-screen bg-[#f1f5f9] text-slate-800">
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

            <div className="mt-2 pt-2 border-t border-slate-100 px-4">
              <LanguageSwitcher />
            </div>
          </nav>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <PremiumBanner isPremium={isPremium} />
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
                Bienvenue,{" "}
                <span className="font-extrabold text-slate-900">
                  {userName.split(" ")[0]}
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">
                Espace Candidat Certifié Netacuv
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Quota Indicator */}
            {isPremium ? (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-full border border-yellow-500/30 text-yellow-600 shadow-inner">
                <Star size={14} className="fill-yellow-500 text-yellow-500" />
                <span className="text-xs font-bold">Premium - Illimité</span>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-medium leading-none mb-0.5">Candidatures ce mois</span>
                  <span className="text-xs font-bold text-slate-800 leading-none">{applicationsCount} / 1</span>
                </div>
                <button onClick={() => setActiveTab("premium")} className="text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-full transition-colors ml-2">
                  Passer au Premium
                </button>
              </div>
            )}



            {/* Notification Bell with interactive dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotifMenuOpen(!notifMenuOpen);
                  setProfileMenuOpen(false);
                }}
                className="relative text-slate-500 hover:text-slate-800 p-2.5 rounded-full hover:bg-slate-100 transition-colors"
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
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 py-3 z-30 animate-fade-in">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-800">
                      Notifications ({unreadCount})
                    </p>
                    <button
                      onClick={() =>
                        setNotifications(notifications.map((n) => ({ ...n, read: true })))
                      }
                      className="text-[10px] text-blue-600 hover:underline font-semibold"
                    >
                      Tout marquer comme lu
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                    {notifications.length === 0 ? (
                      <div className="p-5 text-center text-slate-400 text-xs">
                        <Bell size={24} className="mx-auto text-slate-300 mb-2" />
                        Aucune notification pour le moment
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3 text-xs hover:bg-slate-50 transition-colors ${!notif.read ? "bg-blue-50/40" : ""
                            }`}
                        >
                          <p className="text-slate-800 font-medium leading-snug">
                            {notif.text}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {notif.time}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileMenuOpen(!profileMenuOpen)
                }
                }
                className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors"
              >
                <div className="w-9 h-9 rounded-full overflow-hidden relative border border-slate-200">
                  <Image
                    src={userAvatar}
                    alt="Avatar"
                    width={36}
                    height={36}
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
                    <FileText size={14} /> Mon Profil
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("parametres");
                      setProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 font-medium flex items-center gap-2"
                  >
                    <Settings size={14} /> Paramètres
                  </button>
                  <LogoutButton
                    onCancelClick={() => setProfileMenuOpen(false)}
                    className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-semibold border-t border-slate-100 mt-1 flex items-center gap-2"
                  >
                    <LogOut size={14} /> Déconnexion
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
                      Complétion du profil
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        profilePct === 100 ? "text-green-700 bg-green-50" :
                        profilePct === 0 ? "text-red-600 bg-red-50" :
                        "text-blue-600 bg-blue-50"
                      }`}>
                        {profilePct}% complété
                      </span>
                      <button
                        onClick={() => setProfileGuideOpen(!profileGuideOpen)}
                        className="text-xs text-slate-400 hover:text-blue-600 underline transition-colors"
                      >
                        Guide
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
                      ? "🌟 Félicitations ! Profil 100% — Certification 5 étoiles obtenue !"
                      : profilePct === 0
                      ? "Aucune étape complétée. Commencez par renseigner vos informations."
                      : "Complétez les étapes ci-dessous pour atteindre 100% et décrocher la certification 5 étoiles !"}
                  </p>
                  {/* Profile completion guide */}
                  {profileGuideOpen && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 animate-fade-in">
                      {[
                        { label: "Informations personnelles", done: hasPersonalInfo, pct: 25, tab: "profil" },
                        { label: "Photo de profil", done: !!userAvatar && userAvatar !== "/assets/avatar_africain.jpg", pct: 10, tab: "profil" },
                        { label: "CV uploadé", done: cvFileName !== "Aucun CV ajouté" && cvFileName !== "Pas de CV", pct: 25, tab: "profil" },
                        { label: "Entretien vidéo validé", done: hasValidVideo, pct: 40, tab: "video" },
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
                                Compléter →
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
                    Niveau de certification
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
                    {stars} étoiles obtenues {hasValidVideo ? "• Badge Vidéo IA" : ""}
                  </p>
                </div>
              </div>

              {/* Row 2 – CV, Vidéo, Affiliation */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* CV Card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm mb-2">
                      CV (Curriculum Vitae)
                    </h3>
                    <div className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-xs text-slate-600 bg-slate-50 mb-2 truncate flex items-center justify-between">
                      <span className="truncate font-medium">{cvFileName}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mb-5">{cvUploadedAt}</p>
                  </div>
                  <button
                    onClick={() => setActiveTab("profil")}
                    className="w-full py-3 rounded-2xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                    id="btn-upload-cv"
                  >
                    <Upload size={15} /> Mettre à jour mon CV
                  </button>
                </div>

                {/* Entretien Vidéo Card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-slate-800 text-sm">
                        Entretien vidéo
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full text-white ${hasValidVideo ? "bg-green-500" : "bg-red-500"
                          }`}
                      >
                        {hasValidVideo ? "Validé" : "Non validé"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                      {hasValidVideo
                        ? "Votre test vidéo a été évalué avec succès par l'IA."
                        : "Tu n'as pas encore passé l'entretien vidéo"}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("video")}
                    className="w-full py-3 rounded-2xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                    id="btn-launch-video"
                  >
                    <Video size={15} />{" "}
                    {hasValidVideo ? "Voir l'entretien vidéo" : "Lancer l'entretien vidéo"}
                  </button>
                </div>

                {/* Affiliation Card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm mb-2">
                      Affiliation
                    </h3>
                    <p className="text-xs text-slate-500 mb-1 leading-relaxed">
                      Tu as parrainé{" "}
                      <strong className="text-slate-900 font-bold">{affiliationCount} personnes</strong> au
                      total
                    </p>
                    <p className="text-[11px] font-bold text-green-600 mb-5">
                      Gains disponibles : {affiliationBalance.toLocaleString("fr-FR")} FCFA
                    </p>
                  </div>
                  <button
                    onClick={() => setAffiliationModalOpen(true)}
                    className="w-full py-3 rounded-2xl font-bold text-xs text-white bg-[#0071a2] hover:bg-[#005f88] shadow-lg shadow-blue-900/15 transition-all flex items-center justify-center gap-2"
                    id="btn-affiliation"
                  >
                    <Share2 size={15} /> Voir les détails
                  </button>
                </div>
              </div>

              {/* Row 3 – Emplois Disponibles */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800 text-sm">
                    Emplois disponibles recommandés
                  </h3>
                  <span className="text-xs font-bold text-slate-400">
                    {allJobs.length} offres actives
                  </span>
                </div>
                <div className="space-y-3 mb-5">
                  {allJobs.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                      <Briefcase size={24} className="mx-auto text-slate-300 mb-2" />
                      Aucune offre recommandée pour le moment
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
                            {isApplied ? "✓ Postulé" : "Postuler"}
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
                  <Briefcase size={16} /> Voir toutes les offres d'emplois
                </button>
              </div>

              {/* Row 4 – Quick actions matching Figma */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm mb-1">
                      Créer un CV
                    </h3>
                    <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                      Utilise un outil de création de CV professionnel
                    </p>
                  </div>
                  <a
                    href="https://www.moncvparfait.fr/"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 rounded-2xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all flex items-center justify-center gap-2 text-center"
                    id="btn-creer-cv"
                  >
                    <FileText size={15} /> Commencer
                  </a>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm mb-1">
                      Paramètres
                    </h3>
                    <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                      Gère tes préférences et ton compte personnel
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("parametres")}
                    className="w-full py-3 rounded-2xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all flex items-center justify-center gap-2"
                    id="btn-parametres-talent"
                  >
                    <Settings size={15} /> Accéder
                  </button>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm mb-1">
                      Rejoindre la communauté
                    </h3>
                    <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                      Échange avec d'autres talents sur notre groupe WhatsApp exclusif
                    </p>
                  </div>
                  <a
                    href="https://chat.whatsapp.com/HxYOiCDSjOI7L1Wj6Fedd9"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 rounded-2xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all flex items-center justify-center gap-2 text-center"
                    id="btn-rejoindre-whatsapp"
                  >
                    <MessageCircle size={15} /> Rejoindre sur WhatsApp
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

          {/* TAB: PREMIUM */}
          {activeTab === "premium" && <TalentPremium isPremium={isPremium} />}

          {/* TAB: AFFILIATION */}
          {activeTab === "affiliation" && (
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Programme d'Affiliation
                  </h2>
                  <p className="text-xs text-slate-400">
                    Parrainez d'autres talents et gagnez des récompenses en espèces
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                    Solde : {affiliationBalance.toLocaleString("fr-FR")} FCFA
                  </span>
                  <button
                    onClick={() => { setAffiliationCount(0); setAffiliationBalance(0); showToast("Compteur remis à zéro."); }}
                    className="text-xs text-slate-400 hover:text-red-500 border border-slate-200 hover:border-red-200 px-3 py-1 rounded-full transition-colors"
                  >
                    Réinitialiser
                  </button>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                <div>
                  <h3 className="font-extrabold text-lg mb-1">
                    Votre lien de parrainage unique
                  </h3>
                  <p className="text-xs text-blue-100">
                    Chaque inscription réussie vous rapporte 1 500 FCFA directement.
                  </p>
                </div>
                <button
                  onClick={handleCopyAffiliation}
                  className="px-6 py-3 rounded-full font-bold text-xs bg-white text-blue-700 hover:bg-blue-50 transition-all shadow-lg flex items-center gap-2"
                >
                  {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                  {copiedLink ? "Lien copié !" : "Copier mon lien"}
                </button>
              </div>

              {/* Referral list */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-3">Mes filleuls ({affiliationCount})</h4>
                <div className="space-y-2">
                  {affiliations.slice(0, affiliationCount).map((f) => (
                    <div key={f.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{f.name}</p>
                        <p className="text-xs text-slate-400">{f.date}</p>
                      </div>
                      <span className="text-xs font-bold text-green-600">+{f.gain.toLocaleString("fr-FR")} FCFA</span>
                    </div>
                  ))}
                  {affiliationCount === 0 && (
                    <p className="text-xs text-slate-400 text-center py-4">Aucun filleul pour le moment.</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-xs text-slate-400">Filleuls inscrits</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{affiliationCount}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-xs text-slate-400">Gains totaux générés</p>
                  <p className="text-2xl font-black text-green-600 mt-1">{affiliationBalance.toLocaleString("fr-FR")} FCFA</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Retrait disponible</p>
                    <p className="text-sm font-bold text-slate-800 mt-1">Mobile Money</p>
                  </div>
                  <button
                    onClick={() => setWithdrawalModalOpen(true)}
                    disabled={affiliationBalance < 1000}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                  >
                    Retirer
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
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Passez en Premium</h2>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Vous avez atteint votre limite de 1 candidature gratuite par mois.
              Passez à la version Premium pour postuler de manière illimitée et débloquer toutes les fonctionnalités avancées.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setUpgradeModalOpen(false);
                  setActiveTab("premium");
                }}
                className="w-full py-3.5 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-[1.02]"
              >
                Découvrir les offres Premium
              </button>
              <button
                onClick={() => setUpgradeModalOpen(false)}
                className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
              >
                Plus tard
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
                <h3 className="text-xl font-bold text-slate-900">Demande de retrait</h3>
                <p className="text-sm text-slate-500">Solde : <span className="font-bold text-green-600">{affiliationBalance.toLocaleString()} FCFA</span></p>
              </div>
              <button onClick={() => setWithdrawalModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleWithdrawalRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Opérateur Mobile Money</label>
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
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Numéro de téléphone</label>
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
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Montant à retirer (FCFA)</label>
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
                  Annuler
                </button>
                <button type="submit" className="flex-1 py-3 bg-[#32A8D7] text-white rounded-xl font-semibold hover:bg-[#2896c2]">
                  Retirer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
