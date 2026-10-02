"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Camera, Save } from "lucide-react";

// ─── Social network icons (inline SVGs) ──────────────────────────────────────
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#0A66C2">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function TwitterXIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#000000">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.213 5.567zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function PinterestIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#E60023">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
    </svg>
  );
}

function BehanceIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1769FF">
      <path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 3.211 3.483 3.312 4.588 2.029H23.7zM15.998 13c-.174-1.814 1.049-2.95 2.75-2.95 1.7 0 2.854 1.136 2.854 2.95h-5.604zM2 19.938a.962.962 0 0 1-.96-.96V5.022c0-.53.43-.96.96-.96h3.869c2.072 0 3.96.785 3.96 3.116 0 1.248-.67 2.09-1.702 2.576C10.2 10.267 11 11.38 11 12.924c0 2.555-1.975 3.014-3.998 3.014H2v4zM5.37 9.3c1.2 0 1.87-.557 1.87-1.6 0-1.01-.705-1.55-1.87-1.55H4v3.15h1.37zM5.7 15c1.45 0 2.3-.64 2.3-1.87 0-1.1-.87-1.73-2.3-1.73H4V15h1.7z" />
    </svg>
  );
}

// ─── Tab types ────────────────────────────────────────────────────────────────
type ProfileTab = "informations" | "reseaux";

// ─── Component ────────────────────────────────────────────────────────────────
export default function ProfilTab() {
  const [activeTab, setActiveTab] = useState<ProfileTab>("informations");
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Informations state
  const [nomEntreprise, setNomEntreprise] = useState("");
  const [secteur, setSecteur] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [siteWeb, setSiteWeb] = useState("");
  const [adresse, setAdresse] = useState("");
  const [description, setDescription] = useState("");
  const [competences, setCompetences] = useState("");

  // Réseaux state
  const [facebook, setFacebook] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");
  const [pinterest, setPinterest] = useState("");
  const [behance, setBehance] = useState("");

  // Toast
  const [toast, setToast] = useState<{msg: string; type: "success" | "error"} | null>(null);
  const showToast = (msg: string, type: "success" | "error" = "success") => { setToast({msg, type}); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/recruiters/me");
        if (res.ok) {
          const data = await res.json();
          setEmail(data.email || "");
          setAvatarSrc(data.avatar || null);
          
          if (data.recruiterProfile) {
            setNomEntreprise(data.recruiterProfile.companyName || "");
            setSecteur(data.recruiterProfile.industry || "");
            setSiteWeb(data.recruiterProfile.website || "");
            setTelephone(data.recruiterProfile.phone || "");
            setAdresse(data.recruiterProfile.address || "");
            setDescription(data.recruiterProfile.description || "");
            setCompetences(data.recruiterProfile.skills || "");

            setFacebook(data.recruiterProfile.facebook || "");
            setLinkedin(data.recruiterProfile.linkedin || "");
            setTwitter(data.recruiterProfile.twitter || "");
            setPinterest(data.recruiterProfile.pinterest || "");
            setBehance(data.recruiterProfile.behance || "");
          }
        }
      } catch (error) {
        console.error("Error fetching profile", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/recruiters/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: nomEntreprise,
          industry: secteur,
          website: siteWeb,
          phone: telephone,
          address: adresse,
          description,
          skills: competences,
          facebook,
          linkedin,
          twitter,
          pinterest,
          behance,
        }),
      });

      if (res.ok) {
        showToast("Profil mis à jour avec succès !.success");
      } else {
        showToast("Erreur lors de la mise à jour.error");
      }
    } catch (error) {
      console.error(error);
      showToast("Erreur lors de la mise à jour.error");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarSrc(url);
    }
  };

  const inputClass = "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none focus:border-[#32A8D7] transition-colors placeholder:text-slate-300";

  if (loading) {
    return <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-[#32A8D7] border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="w-full space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm border ${toast.type === "success" ? "bg-slate-900 border-slate-700" : "bg-red-500 border-red-600"}`}>
          <span className={`w-2 h-2 rounded-full ${toast.type === "success" ? "bg-green-400" : "bg-white"}`} />
          {toast.msg}
        </div>
      )}

      {/* Avatar section */}
      <div className="flex justify-center">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center gap-4 w-60">
          {/* Avatar Cliquable */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-28 h-28 rounded-full bg-blue-50 border-4 border-white shadow-md relative cursor-pointer group transition-all"
            title="Cliquer pour modifier la photo de profil"
          >
            <div className="w-full h-full rounded-full overflow-hidden relative bg-gradient-to-b from-blue-100 to-blue-200 flex items-center justify-center">
              {avatarSrc ? (
                <Image src={avatarSrc} alt="Avatar" fill className="object-cover object-center w-full h-full group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <svg viewBox="0 0 80 80" className="w-20 h-20">
                  <circle cx="40" cy="30" r="16" fill="#94C7EA" />
                  <path d="M10 70 Q40 48 70 70" fill="#5B8DB8" />
                  <circle cx="40" cy="28" r="12" fill="#FDDBB4" />
                  <rect x="28" y="38" width="24" height="6" rx="3" fill="#2B5F8E" />
                  <path d="M22 44 Q40 36 58 44 L62 70 H18 Z" fill="#1E4D7B" />
                </svg>
              )}
            </div>

            {/* Overlay hover */}
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-bold">
              <Camera size={20} className="mb-0.5" />
              <span>Modifier</span>
            </div>

            {/* Badge Camera Icon */}
            <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#008de4] text-white flex items-center justify-center shadow-md border-2 border-white group-hover:bg-blue-600 transition-colors">
              <Camera size={14} />
            </div>
          </div>
          
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-1.5 px-3 py-2 w-full rounded-lg border border-slate-200 text-xs text-slate-600 font-medium hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <Camera size={14} className="shrink-0" />
            <span className="text-center leading-tight">Enregistrer une photo</span>
          </button>
        </div>
      </div>

      {/* Tab card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Tab nav */}
        <div className="flex border-b border-slate-100">
          {(["informations", "reseaux"] as ProfileTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors capitalize ${
                activeTab === tab
                  ? "bg-white text-slate-900 border-b-2 border-[#32A8D7]"
                  : "bg-slate-50 text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab === "informations" ? "Informations" : "Réseaux"}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-6">
          {/* ── INFORMATIONS ── */}
          {activeTab === "informations" && (
            <div className="space-y-4">
              {/* Nom entreprise */}
              <div>
                <label className="block text-sm text-slate-600 mb-1.5">Nom de l&apos;entreprise</label>
                <input type="text" value={nomEntreprise} onChange={(e) => setNomEntreprise(e.target.value)} className={inputClass} placeholder="Nom de l'entreprise" />
              </div>

              {/* Secteur */}
              <div>
                <label className="block text-sm text-slate-600 mb-1.5">Secteur d&apos;activité</label>
                <div className="relative">
                  <select value={secteur} onChange={(e) => setSecteur(e.target.value)} className={`${inputClass} appearance-none cursor-pointer`}>
                    <option value="">Choisissez votre secteur d&apos;activité</option>
                    <option>Technologie / Numérique</option>
                    <option>Finance / Banque</option>
                    <option>Santé / Médical</option>
                    <option>Éducation / Formation</option>
                    <option>Commerce / Distribution</option>
                    <option>BTP / Construction</option>
                    <option>Energie / Mines</option>
                    <option>Agriculture / Agroalimentaire</option>
                    <option>Média / Communication</option>
                    <option>Transport / Logistique</option>
                    <option>Tourisme / Hôtellerie</option>
                    <option>Autre</option>
                  </select>
                  <svg className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm text-slate-600 mb-1.5">Email de contact</label>
                <input type="email" value={email} disabled className={`${inputClass} bg-slate-50 cursor-not-allowed text-slate-500`} placeholder="contact@enterprise.com" />
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-sm text-slate-600 mb-1.5">Téléphone</label>
                <input type="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)} className={inputClass} placeholder="+229 01 00 00 00 00" />
              </div>

              {/* Site web */}
              <div>
                <label className="block text-sm text-slate-600 mb-1.5">Site web</label>
                <input type="url" value={siteWeb} onChange={(e) => setSiteWeb(e.target.value)} className={inputClass} placeholder="https://www.votreentreprise.com" />
              </div>

              {/* Adresse */}
              <div>
                <label className="block text-sm text-slate-600 mb-1.5">Adresse</label>
                <input type="text" value={adresse} onChange={(e) => setAdresse(e.target.value)} className={inputClass} placeholder="Ex : 123 Rue de l'Emploi Cotonou Bénin" />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-slate-600 mb-1.5">Description de l&apos;entreprise</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={`${inputClass} resize-none`} placeholder="Parlez brièvement de votre entreprise et de vos valeurs" />
              </div>

              {/* Compétences */}
              <div>
                <label className="block text-sm text-slate-600 mb-1.5">Compétences clés</label>
                <input type="text" value={competences} onChange={(e) => setCompetences(e.target.value)} className={inputClass} placeholder="Ajoutez vos compétences séparé par des virgules" />
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full py-3 rounded-xl bg-[#32A8D7] hover:bg-[#2896c2] text-white text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                <Save size={15} /> {saving ? "Enregistrement..." : "Mettre à jour le profil"}
              </button>
            </div>
          )}

          {/* ── RÉSEAUX ── */}
          {activeTab === "reseaux" && (
            <div className="space-y-4">
              {[
                { icon: <FacebookIcon />, label: "Facebook", value: facebook, onChange: setFacebook },
                { icon: <LinkedInIcon />, label: "LinkedIn", value: linkedin, onChange: setLinkedin },
                { icon: <TwitterXIcon />, label: "Twitter", value: twitter, onChange: setTwitter },
                { icon: <PinterestIcon />, label: "Pinterest", value: pinterest, onChange: setPinterest },
                { icon: <BehanceIcon />, label: "Behance", value: behance, onChange: setBehance },
              ].map(({ icon, label, value, onChange }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="shrink-0">{icon}</div>
                  <label className="text-sm text-slate-600 w-20 shrink-0">{label} :</label>
                  <input
                    type="url"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={inputClass}
                    placeholder={`https://...`}
                  />
                </div>
              ))}

              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full py-3 rounded-xl bg-[#32A8D7] hover:bg-[#2896c2] text-white text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                <Save size={15} /> {saving ? "Enregistrement..." : "Enregistrer les informations"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
