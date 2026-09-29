"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Search,
  Bookmark,
  CheckCircle,
  X,
} from "lucide-react";
import TalentCard from "@/app/components/TalentCard";
import { useAuth } from "../../../context/AuthContext";

interface FavorisTabProps {
  favorites: string[];
  talents: any[];
  toggleFavorite: (id: string) => void;
  onViewProfile?: (id: string) => void;
  onSendEmail?: (name: string) => void;
}


export default function FavorisTab({ favorites, talents, toggleFavorite, onViewProfile, onSendEmail }: FavorisTabProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const removeFavori = (id: string) => {
    toggleFavorite(id);
    showToast("Profil retiré des favoris.");
  };

  const handleShare = (name: string) => {
    navigator.clipboard?.writeText(`https://netacuv.com/profils/${name.toLowerCase().replace(" ", "-")}`).catch(() => {});
    showToast(`Lien du profil de ${name} copié !`);
  };

  const favorisObjects = talents.filter((t: any) => favorites.includes(t.id));

  const filtered = favorisObjects.filter(
    (f: any) =>
      (f.name || "Candidat Anonyme").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.profession || "Professionnel").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.location || "Non précisé").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm animate-fade-in border border-slate-700">
          <CheckCircle size={16} className="text-green-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Search bar */}
      <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-2.5">
        <Search size={18} className="text-slate-400 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 outline-none text-sm text-slate-800 bg-transparent placeholder:text-slate-400 font-medium"
          placeholder="Rechercher dans vos favoris..."
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={15} />
          </button>
        )}
        <button className="px-5 py-2 bg-[#32A8D7] hover:bg-[#2896c2] text-white text-sm font-semibold rounded-lg transition-colors">
          Rechercher
        </button>
      </div>

      {/* Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-600">
          {filtered.length} profil{filtered.length !== 1 ? "s" : ""} enregistré{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-100 shadow-sm text-center">
          <Bookmark size={40} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-semibold">Aucun favori trouvé</p>
          <p className="text-slate-400 text-sm mt-1">Essayez un autre terme de recherche.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((candidat: any) => (
            <div key={candidat.id} className="flex flex-col gap-1.5">
              <span className="text-[10px] text-slate-400 font-medium px-1">
                Dans vos favoris
              </span>
              <TalentCard
                id={candidat.id}
                name={candidat.name || "Candidat Anonyme"}
                location={candidat.location}
                profession={candidat.profession}
                imageUrl={candidat.avatar || "/assets/avatar_africain.jpg"}
                isVerified={candidat.isVerified ?? true}
                isFavorite={true}
                onFavorite={() => removeFavori(candidat.id)}
                blurSensitive={!user?.isPremium}
                isPremium={candidat.isPremium}
                hasVideo={candidat.videoOk}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
