"use client";
import React, { useState, useEffect, useRef } from "react";
import { User, Mail, CheckCircle, Loader2, Camera } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import Image from "next/image";

export default function AdminProfil() {
  const { user: authUser, updateUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/admin/me");
      if (res.ok) {
        const data = await res.json();
        setName(data.name || "");
        setEmail(data.email || "");
        setAvatar(data.avatar || null);
      }
    } catch (e) {
      console.error("Failed to fetch admin profile", e);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur de mise à jour");
      
      showToast("Profil mis à jour avec succès");
      
      if (updateUser) {
        updateUser({ user: { name } });
      }
    } catch (e: any) {
      showToast(e.message || "Erreur de mise à jour");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Veuillez sélectionner un fichier image valide.");
      return;
    }

    showToast("Mise à jour de la photo en cours...");

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64 = reader.result;

        const res = await fetch("/api/admin/avatar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            avatarBase64: base64, 
            fileName: file.name, 
            mimeType: file.type 
          }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Erreur lors de l'upload");

        showToast("Photo de profil mise à jour avec succès !");
        fetchProfile();
        
        if (updateUser && authUser) {
          updateUser({ user: { image: data.avatarUrl } });
        }
      } catch (err: any) {
        console.error("Erreur sauvegarde avatar", err);
        showToast(err.message || "Une erreur s'est produite lors de la sauvegarde de la photo.");
      }
    };
    reader.onerror = () => {
      showToast("Erreur lors de la lecture du fichier.");
    };
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const userAvatar = avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(name || "Admin") + "&background=008de4&color=fff";

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up w-full pb-20">
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm animate-fade-in border border-slate-700">
          <CheckCircle size={18} className="text-green-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <input
        type="file"
        ref={avatarInputRef}
        onChange={handleAvatarChange}
        accept="image/*"
        className="hidden"
      />

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 items-start">
        {/* Left Sidebar - Avatar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center flex flex-col items-center">
          <div
            onClick={() => avatarInputRef.current?.click()}
            className="w-32 h-32 rounded-full bg-blue-50 border-4 border-white shadow-md mb-4 relative cursor-pointer group transition-all"
            title="Cliquer pour modifier la photo de profil"
          >
            <div className="w-full h-full rounded-full overflow-hidden relative">
              <img
                src={userAvatar}
                alt="Avatar"
                className="object-cover object-center w-full h-full group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[12px] font-bold">
              <Camera size={24} className="mb-1" />
              <span>Modifier</span>
            </div>

            <div className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-[#008de4] text-white flex items-center justify-center shadow-md border-2 border-white group-hover:bg-blue-600 transition-colors">
              <Camera size={16} />
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-slate-800 mt-2">
            {name || "Admin"}
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Super Administrateur
          </p>
        </div>

        {/* Right Content - Form */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <div className="mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-800">Informations personnelles</h2>
            <p className="text-sm text-slate-500 mt-1">Gérez vos informations de compte</p>
          </div>

          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nom complet</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Votre nom" 
                  required
                  className="w-full bg-[#f8f9fa] border border-slate-200 rounded-lg py-3 px-4 pl-11 text-sm focus:ring-2 focus:ring-[#1e8ae9] focus:bg-white outline-none transition-all"
                />
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Adresse Email</label>
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com" 
                  required
                  className="w-full bg-[#f8f9fa] border border-slate-200 rounded-lg py-3 px-4 pl-11 text-sm focus:ring-2 focus:ring-[#1e8ae9] focus:bg-white outline-none transition-all"
                />
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
              <p className="text-xs text-slate-500 mt-2">Cette adresse email est utilisée pour la connexion au panneau d'administration.</p>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                type="submit" 
                disabled={loading}
                className="px-6 py-3 bg-[#008de4] text-white font-bold rounded-lg text-sm hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/20"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                Enregistrer les modifications
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
