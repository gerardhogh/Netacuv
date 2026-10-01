"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Briefcase,
  Plus,
  Eye,
  MoreHorizontal,
  MapPin,
  Users,
  Calendar,
  X,
  Save,
  CheckCircle2,
  Clock,
  Trash2,
  Edit3,
  ChevronRight,
  Share2,
  ArrowLeft,
  Mail,
  Bookmark,
} from "lucide-react";
import { ConfirmModal, SuccessModal } from "./Modals";
import useSWR from "swr";
import { useAuth } from "../../../context/AuthContext";

const fetcher = (url: string) => fetch(url, { headers: { 'Cache-Control': 'no-cache' } }).then(res => res.json());

// ─── Types ────────────────────────────────────────────────────────────────────

interface Emploi {
  id: number;
  titre: string;
  entreprise: string;
  lieu: string;
  pays: string;
  ville: string;
  typeEmploi: string;   // CDI, CDD, Freelance…
  modeTravail: string;  // Temps plein, Temps partiel…
  taille: string;       // 1-10 employés…
  competences: string[];
  description: string;
  candidatures: number;
  datePublication: string;
  status: "Active" | "Inactive" | "PUBLISHED" | "CLOSED" | string;
  _count?: { applications: number };
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_COMPETENCES = ["JavaScript", "Vue.js", "React", "Node.js", "Python", "Figma", "SQL", "TypeScript"];

const MOCK_EMPLOIS: Emploi[] = [];

// ─── Mock candidates ──────────────────────────────────────────────────────────

const MOCK_CANDIDATES: any[] = [];

// ─── Sub-components ───────────────────────────────────────────────────────────

function CandidateCard({ c }: { c: typeof MOCK_CANDIDATES[number] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
      {/* Photo */}
      <div className="relative w-full aspect-[4/3] bg-pink-100">
        <Image
          src={c.avatar}
          alt={c.nom}
          fill
          sizes="(max-width: 640px) 100vw, 33vw"
          className="object-cover object-top"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        {c.certifie && (
          <span className="absolute top-2 right-2 w-6 h-6 bg-[#32A8D7] rounded-full flex items-center justify-center">
            <CheckCircle2 size={13} className="text-white" />
          </span>
        )}
      </div>
      {/* Info */}
      <div className="p-3 flex-1">
        <div className="flex items-start justify-between gap-1">
          <div>
            <p className="font-bold text-slate-900 text-sm">{c.nom}</p>
            <p className="text-[11px] text-slate-400">{c.localisation}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              <span className="font-semibold">Profession :</span> {c.profession}
            </p>
          </div>
          <button className="text-slate-300 hover:text-[#32A8D7] transition-colors">
            <Bookmark size={14} />
          </button>
        </div>
        <div className="flex gap-1.5 mt-3">
          <button className="flex-1 py-1.5 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-1 transition-colors">
            <Mail size={11} /> Envoyer un mail
          </button>
          <button className="flex-1 py-1.5 rounded-lg bg-[#32A8D7] hover:bg-[#2896c2] text-white text-[11px] font-semibold transition-colors">
            Voir profil
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PublierModal ─────────────────────────────────────────────────────────────

interface PublierModalProps {
  onClose: () => void;
  onPublish: (emploi: Partial<Emploi>) => void;
}

function PublierModal({ onClose, onPublish }: PublierModalProps) {
  const [titre, setTitre] = useState("");
  const [entreprise, setEntreprise] = useState("");
  const [pays, setPays] = useState("Bénin");
  const [ville, setVille] = useState("Cotonou");
  const [typeEmploi, setTypeEmploi] = useState("CDI");
  const [modeTravail, setModeTravail] = useState("Temps plein");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: titre,
        description: `Mode de travail : ${modeTravail}\n\n${description}`,
        location: `${ville}, ${pays}`,
        contractType: typeEmploi,
        entreprise: entreprise, // Utilisé pour auto-créer le profil si inexistant
      };

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const newJob = await res.json();
        onPublish(newJob);
      } else {
        const errorData = await res.json();
        alert(`Erreur : ${errorData.error || "Impossible de publier l'offre"}`);
      }
    } catch (error) {
      console.error(error);
      alert("Une erreur inattendue est survenue.");
    }
    onClose();
  };

  const selectClass = "w-full appearance-none px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none focus:border-[#32A8D7] focus:bg-white transition-colors cursor-pointer";
  const inputClass = "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none focus:border-[#32A8D7] focus:bg-white transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Publier une offre</h3>
            <p className="text-xs text-slate-400 mt-0.5">Remplissez les informations de votre offre d&apos;emploi</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Intitulé */}
          <div>
            <label className="block text-sm font-bold text-[#32A8D7] mb-2">Intitulé du poste</label>
            <input required type="text" value={titre} onChange={(e) => setTitre(e.target.value)} className={inputClass} placeholder="Ex: Développeur Front-end" />
          </div>

          {/* Entreprise */}
          <div>
            <label className="block text-sm font-bold text-[#32A8D7] mb-2">Entreprise</label>
            <input required type="text" value={entreprise} onChange={(e) => setEntreprise(e.target.value)} className={inputClass} placeholder="Nom de l'entreprise" />
          </div>

          {/* Type de travail */}
          <div>
            <label className="block text-sm font-bold text-[#32A8D7] mb-2">Type de travail</label>
            <div className="relative">
              <select value={typeEmploi} onChange={(e) => setTypeEmploi(e.target.value)} className={selectClass}>
                <option>CDI</option><option>CDD</option><option>Stage</option><option>Freelance</option><option>Alternance</option>
              </select>
              <svg className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          {/* Lieu du travail */}
          <div>
            <label className="block text-sm font-bold text-[#32A8D7] mb-2">Lieu du travail</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <input 
                  type="text"
                  list="recruiter-countries-list"
                  value={pays} 
                  onChange={(e) => setPays(e.target.value)} 
                  className={inputClass} 
                  placeholder="Rechercher un pays"
                />
                <datalist id="recruiter-countries-list">
                  {["Bénin","Côte d'Ivoire","Sénégal","Togo","Mali","Cameroun","Burkina Faso","Guinée", "France", "Canada", "États-Unis", "Maroc", "Tunisie"].map(p => <option key={p} value={p} />)}
                </datalist>
              </div>
              <input type="text" value={ville} onChange={(e) => setVille(e.target.value)} className={inputClass} placeholder="Ville" />
            </div>
          </div>

          {/* Mode de travail */}
          <div>
            <label className="block text-sm font-bold text-[#32A8D7] mb-2">Mode de travail</label>
            <div className="relative">
              <select value={modeTravail} onChange={(e) => setModeTravail(e.target.value)} className={selectClass}>
                <option>Temps plein</option><option>Temps partiel</option><option>Remote</option><option>Hybride</option>
              </select>
              <svg className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-[#32A8D7] mb-2">Description de l&apos;offre</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className={`${inputClass} resize-none`} placeholder="Décrivez le poste, les missions, le profil recherché..." />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              Annuler
            </button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-[#32A8D7] hover:bg-[#2896c2] text-white text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2">
              <Save size={15} /> Publier l&apos;offre
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── DetailOffreView ──────────────────────────────────────────────────────────

interface DetailOffreViewProps {
  emploi: Emploi;
  onBack: () => void;
  onModifier: () => void;
  onSupprimer: () => void;
  onCloturer: () => void;
}

function DetailOffreView({ emploi, onBack, onModifier, onSupprimer, onCloturer }: DetailOffreViewProps) {
  const { data: applications = [] } = useSWR(`/api/applications?role=recruiter&jobOfferId=${emploi.id}`, fetcher);
  const candidates = Array.isArray(applications) ? applications.map((app: any) => ({
    id: app.talent?.userId || app.id,
    nom: app.talent?.user?.name || "Talent sans nom",
    localisation: "Non spécifié",
    profession: app.talent?.profession || "Candidat",
    avatar: app.talent?.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(app.talent?.user?.name || "T")}&background=random`,
    certifie: true,
  })) : [];

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <button onClick={onBack} className="hover:text-[#32A8D7] transition-colors">Accueil</button>
        <ChevronRight size={12} />
        <button onClick={onBack} className="hover:text-[#32A8D7] transition-colors">Offres d&apos;emplois</button>
        <ChevronRight size={12} />
        <span className="text-slate-700 font-medium truncate max-w-[180px]">{emploi.titre || (emploi as any).title}</span>
      </nav>

      {/* Info card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <p className="text-xs text-slate-400 mb-1">
              Publié le : <span className="font-semibold">{emploi.datePublication || (emploi as any).createdAt ? new Date((emploi as any).createdAt).toLocaleDateString("fr-FR") : "Récent"}</span>
              &nbsp;·&nbsp;
              <span className="font-bold text-slate-700">{emploi._count?.applications || emploi.candidatures || 0} candidats</span>
            </p>
            <h2 className="text-2xl font-extrabold text-[#32A8D7]">{emploi.titre || (emploi as any).title}</h2>
            <p className="text-sm text-slate-700 mt-0.5">
              <span className="font-semibold">Entreprise :</span> {emploi.entreprise || (emploi as any).recruiter?.companyName}&nbsp;&nbsp;
              <span className="font-semibold">– Localisation :</span> {emploi.lieu || (emploi as any).location}
            </p>
          </div>
          <button className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-[#32A8D7] hover:border-[#32A8D7] transition-colors shrink-0">
            <Share2 size={18} />
          </button>
        </div>

        <div className="mt-3 space-y-1 text-sm text-slate-600">
          <p>{emploi.modeTravail || "Non précisé"}</p>
          <p>{emploi.taille || "Non précisé"}</p>
          <p>Type de Contrat : {emploi.typeEmploi || (emploi as any).contractType} (Contrat à Durée Indéterminée)</p>
          <p>
            Compétences : {(emploi.competences || []).slice(0, 3).join(", ")}
            {(emploi.competences || []).length > 3 && ` et ${(emploi.competences || []).length - 3} en plus`}
          </p>
        </div>

        <div className="flex items-center justify-between mt-5">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
            (emploi.status === "Active" || emploi.status === "PUBLISHED") ? "bg-amber-50 text-amber-600 border border-amber-200" : "bg-slate-100 text-slate-500"
          }`}>
            {(emploi.status === "Active" || emploi.status === "PUBLISHED") ? (
              <><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />Offre en cours</>
            ) : (
              <><Clock size={11} />Offre clôturée</>
            )}
          </span>
          {(emploi.status === "Active" || emploi.status === "PUBLISHED") && (
            <button
              onClick={onCloturer}
              className="px-4 py-2 bg-[#32A8D7] hover:bg-[#2896c2] text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Cloturer
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-base font-bold text-[#32A8D7] mb-4">Description de l&apos;Offre</h3>
        <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
          {emploi.description}
        </div>
      </div>

      {/* Candidats postulés */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-base font-bold text-[#32A8D7] mb-1">Candidats postulés</h3>
        <p className="text-sm text-slate-500 mb-5">{emploi._count?.applications || emploi.candidatures || 0} candidatures reçues</p>
        {candidates.length === 0 ? (
          <div className="text-center py-8">
            <Users size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">Aucun candidat</p>
            <p className="text-xs text-slate-400">Aucun talent n'a encore postulé à cette offre.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {candidates.map((c: any) => (
              <CandidateCard key={c.id} c={c} />
            ))}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex gap-3 pb-4">
        <button
          onClick={onSupprimer}
          className="flex-1 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
        >
          Supprimer
        </button>
        <button
          onClick={onModifier}
          className="flex-1 py-3 rounded-2xl bg-[#32A8D7] hover:bg-[#2896c2] text-white text-sm font-semibold shadow-sm transition-colors"
        >
          Modifier
        </button>
      </div>
    </div>
  );
}

// ─── ModifierOffreView ────────────────────────────────────────────────────────

interface ModifierOffreViewProps {
  emploi: Emploi;
  onBack: () => void;
  onSave: (updated: Emploi) => void;
}

function ModifierOffreView({ emploi, onBack, onSave }: ModifierOffreViewProps) {
  const [titre, setTitre] = useState(emploi.titre || (emploi as any).title);
  const [entreprise, setEntreprise] = useState(emploi.entreprise || (emploi as any).recruiter?.companyName);
  const [pays, setPays] = useState(emploi.pays || "Bénin");
  const [ville, setVille] = useState(emploi.ville || (emploi as any).location?.split(',')[0]);
  const [typeEmploi, setTypeEmploi] = useState(emploi.typeEmploi || (emploi as any).contractType);
  const [modeTravail, setModeTravail] = useState(emploi.modeTravail || "Temps plein");
  const [description, setDescription] = useState(emploi.description || (emploi as any).description);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...emploi, titre, entreprise, pays, ville, typeEmploi, modeTravail, description, lieu: `${ville}, ${pays}` });
  };

  const sectionClass = "bg-white rounded-2xl border border-slate-100 shadow-sm p-6";
  const inputClass = "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none focus:border-[#32A8D7] focus:bg-white transition-colors";
  const selectClass = "w-full appearance-none px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none focus:border-[#32A8D7] focus:bg-white transition-colors cursor-pointer";
  const chevronSVG = (
    <svg className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );

  return (
    <form onSubmit={handleSave} className="space-y-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <button type="button" onClick={onBack} className="hover:text-[#32A8D7] transition-colors">Accueil</button>
        <ChevronRight size={12} />
        <button type="button" onClick={onBack} className="hover:text-[#32A8D7] transition-colors">Offres d&apos;emplois</button>
        <ChevronRight size={12} />
        <span className="text-slate-700 font-medium truncate max-w-[180px]">{emploi.titre}</span>
      </nav>

      {/* Intitulé */}
      <div className={sectionClass}>
        <label className="block text-sm font-bold text-[#32A8D7] mb-3">Intitulé du poste</label>
        <input type="text" value={titre} onChange={(e) => setTitre(e.target.value)} className={inputClass} required />
      </div>

      {/* Entreprise */}
      <div className={sectionClass}>
        <label className="block text-sm font-bold text-[#32A8D7] mb-3">Entreprise</label>
        <input type="text" value={entreprise} onChange={(e) => setEntreprise(e.target.value)} className={inputClass} required />
      </div>

      {/* Type de travail */}
      <div className={sectionClass}>
        <label className="block text-sm font-bold text-[#32A8D7] mb-3">Type de travail</label>
        <div className="relative">
          <select value={typeEmploi} onChange={(e) => setTypeEmploi(e.target.value)} className={selectClass}>
            <option>CDI</option><option>CDD</option><option>Stage</option><option>Freelance</option><option>Alternance</option>
          </select>
          {chevronSVG}
        </div>
      </div>

      {/* Lieu */}
      <div className={sectionClass}>
        <label className="block text-sm font-bold text-[#32A8D7] mb-3">Lieu du travail</label>
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <select value={pays} onChange={(e) => setPays(e.target.value)} className={selectClass}>
              {["Bénin","Côte d'Ivoire","Sénégal","Togo","Mali","Cameroun","Burkina Faso","Guinée"].map(p => <option key={p}>{p}</option>)}
            </select>
            {chevronSVG}
          </div>
          <input type="text" value={ville} onChange={(e) => setVille(e.target.value)} className={inputClass} placeholder="Ville" />
        </div>
      </div>

      {/* Mode de travail */}
      <div className={sectionClass}>
        <label className="block text-sm font-bold text-[#32A8D7] mb-3">Mode de travail</label>
        <div className="relative">
          <select value={modeTravail} onChange={(e) => setModeTravail(e.target.value)} className={selectClass}>
            <option>Temps plein</option><option>Temps partiel</option><option>Remote</option><option>Hybride</option>
          </select>
          {chevronSVG}
        </div>
      </div>

      {/* Description */}
      <div className={sectionClass}>
        <label className="block text-sm font-bold text-[#32A8D7] mb-3">Description de l&apos;offre</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} className={`${inputClass} resize-none`} />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pb-4">
        <button type="button" onClick={onBack} className="flex-1 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
          Annuler
        </button>
        <button type="submit" className="flex-1 py-3 rounded-2xl bg-[#32A8D7] hover:bg-[#2896c2] text-white text-sm font-semibold shadow-sm transition-colors">
          Enregistrer les informations
        </button>
      </div>
    </form>
  );
}

// ─── Main EmploisTab ──────────────────────────────────────────────────────────

type EmploisView = "grid" | "detail" | "modifier";

export default function EmploisTab() {
  const { user } = useAuth();
  const { data: emploisFetched = [], error, mutate } = useSWR("/api/jobs?mine=true", fetcher);
  const emplois = Array.isArray(emploisFetched) ? emploisFetched : (emploisFetched.jobs || []);
  const [view, setView] = useState<EmploisView>("grid");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleCreateClick = () => {
    const isAdmin = user?.role === "ADMIN" || user?.role === "admin";
    if (!isAdmin && !user?.isPremium && emplois.length >= 1) {
      setShowLimitModal(true);
    } else {
      setShowModal(true);
    }
  };

  // Confirmation modals
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [confirmCloturerId, setConfirmCloturerId] = useState<number | null>(null);
  const [showPublishedSuccess, setShowPublishedSuccess] = useState(false);
  const [justPublishedId, setJustPublishedId] = useState<number | null>(null);

  const selectedEmploi = emplois.find((e: any) => e.id === selectedId) ?? null;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handlePublish = (data: Partial<Emploi>) => {
    // La route POST a déjà été appelée dans PublierModal
    // On refetch simplement la liste des offres
    mutate();
    setJustPublishedId((data as any).id || Date.now()); 

    setShowPublishedSuccess(true);
  };

  // Confirmed delete
  const confirmDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
      if (res.ok) {
        mutate();
        setConfirmDeleteId(null);
        showToast("Offre supprimée.");
        if (view === "detail" || view === "modifier") {
          setView("grid");
          setSelectedId(null);
        }
      } else {
        showToast("Erreur lors de la suppression.");
        setConfirmDeleteId(null);
      }
    } catch (error) {
      console.error(error);
      showToast("Erreur lors de la suppression.");
      setConfirmDeleteId(null);
    }
  };

  const confirmCloturer = async (id: number) => {
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CLOSED" })
      });
      if (res.ok) {
        mutate();
        setConfirmCloturerId(null);
        showToast("Offre clôturée.");
      } else {
        showToast("Erreur lors de la clôture.");
        setConfirmCloturerId(null);
      }
    } catch (error) {
      console.error(error);
      showToast("Erreur lors de la clôture.");
      setConfirmCloturerId(null);
    }
  };

  const handleSaveModification = async (updated: Emploi) => {
    try {
      const res = await fetch(`/api/jobs/${updated.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        mutate();
        showToast("Offre mise à jour !");
        setView("detail");
      } else {
        showToast("Erreur lors de la mise à jour.");
      }
    } catch (error) {
      console.error(error);
      showToast("Erreur lors de la mise à jour.");
    }
  };

  const toggleStatus = async (id: number) => {
    const emp = emplois.find((e: any) => e.id === id);
    if (emp?.status === "PUBLISHED" || emp?.status === "Active") {
      setConfirmCloturerId(id);
    } else {
      try {
        const res = await fetch(`/api/jobs/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "PUBLISHED" })
        });
        if (res.ok) {
          mutate();
          showToast("Offre réactivée.");
        } else {
          showToast("Erreur lors de la réactivation.");
        }
      } catch (error) {
        console.error(error);
        showToast("Erreur lors de la réactivation.");
      }
    }
    setOpenMenuId(null);
  };

  const openDetail = (id: number) => {
    setSelectedId(id);
    setView("detail");
    setOpenMenuId(null);
  };

  const openModifier = () => { setView("modifier"); };
  const backToGrid = () => { setView("grid"); setSelectedId(null); };

  // ── RENDER ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm border border-slate-700 animate-fade-in">
          <CheckCircle2 size={16} className="text-green-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Publier Modal */}
      {showModal && <PublierModal onClose={() => setShowModal(false)} onPublish={handlePublish} />}

      {/* ── Limit Modal ── */}
      {showLimitModal && (
        <ConfirmModal
          title="Limite d'offres atteinte"
          message="Vous avez atteint la limite d'offres gratuites (1). Veuillez souscrire à l'offre Premium pour publier des offres en illimité."
          confirmLabel="J'ai compris"
          cancelLabel="Annuler"
          onConfirm={() => setShowLimitModal(false)}
          onCancel={() => setShowLimitModal(false)}
        />
      )}

      {/* ── Confirmation: Supprimer offre ── */}
      {confirmDeleteId !== null && (
        <ConfirmModal
          title="Confirmer la suppression"
          message="Êtes-vous sûr de vouloir supprimer cette offre ?"
          confirmLabel="Oui, supprimer"
          cancelLabel="Non, continuer"
          isDanger
          onConfirm={() => confirmDelete(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}

      {/* ── Confirmation: Clôturer offre ── */}
      {confirmCloturerId !== null && (
        <ConfirmModal
          title="Confirmer la clôture"
          message="Êtes-vous sûr de vouloir clôturer cette offre ?"
          confirmLabel="Oui, clôturer"
          cancelLabel="Non, continuer"
          isDanger
          onConfirm={() => confirmCloturer(confirmCloturerId)}
          onCancel={() => setConfirmCloturerId(null)}
        />
      )}

      {/* ── Success: Offre publiée ── */}
      {showPublishedSuccess && (
        <SuccessModal
          title="Offre publiée"
          message="Votre offre a été publié avec succès"
          primaryLabel="Voir l&apos;offre"
          secondaryLabel="Retour"
          onSecondary={() => setShowPublishedSuccess(false)}
          onPrimary={() => {
            setShowPublishedSuccess(false);
            if (justPublishedId) openDetail(justPublishedId);
          }}
        />
      )}

      {/* ── VIEW: DETAIL ────────────────────────────────────────────────────── */}
      {view === "detail" && selectedEmploi && (
        <>
          {/* Back button row */}
          <div className="flex items-center gap-3">
            <button
              onClick={backToGrid}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#32A8D7] transition-colors"
            >
              <ArrowLeft size={16} /> Retour
            </button>
          </div>
          <DetailOffreView
            emploi={selectedEmploi}
            onBack={backToGrid}
            onModifier={openModifier}
            onSupprimer={() => setConfirmDeleteId(selectedEmploi.id)}
            onCloturer={() => setConfirmCloturerId(selectedEmploi.id)}
          />
        </>
      )}

      {/* ── VIEW: MODIFIER ──────────────────────────────────────────────────── */}
      {view === "modifier" && selectedEmploi && (
        <>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView("detail")}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#32A8D7] transition-colors"
            >
              <ArrowLeft size={16} /> Retour au détail
            </button>
          </div>
          <ModifierOffreView
            emploi={selectedEmploi}
            onBack={() => setView("detail")}
            onSave={handleSaveModification}
          />
        </>
      )}

      {/* ── VIEW: GRID ──────────────────────────────────────────────────────── */}
      {view === "grid" && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Emplois créés</p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-[#0071a2] text-xs font-bold rounded-full">
                <Briefcase size={11} />
                {emplois.length} emplois au total
              </span>
            </div>
            <button
              onClick={handleCreateClick}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#32A8D7] hover:bg-[#2896c2] text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all"
            >
              <Plus size={16} /> Publier une offre
            </button>
          </div>

          {/* Grid */}
          {emplois.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
              <div className="flex flex-col items-center justify-center">
                <Briefcase size={48} className="text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-700 mb-2">Aucune offre publiée</h3>
                <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                  Vous n'avez pas encore publié d'offres d'emploi. Publiez votre première offre pour commencer à recevoir des candidatures.
                </p>
                <button
                  onClick={handleCreateClick}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#32A8D7] hover:bg-[#2896c2] text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all"
                >
                  <Plus size={16} /> Publier une offre
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {emplois.map((emploi: any) => (
                <div
                  key={emploi.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all flex flex-col"
                >
                  {/* Card header */}
                  <div className="p-4 pb-3 flex items-start justify-between">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      (emploi.status === "Active" || emploi.status === "PUBLISHED") ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-500"
                    }`}>
                      {(emploi.status === "Active" || emploi.status === "PUBLISHED") ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                      {emploi.status === "PUBLISHED" ? "Active" : emploi.status}
                    </span>

                    {/* More menu */}
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === emploi.id ? null : emploi.id)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      {openMenuId === emploi.id && (
                        <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-20">
                          <button onClick={() => toggleStatus(emploi.id)} className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                            {(emploi.status === "Active" || emploi.status === "PUBLISHED") ? <Clock size={13} /> : <CheckCircle2 size={13} />}
                            {(emploi.status === "Active" || emploi.status === "PUBLISHED") ? "Clôturer l'offre" : "Réactiver l'offre"}
                          </button>
                          <button onClick={() => openDetail(emploi.id)} className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                            <Eye size={13} /> Voir détail
                          </button>
                          <button onClick={() => { setConfirmDeleteId(emploi.id); setOpenMenuId(null); }} className="w-full text-left px-3.5 py-2 text-xs font-medium text-red-500 hover:bg-red-50 flex items-center gap-2">
                            <Trash2 size={13} /> Supprimer
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="px-4 pb-4 flex-1">
                    <h3 className="font-bold text-slate-900 text-sm leading-snug mb-0.5">{emploi.titre || (emploi as any).title}</h3>
                    <p className="text-xs text-slate-500 font-medium">{emploi.entreprise || (emploi as any).recruiter?.companyName}</p>
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <MapPin size={11} className="shrink-0" /><span>{emploi.lieu || (emploi as any).location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Briefcase size={11} className="shrink-0" /><span>{emploi.typeEmploi || (emploi as any).contractType}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Users size={11} className="shrink-0" /><span>{emploi._count?.applications || emploi.candidatures || 0} candidature{(emploi._count?.applications || emploi.candidatures) !== 1 ? "s" : ""}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Calendar size={11} className="shrink-0" /><span>{emploi.datePublication || new Date((emploi as any).createdAt).toLocaleDateString("fr-FR")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card footer */}
                  <div className="px-4 pb-4">
                    <button
                      onClick={() => openDetail(emploi.id)}
                      className="w-full py-2.5 rounded-xl bg-[#f0f9ff] hover:bg-[#e0f3fc] text-[#0071a2] text-xs font-semibold border border-sky-100 hover:border-sky-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye size={13} /> Voir détail
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
