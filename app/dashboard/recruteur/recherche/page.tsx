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
  ArrowRight
} from "lucide-react";
import TalentCard from "@/app/components/TalentCard";
import { useAuth } from "@/app/context/AuthContext";
import { ConfirmModal } from "../components/Modals";

// No MOCK_TALENTS anymore

export default function RechercheProfil() {
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
      showToast("Profil retiré des favoris.");
    } else {
      setFavorites([...favorites, strId]);
      showToast("Profil ajouté aux favoris !");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Toast feedback */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl text-sm animate-fade-in border border-slate-700">
          {toastMessage}
        </div>
      )}

      {/* Premium Reminder Modal */}
      {showPremiumModal && (
        <ConfirmModal
          title="Accès Restreint"
          message="Pour voir les profils et contacter les talents, vous devez activer l'offre Premium."
          confirmLabel="J'ai compris"
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
            Recherche <span className="text-[#32A8D7]">profil</span>
          </h1>

          {/* Navigation Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute top-12 left-0 mt-3 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-30 animate-fade-in">
              <Link href="/" className="w-full text-left px-5 py-2.5 text-[13px] text-slate-700 hover:bg-slate-50 font-semibold flex items-center transition-colors">
                Accueil
              </Link>
              <Link href="/dashboard/recruteur" className="w-full text-left px-5 py-2.5 text-[13px] text-slate-700 hover:bg-slate-50 font-semibold flex items-center transition-colors">
                Tableau de bord
              </Link>
              <Link href="/dashboard/recruteur/recherche" className="w-full text-left px-5 py-2.5 text-[13px] text-[#32A8D7] bg-sky-50/50 font-bold flex items-center transition-colors">
                Recherche Profils
              </Link>
              
              <div className="my-1 border-t border-slate-100 mx-5"></div>
              
              <Link href="/dashboard/recruteur" className="w-full text-left px-5 py-2.5 text-[13px] text-[#32A8D7] hover:bg-blue-50 font-bold flex items-center justify-between transition-colors">
                Mon Espace
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            type="button"
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
          </button>
          <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 pr-2 rounded-full transition-colors border border-transparent hover:border-slate-200">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 relative">
                <Image
                  src={user?.avatar || "/assets/avatar_africain.jpg"}
                  alt="Profile"
                  width={32}
                  height={32}
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
              placeholder="Rechercher par compétences, métier..."
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
            Rechercher
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="relative">
            <select 
              value={filterDegree} 
              onChange={(e) => {
                setFilterDegree(e.target.value);
                fetchTalents(searchQuery, e.target.value, filterGender, filterCountry, filterCity);
              }}
              className="w-full appearance-none bg-slate-100 hover:bg-slate-200/70 border border-slate-200/80 rounded-md py-2.5 pl-4 pr-9 text-sm font-medium text-slate-700 outline-hidden hover:border-slate-300 focus:border-[#32A8D7] focus:bg-white cursor-pointer transition-colors"
            >
              <option value="">Toutes les licenses</option>
              {["Licence Pro", "Master / Ingénieur", "Doctorat", "Certifié Netacuv"].map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative">
            <select 
              value={filterGender} 
              onChange={(e) => {
                setFilterGender(e.target.value);
                fetchTalents(searchQuery, filterDegree, e.target.value, filterCountry, filterCity);
              }}
              className="w-full appearance-none bg-slate-100 hover:bg-slate-200/70 border border-slate-200/80 rounded-md py-2.5 pl-4 pr-9 text-sm font-medium text-slate-700 outline-hidden hover:border-slate-300 focus:border-[#32A8D7] focus:bg-white cursor-pointer transition-colors"
            >
              <option value="">Tous les genres</option>
              {["Femme", "Homme"].map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative">
            <select 
              value={filterCountry} 
              onChange={(e) => {
                setFilterCountry(e.target.value);
                fetchTalents(searchQuery, filterDegree, filterGender, e.target.value, filterCity);
              }}
              className="w-full appearance-none bg-slate-100 hover:bg-slate-200/70 border border-slate-200/80 rounded-md py-2.5 pl-4 pr-9 text-sm font-medium text-slate-700 outline-hidden hover:border-slate-300 focus:border-[#32A8D7] focus:bg-white cursor-pointer transition-colors"
            >
              <option value="">Tous les pays</option>
              {["Bénin", "Côte d'Ivoire", "Sénégal", "Togo", "Cameroun", "France"].map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative">
            <select 
              value={filterCity} 
              onChange={(e) => {
                setFilterCity(e.target.value);
                fetchTalents(searchQuery, filterDegree, filterGender, filterCountry, e.target.value);
              }}
              className="w-full appearance-none bg-slate-100 hover:bg-slate-200/70 border border-slate-200/80 rounded-md py-2.5 pl-4 pr-9 text-sm font-medium text-slate-700 outline-hidden hover:border-slate-300 focus:border-[#32A8D7] focus:bg-white cursor-pointer transition-colors"
            >
              <option value="">Toutes les villes</option>
              {["Cotonou", "Porto-Novo", "Abidjan", "Dakar", "Lomé", "Douala", "Paris"].map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Talent Grid */}
        {loading ? (
          <div className="flex justify-center p-12">
            <p className="text-slate-500 font-medium">Recherche en cours...</p>
          </div>
        ) : talents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center my-6">
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Search size={32} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Aucun talent trouvé</h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                Nous n'avons trouvé aucun profil correspondant à vos critères de recherche.
                Essayez d'élargir votre recherche en modifiant les mots-clés ou les filtres.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterDegree("");
                  setFilterGender("");
                  setFilterCountry("");
                  setFilterCity("");
                  fetchTalents("", "", "", "", "");
                }}
                className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-semibold transition-all"
              >
                Réinitialiser la recherche
              </button>
            </div>
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
              Page précédente
            </button>
            <button 
              type="button"
              className="flex items-center gap-2 px-5 py-2 bg-[#32A8D7] hover:bg-[#2896c2] text-white rounded-md text-sm font-semibold transition-colors shadow-xs"
            >
              Page suivante
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="text-sm text-slate-500 font-medium">
            Page 1 de 26
          </div>
        </div>

      </main>
    </div>
  );
}
