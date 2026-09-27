"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import LogoutButton from "@/app/components/LogoutButton";
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
  Users,
  Search,
  X,
  CheckCircle,
  LayoutDashboard,
  BadgeCheck,
  Mail,
  Download,
  Eye,
  Video,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";


// ─── API Data Fetching ────────────────────────────────────────────────────────
interface TalentProfile {
  id: string;
  name: string;
  username: string;
  profession: string;
  firstName: string;
  lastName: string;
  sex: string;
  opportunites: string;
  pays: string;
  ville: string;
  phone: string;
  email: string;
  bio: string;
  competences: string;
  isActive: boolean;
  isVerified: boolean;
  imageUrl: string;
  cvUpdated: string;
  cvUrl?: string;
  videoUrl?: string;
  interviewSession?: {
    id: string;
    status: string;
    videoRecordings?: string;
    aiScore?: number;
    aiFeedback?: string;
  } | null;
  socials: {
    facebook?: string;
    linkedin?: string;
    twitter?: string;
    pinterest?: string;
    behance?: string;
  };
}

// Helper to map DB response to TalentProfile
function mapToTalentProfile(dbData: any): TalentProfile {
  return {
    id: dbData.id.toString(),
    name: dbData.name,
    username: dbData.username || dbData.email?.split("@")[0] || "",
    profession: dbData.profession,
    firstName: dbData.name?.split(" ")[0] || "",
    lastName: dbData.name?.split(" ").slice(1).join(" ") || "",
    sex: dbData.gender,
    opportunites: "Emploi",
    pays: dbData.country || "Non précisé",
    ville: dbData.city || "Non précisé",
    phone: dbData.contact,
    email: dbData.email,
    bio: dbData.bio,
    competences: Array.isArray(dbData.skills) ? dbData.skills.join(", ") : (dbData.skills || ""),
    isActive: true, // Assuming active if listed
    isVerified: dbData.isVerified,
    imageUrl: dbData.imageUrl || "/assets/candidate-alicia-parker.jpg",
    cvUpdated: dbData.updatedAt || "Récemment",
    cvUrl: dbData.cvUrl,
    videoUrl: dbData.videoUrl,
    interviewSession: dbData.interviewSession,
    socials: {
      facebook: dbData.socials?.facebook || "",
      linkedin: dbData.socials?.linkedin || "",
      twitter: dbData.socials?.twitter || "",
      pinterest: dbData.socials?.pinterest || "",
      behance: dbData.socials?.behance || "",
    },
  };
}

// ─── Sub-components ────────────────────────────────────────────────────────────
function InfoField({ label, value, blurSensitive }: { label: string; value: string; blurSensitive?: boolean }) {
  const isSensitive = blurSensitive && (label === "Numéro de téléphone" || label === "Email" || label === "Nom" || label === "Prénom");
  return (
    <div>
      <p className="text-xs text-slate-500 mb-1.5 font-medium">{label}</p>
      <div className={`px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-800 font-medium ${isSensitive ? 'blur-sm select-none' : ''}`}>
        {isSensitive ? "Masqué (Premium)" : value}
      </div>
    </div>
  );
}

function SocialLink({
  icon,
  label,
  url,
  blurSensitive,
}: {
  icon: React.ReactNode;
  label: string;
  url: string;
  blurSensitive?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 py-2">
      <div className="flex items-center gap-2.5 w-32 shrink-0">
        <span className="shrink-0">{icon}</span>
        <span className="text-sm font-semibold text-slate-700">{label} :</span>
      </div>
      {blurSensitive ? (
        <div
          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm text-[#32A8D7] font-medium truncate flex items-center justify-between group blur-sm select-none"
        >
          <span className="truncate">Lien masqué (Premium)</span>
        </div>
      ) : (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm text-[#32A8D7] hover:text-[#2896c2] hover:bg-sky-50 transition-colors font-medium truncate flex items-center justify-between group"
        >
          <span className="truncate">{url}</span>
          <ExternalLink size={13} className="shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
      )}
    </div>
  );
}

// ─── Tab: Informations ─────────────────────────────────────────────────────────
function TabInformations({ talent, blurSensitive }: { talent: TalentProfile, blurSensitive?: boolean }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoField label="Prénom" value={talent.firstName} blurSensitive={blurSensitive} />
        <InfoField label="Nom" value={talent.lastName} blurSensitive={blurSensitive} />
        <InfoField label="Titre professionnel" value={talent.profession} blurSensitive={blurSensitive} />
        <InfoField label="Nom d'utilisateur" value={talent.username} blurSensitive={blurSensitive} />
        <InfoField label="Sexe H/F" value={talent.sex} blurSensitive={blurSensitive} />
        <InfoField label="Types d'opportunités recherchées" value={talent.opportunites} blurSensitive={blurSensitive} />
        <InfoField label="Pays/Nationalité" value={talent.pays} blurSensitive={blurSensitive} />
        <InfoField label="Ville" value={talent.ville} blurSensitive={blurSensitive} />
        <InfoField label="Numéro de téléphone" value={talent.phone} blurSensitive={blurSensitive} />
        <InfoField label="Email" value={talent.email} blurSensitive={blurSensitive} />
      </div>

      <div>
        <p className="text-xs text-slate-500 mb-1.5 font-medium">Biographie</p>
        <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-700 leading-relaxed min-h-[80px]">
          {talent.bio}
        </div>
      </div>

      <div>
        <p className="text-xs text-slate-500 mb-1.5 font-medium">Compétences clés</p>
        <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex flex-wrap gap-2">
            {talent.competences.split(",").map((c) => (
              <span
                key={c.trim()}
                className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-700"
              >
                {c.trim()}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Réseaux ──────────────────────────────────────────────────────────────
function TabReseaux({ talent, blurSensitive }: { talent: TalentProfile, blurSensitive?: boolean }) {
  const socialItems = [
    {
      key: "facebook",
      label: "Facebook",
      icon: (
        <div className="w-6 h-6 rounded bg-[#1877F2] flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white fill-current">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </div>
      ),
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      icon: (
        <div className="w-6 h-6 rounded bg-[#0A66C2] flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white fill-current">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        </div>
      ),
    },
    {
      key: "twitter",
      label: "Twitter",
      icon: (
        <div className="w-6 h-6 rounded bg-black flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white fill-current">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.844L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
          </svg>
        </div>
      ),
    },
    {
      key: "pinterest",
      label: "Pinterest",
      icon: (
        <div className="w-6 h-6 rounded bg-[#E60023] flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white fill-current">
            <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
          </svg>
        </div>
      ),
    },
    {
      key: "behance",
      label: "Behance",
      icon: (
        <div className="w-6 h-6 rounded bg-[#1769FF] flex items-center justify-center">
          <span className="text-white font-bold text-[9px]">Be</span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-2">
      {socialItems.map((item) => {
        const url = talent.socials[item.key as keyof typeof talent.socials];
        return (
          <SocialLink
            key={item.key}
            icon={item.icon}
            label={item.label}
            url={url || "—"}
            blurSensitive={blurSensitive}
          />
        );
      })}
    </div>
  );
}

// ─── Tab: Vidéo Entretien ─────────────────────────────────────────────────────
function TabVideoEntretien({ talent, blurSensitive }: { talent: TalentProfile, blurSensitive?: boolean }) {
  const finalVideoUrl = talent.interviewSession?.videoRecordings || talent.videoUrl;

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-sky-100 flex items-center justify-center">
          <Video size={14} className="text-[#32A8D7]" />
        </div>
        <h3 className="text-base font-bold text-[#32A8D7]">
          Entretien vidéo de {talent.name}
        </h3>
      </div>

      {/* Info banner */}
      <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 space-y-3">
        <p className="text-sm text-slate-700 leading-relaxed">
          Ce test est constitué de 20 questions avec une variation de temps pour répondre.
          Les talents disposent de 3 tentatives. En cas d&apos;annulation, l&apos;entretien recommence depuis
          le début.
        </p>
        <p className="text-sm text-slate-700 leading-relaxed">
          Si les 3 tentatives ont étés annulées sans succès, ils devront attendre 3 jours avant de
          pouvoir réessayer.
        </p>
        <p className="text-sm font-bold text-slate-700 italic">Bon visionnage à vous !</p>
      </div>

      {/* Video player */}
      {finalVideoUrl ? (
        <div className={`relative w-full aspect-video rounded-2xl overflow-hidden shadow-xl border border-slate-200 flex flex-col ${blurSensitive ? 'bg-slate-300 pointer-events-none' : 'bg-slate-900'}`}>
          <video
            src={finalVideoUrl}
            controls={!blurSensitive}
            className={`w-full h-full object-contain ${blurSensitive ? 'blur-xl select-none' : ''}`}
          />
          {blurSensitive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 text-slate-800 font-bold">
              <span className="text-lg">Vidéo masquée (Premium)</span>
            </div>
          )}
        </div>
      ) : (
        <div className="relative w-full aspect-video rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400">
          <Video size={48} className="mb-4 opacity-50" />
          <p className="text-sm font-medium">Aucune vidéo d'entretien disponible</p>
        </div>
      )}

      {/* AI Score and Feedback (if available) */}
      {talent.interviewSession?.aiScore !== undefined && talent.interviewSession?.aiScore !== null && (
        <div className="mt-6 p-5 rounded-xl bg-indigo-50/60 border border-indigo-100">
          <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-2 mb-3">
            <CheckCircle size={18} className="text-indigo-500" />
            Évaluation de l'IA Netacuv
          </h4>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-shrink-0 w-16 h-16 rounded-full bg-white border-2 border-indigo-200 flex items-center justify-center shadow-sm">
              <span className="text-lg font-black text-indigo-600">{talent.interviewSession.aiScore}%</span>
            </div>
            <div className="text-xs text-slate-700 leading-relaxed">
              Ce score est calculé par notre intelligence artificielle en analysant la pertinence des réponses, le langage corporel, et la clarté de l'expression.
            </div>
          </div>
          {talent.interviewSession.aiFeedback && (
            <div className="bg-white rounded-lg p-4 border border-indigo-50 text-xs text-slate-700 leading-relaxed shadow-sm">
              <strong className="text-indigo-800 block mb-1">Résumé de l'analyse :</strong>
              {talent.interviewSession.aiFeedback}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sidebar items (same as recruteur page) ────────────────────────────────────
const SIDEBAR_ITEMS = [
  { key: "dashboard", icon: LayoutDashboard, label: "Accueil", href: "/dashboard/recruteur" },
  { key: "recherche", icon: Search, label: "Recherche talents", href: "/dashboard/recruteur?tab=recherche" },
  { key: "candidatures", icon: Users, label: "Candidatures", href: "/dashboard/recruteur?tab=candidatures" },
  { key: "emplois", icon: Briefcase, label: "Mes emplois", href: "/dashboard/recruteur?tab=emplois" },
  { key: "favoris", icon: Bookmark, label: "Favoris", href: "/dashboard/recruteur?tab=favoris" },
  { key: "affiliation", icon: Share2, label: "Affiliation", href: "/dashboard/recruteur?tab=affiliation" },
  { key: "parametres", icon: Settings, label: "Paramètres", href: "/dashboard/recruteur?tab=parametres" },
];

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function TalentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, logout } = useAuth();

  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [talent, setTalent] = useState<TalentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      fetch(`/api/talents/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) {
            setTalent(mapToTalentProfile(data));
          }
          setIsLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setIsLoading(false);
        });
    }
  }, [id]);

  const [activeTab, setActiveTab] = useState<"informations" | "reseaux" | "video">("informations");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const companyName = (user as any)?.company || "Grand-G Corp";
  const companyEmail = user?.email || "recruteur@grand-g.com";

  const notifications = [
    { id: 1, text: "3 nouveaux profils correspondent à votre recherche", time: "Il y a 25 min", read: false },
    { id: 2, text: "Votre annonce 'Designer UI/UX' a 8 nouvelles candidatures", time: "Il y a 3h", read: false },
  ];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const tabs = [
    { key: "informations" as const, label: "Informations" },
    { key: "reseaux" as const, label: "Réseaux" },
    { key: "video" as const, label: "Vidéo Entretien" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-sm animate-fade-in border border-slate-700">
          <CheckCircle size={18} className="text-green-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ─────────────────────────────────────────────────────────── */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 w-64 h-screen bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <Link href="/" className="block">
            <div className="relative h-7 w-28">
              <Image
                src="/Logo/PNG/Logo.png"
                alt="Netacuv Logo"
                fill
                sizes="144px"
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
          {SIDEBAR_ITEMS.map(({ key, icon: Icon, label, href }) => (
            <Link
              key={key}
              href={href}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              <Icon size={18} className="flex-shrink-0" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-100 shrink-0">
          <LogoutButton
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            <span>Déconnexion</span>
          </LogoutButton>
        </div>
      </aside>

      {/* ── MAIN ────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top header */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6">
          {/* Left */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-[#32A8D7] hover:bg-sky-50 p-2 rounded-lg transition-colors md:hidden"
              aria-label="Ouvrir le menu"
            >
              <Menu size={22} />
            </button>
            <h1 className="text-xl sm:text-2xl font-normal text-slate-800 tracking-tight">
              Recherche <span className="font-bold text-slate-900">profils</span>
            </h1>
          </div>

          {/* Right: notifications + avatar */}
          <div className="flex items-center gap-3">
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
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-800">Notifications ({unreadCount})</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                    {notifications.map((n) => (
                      <div key={n.id} className={`p-3 text-xs hover:bg-slate-50 ${!n.read ? "bg-sky-50/40" : ""}`}>
                        <p className="text-slate-800 font-medium leading-snug">{n.text}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
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
                  <Link href="/dashboard/recruteur?tab=emplois" className="block w-full text-left px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 font-medium">
                    <Briefcase size={14} className="inline mr-2" />Mes Emplois
                  </Link>
                  <Link href="/dashboard/recruteur?tab=parametres" className="block w-full text-left px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 font-medium">
                    <Settings size={14} className="inline mr-2" />Paramètres
                  </Link>
                  <LogoutButton className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-semibold border-t border-slate-100 mt-1 block">
                    <LogOut size={14} className="inline mr-2" />Déconnexion
                  </LogoutButton>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-5">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-500">
            <Link href="/dashboard/recruteur" className="hover:text-[#32A8D7] transition-colors font-medium">
              Accueil
            </Link>
            <ChevronRight size={13} className="text-slate-300" />
            <Link href="/dashboard/recruteur?tab=recherche" className="hover:text-[#32A8D7] transition-colors font-medium">
              Recherche profils
            </Link>
            <ChevronRight size={13} className="text-slate-300" />
            <span className="text-slate-800 font-semibold">Détails</span>
          </nav>

          {/* Back button (mobile friendly) */}
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#32A8D7] transition-colors self-start md:hidden"
          >
            <ArrowLeft size={16} />
            Retour
          </button>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <div className="w-10 h-10 border-4 border-[#32A8D7]/30 border-t-[#32A8D7] rounded-full animate-spin mb-4" />
              <p className="font-medium">Chargement du profil...</p>
            </div>
          ) : !talent ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <Users size={48} className="mb-4 opacity-30" />
              <p className="font-medium text-lg">Profil non trouvé</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 items-start">
              {/* ── LEFT COLUMN ──────────────────────────────────────────────── */}
              <div className="space-y-5">
                {/* Profile card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center text-center">
                  {/* Avatar */}
                  <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-slate-100 shadow-md mb-4">
                    <Image
                      src={talent.imageUrl}
                      alt={talent.name}
                      fill
                      className="object-cover object-top"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(talent.name)}&background=32A8D7&color=fff&size=256`;
                      }}
                    />
                  </div>

                <h2 className="font-bold text-slate-900 text-lg leading-tight">{talent.name}</h2>
                <p className="text-sm text-slate-500 mt-0.5 font-medium">{talent.profession}</p>

                {/* Badges */}
                <div className="flex items-center gap-2 mt-3">
                  {talent.isActive && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                      Actif
                    </span>
                  )}
                  {talent.isVerified && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-[#32A8D7] border border-sky-200 text-xs font-bold rounded-full">
                      <BadgeCheck size={12} />
                      Certifié
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="w-full mt-5 space-y-2.5">
                  <button
                    onClick={() => {
                      setIsFavorite(!isFavorite);
                      showToast(isFavorite ? "Retiré des favoris" : "Ajouté aux favoris !");
                    }}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold border transition-all flex items-center justify-center gap-2 ${
                      isFavorite
                        ? "bg-[#32A8D7] text-white border-[#32A8D7] shadow-sm"
                        : "border-slate-200 text-slate-600 hover:border-[#32A8D7] hover:text-[#32A8D7]"
                    }`}
                  >
                    <Bookmark size={15} fill={isFavorite ? "white" : "none"} />
                    {isFavorite ? "Sauvegardé" : "Sauvegarder"}
                  </button>
                  <button
                    onClick={() => showToast(`Email envoyé à ${talent.name}`)}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:border-[#32A8D7] hover:text-[#32A8D7] transition-all flex items-center justify-center gap-2"
                  >
                    <Mail size={15} />
                    Envoyer un mail
                  </button>
                </div>
              </div>

              {/* CV card */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <p className="text-xs font-semibold text-slate-500 mb-3">
                  CV actualisé le {talent.cvUpdated}
                </p>

                {/* CV preview thumbnail */}
                <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 border border-slate-200 mb-4 shadow-sm">
                  {user?.isPremium === false ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-200 blur-sm pointer-events-none">
                      <div className="text-slate-800 text-sm font-bold bg-white/50 px-3 py-1 rounded">
                        CV masqué (Premium)
                      </div>
                    </div>
                  ) : talent.cvUrl ? (
                    talent.cvUrl.endsWith('.pdf') ? (
                      <iframe src={`${talent.cvUrl}#toolbar=0&navpanes=0&scrollbar=0`} className="w-full h-full pointer-events-none" />
                    ) : (
                      <Image src={talent.cvUrl} alt="CV" fill className="object-contain" />
                    )
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                      <div className="text-slate-400 text-sm font-medium">
                        Aucun CV importé
                      </div>
                    </div>
                  )}
                </div>

                {/* CV actions */}
                <div className="flex gap-2">
                  <a
                    href={user?.isPremium !== false ? (talent.cvUrl || "#") : "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={user?.isPremium !== false ? `CV_${talent.name.replace(/\s+/g, '_')}` : undefined}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-semibold transition-colors ${user?.isPremium !== false && talent.cvUrl ? "border-red-200 text-red-500 hover:bg-red-50" : "border-slate-200 text-slate-400 cursor-not-allowed"}`}
                    onClick={(e) => {
                      if (user?.isPremium === false) {
                        e.preventDefault();
                        showToast("Premium requis pour télécharger le CV");
                      } else if (!talent.cvUrl) {
                        e.preventDefault();
                        showToast("Aucun CV disponible");
                      }
                    }}
                  >
                    <Download size={13} />
                    Télécharger
                  </a>
                  <a
                    href={user?.isPremium !== false ? (talent.cvUrl || "#") : "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-white text-xs font-semibold transition-colors shadow-sm ${user?.isPremium !== false && talent.cvUrl ? "bg-[#32A8D7] hover:bg-[#2896c2]" : "bg-slate-300 cursor-not-allowed"}`}
                    onClick={(e) => {
                      if (user?.isPremium === false) {
                        e.preventDefault();
                        showToast("Premium requis pour voir le CV");
                      } else if (!talent.cvUrl) {
                        e.preventDefault();
                        showToast("Aucun CV disponible");
                      }
                    }}
                  >
                    <Eye size={13} />
                    Ouvrir
                  </a>
                </div>
              </div>
            </div>

            {/* ── RIGHT COLUMN ─────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-slate-100">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 py-4 px-3 text-sm font-semibold transition-all ${
                      activeTab === tab.key
                        ? "bg-[#32A8D7] text-white"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="p-6">
                {activeTab === "informations" && <TabInformations talent={talent} blurSensitive={!user?.isPremium} />}
                {activeTab === "reseaux" && <TabReseaux talent={talent} blurSensitive={!user?.isPremium} />}
                {activeTab === "video" && <TabVideoEntretien talent={talent} blurSensitive={!user?.isPremium} />}
              </div>
            </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
