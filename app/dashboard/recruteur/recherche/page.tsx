"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Menu, 
  Bell, 
  ChevronDown, 
  Search, 
  X,
  ArrowLeft,
  ArrowRight,
  Crown
} from "lucide-react";
import TalentCard from "@/app/components/TalentCard";
import { useAuth } from "@/app/context/AuthContext";
import { ConfirmModal } from "../components/Modals";
import NotificationBell from "@/app/components/NotificationBell";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { EmptyState } from "@/components/ui/EmptyState";
import { useTranslations, useLocale } from "next-intl";

// No MOCK_TALENTS anymore

export default function RechercheProfil() {
  const tSearch = useTranslations("recruiter.search");
  const tNav = useTranslations("nav");
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDegree, setFilterDegree] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [filterCity, setFilterCity] = useState("");
  
  const { user } = useAuth();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const [talents, setTalents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const isPremiumRecruiter = user?.role === "admin" || user?.isPremium;

  useEffect(() => {
    // A chaque fois qu'il tombe sur la page, on lui rappelle s'il n'est pas premium
    if (user && !isPremiumRecruiter) {
      setShowPremiumModal(true);
    }
  }, [user, isPremiumRecruiter]);

  const fetchTalents = async (
    q = searchQuery, 
    d = filterDegree, 
    g = filterGender, 
    c = filterCountry, 
    cy = filterCity
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.append("q", q);
      if (d && !d.startsWith("Toutes")) params.append("degree", d);
      if (g && !g.startsWith("Tous")) params.append("gender", g);
      if (c && !c.startsWith("Tous")) params.append("country", c);
      if (cy && !cy.startsWith("Toutes")) params.append("city", cy);

      const res = await fetch(`/api/talents?${params.toString()}`);
      const data = await res.json();
      if (res.ok) setTalents(Array.isArray(data) ? data : (data.talents || []));
    } catch (e) {
      console.error(e);
      showToast("Erreur lors de la récupération des talents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTalents();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleFavorite = (id?: string | number) => {
    if (!id) return;
    const strId = String(id);
    if (favorites.includes(strId)) {
      setFavorites(favorites.filter((f) => f !== strId));
      showToast(tSearch("profileRemoved"));
    } else {
      setFavorites([...favorites, strId]);
      showToast(tSearch("profileAdded"));
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] flex flex-col font-sans">
      {/* Toast feedback */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl text-sm animate-fade-in border border-slate-700">
          {toastMessage}
        </div>
      )}

      {/* Premium Reminder Modal */}
      {showPremiumModal && (
        <ConfirmModal
          title={locale === "en" ? "Restricted Access" : "Accès Restreint"}
          message={locale === "en" ? "To view complete profiles and contact talents, you must subscribe to the Premium plan." : "Pour voir les profils et contacter les talents, vous devez activer l'offre Premium."}
          confirmLabel={locale === "en" ? "I understand" : "J'ai compris"}
          onConfirm={() => setShowPremiumModal(false)}
          onCancel={() => setShowPremiumModal(false)}
        />
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-20">
        <div className="flex items-center gap-4 relative">
          <button 
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 -ml-2 text-[#32A8D7] hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
            aria-label="Menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-[#232323] tracking-tight">
            {locale === "en" ? <>Talent <span className="text-[#32A8D7]">Search</span></> : <>Recherche <span className="text-[#32A8D7]">profil</span></>}
          </h1>

          {/* Navigation Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute top-12 left-0 mt-3 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-30 animate-fade-in">
              <Link href="/" className="w-full text-left px-5 py-2.5 text-[13px] text-slate-700 hover:bg-slate-50 font-semibold flex items-center transition-colors">
                {tNav("home")}
              </Link>
              <Link href="/dashboard/recruteur" className="w-full text-left px-5 py-2.5 text-[13px] text-slate-700 hover:bg-slate-50 font-semibold flex items-center transition-colors">
                {tNav("dashboard")}
              </Link>
              <Link href="/dashboard/recruteur/recherche" className="w-full text-left px-5 py-2.5 text-[13px] text-[#32A8D7] bg-sky-50/50 font-bold flex items-center transition-colors">
                {tNav("searchTalents")}
              </Link>
              
              <div className="my-1 border-t border-slate-100 mx-5"></div>
              
              <Link href="/dashboard/recruteur" className="w-full text-left px-5 py-2.5 text-[13px] text-[#32A8D7] hover:bg-blue-50 font-bold flex items-center justify-between transition-colors">
                {tNav("dashboard")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <NotificationBell align="right" />
          <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 pr-2 rounded-full transition-colors border border-transparent hover:border-slate-200">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 relative">
                <img
                  src={user?.avatar || "/assets/avatar_africain.jpg"}
                  alt="Profile"
                  width={32}
                  height={32}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/assets/avatar_africain.jpg";
                  }}
                  className="object-cover w-full h-full object-center"
                />
            </div>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        
        {/* Search Bar */}
        <div className="flex w-full items-center gap-2 bg-white rounded-lg p-1.5 sm:p-2 border border-slate-200 shadow-xs">
          <div className="flex-1 flex items-center gap-2.5 px-3">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 outline-hidden text-slate-800 bg-transparent text-sm placeholder:text-slate-400 font-medium"
              placeholder={tSearch("placeholder")}
            />
            {searchQuery && (
              <button 
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  fetchTalents("");
                }}
                className="p-1 hover:bg-slate-100 rounded-md text-slate-400 transition-colors"
                aria-label="Effacer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button 
            type="button"
            onClick={() => fetchTalents()}
            className="px-6 py-2.5 bg-[#32A8D7] hover:bg-[#2896c2] text-white rounded-md text-sm font-semibold transition-colors shadow-xs hover:shadow"
          >
            {tSearch("btn")}
          </button>
        </div>

        {/* Filters */}
        <div className="relative">
          {!isPremiumRecruiter && (
            <div 
              className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[2px] flex items-center justify-center rounded-lg border border-slate-200/50 cursor-pointer transition-all hover:bg-white/40"
              onClick={() => setShowPremiumModal(true)}
            >
              <div className="bg-white/95 px-4 py-2.5 rounded-full shadow-sm border border-amber-100 flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-semibold text-slate-800">
                  {locale === "en" ? "Advanced filters reserved for Premium members" : "Filtres avancés réservés aux membres Premium"}
                </span>
              </div>
            </div>
          )}
          <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 ${!isPremiumRecruiter ? 'pointer-events-none opacity-60' : ''}`}>
            <CustomSelect
              value={filterDegree}
              onChange={(val) => {
                setFilterDegree(val);
                fetchTalents(searchQuery, val, filterGender, filterCountry, filterCity);
              }}
              placeholder={locale === "en" ? "All degrees" : "Toutes les licences"}
              options={[
                { label: locale === "en" ? "All degrees" : "Toutes les licences", value: "" },
                { label: locale === "en" ? "Bachelor's Degree" : "Licence Pro", value: "Licence Pro" },
                { label: locale === "en" ? "Master / Engineering" : "Master / Ingénieur", value: "Master / Ingénieur" },
                { label: locale === "en" ? "PhD / Doctorate" : "Doctorat", value: "Doctorat" },
                { label: locale === "en" ? "Netacuv Certified" : "Certifié Netacuv", value: "Certifié Netacuv" },
              ]}
            />

            <CustomSelect
              value={filterGender}
              onChange={(val) => {
                setFilterGender(val);
                fetchTalents(searchQuery, filterDegree, val, filterCountry, filterCity);
              }}
              placeholder={locale === "en" ? "All genders" : "Tous les genres"}
              options={[
                { label: locale === "en" ? "All genders" : "Tous les genres", value: "" },
                { label: locale === "en" ? "Female" : "Femme", value: "Femme" },
                { label: locale === "en" ? "Male" : "Homme", value: "Homme" },
              ]}
            />

            <CustomSelect
              value={filterCountry}
              onChange={(val) => {
                setFilterCountry(val);
                fetchTalents(searchQuery, filterDegree, filterGender, val, filterCity);
              }}
              placeholder={locale === "en" ? "All countries" : "Tous les pays"}
              options={[
                { label: locale === "en" ? "All countries" : "Tous les pays", value: "" },
                ...["Bénin", "Côte d'Ivoire", "Sénégal", "Togo", "Cameroun", "France"].map((c) => ({
                  label: c,
                  value: c,
                })),
              ]}
            />

            <CustomSelect
              value={filterCity}
              onChange={(val) => {
                setFilterCity(val);
                fetchTalents(searchQuery, filterDegree, filterGender, filterCountry, val);
              }}
              placeholder={locale === "en" ? "All cities" : "Toutes les villes"}
              options={[
                { label: locale === "en" ? "All cities" : "Toutes les villes", value: "" },
                ...["Cotonou", "Porto-Novo", "Abidjan", "Dakar", "Lomé", "Douala", "Paris"].map((city) => ({
                  label: city,
                  value: city,
                })),
              ]}
            />
          </div>
        </div>

        {/* Talent Grid */}
        {loading ? (
          <div className="flex justify-center p-12">
            <p className="text-slate-500 font-medium">
              {locale === "en" ? "Searching talents..." : "Recherche en cours..."}
            </p>
          </div>
        ) : talents.length === 0 ? (
          <div className="my-6">
            <EmptyState
              type="talents"
              title={tSearch("noTalentTitle")}
              description={tSearch("noTalentDesc")}
              actionLabel={locale === "en" ? "Reset filters" : "Réinitialiser les filtres"}
              onAction={() => {
                setSearchQuery("");
                setFilterDegree("");
                setFilterGender("");
                setFilterCountry("");
                setFilterCity("");
                fetchTalents("", "", "", "", "");
              }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
            {talents.map((talent) => (
              <TalentCard 
                key={talent.id}
                id={talent.id}
                name={talent.name}
                location={talent.location}
                profession={talent.profession}
                imageUrl={talent.avatar || "/assets/avatar_africain.jpg"}
                isVerified={talent.isVerified}
                isFavorite={favorites.includes(talent.id)}
                onFavorite={toggleFavorite}
                blurSensitive={!isPremiumRecruiter}
                isPremium={talent.isPremium}
                hasVideo={talent.videoOk}
                onViewProfile={() => {
                  if (!isPremiumRecruiter) setShowPremiumModal(true);
                }}
                onSendEmail={() => {
                  if (!isPremiumRecruiter) setShowPremiumModal(true);
                }}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 pt-6">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <button 
              type="button"
              disabled
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-md text-sm font-medium text-slate-400 bg-slate-50 cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              {tSearch("prevPage")}
            </button>
            <button 
              type="button"
              className="flex items-center gap-2 px-5 py-2 bg-[#32A8D7] hover:bg-[#2896c2] text-white rounded-md text-sm font-semibold transition-colors shadow-xs"
            >
              {tSearch("nextPage")}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="text-sm text-slate-500 font-medium">
            {tSearch("pageOf", { current: 1, total: 26 })}
          </div>
        </div>

      </main>
    </div>
  );
}
