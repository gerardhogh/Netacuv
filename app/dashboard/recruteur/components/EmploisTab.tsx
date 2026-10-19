"use client";

import { useState } from "react";
import Image from "next/image";
import { Country, City } from "country-state-city";
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
import { useTranslations, useLocale } from "next-intl";
import { ConfirmModal, SuccessModal } from "./Modals";
import useSWR from "swr";
import { useAuth } from "../../../context/AuthContext";
import PremiumRequiredModal from "../../../components/PremiumRequiredModal";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";

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
  expiresAt?: string | null;
  _count?: { applications: number };
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_COMPETENCES = ["JavaScript", "Vue.js", "React", "Node.js", "Python", "Figma", "SQL", "TypeScript"];

const MOCK_EMPLOIS: Emploi[] = [];

// ─── Mock candidates ──────────────────────────────────────────────────────────

const MOCK_CANDIDATES: any[] = [];

// ─── Sub-components ───────────────────────────────────────────────────────────

function CandidateCard({ c }: { c: typeof MOCK_CANDIDATES[number] }) {
  const t = useTranslations("recruiter.jobsTab");
  const { user } = useAuth();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
      {/* Photo */}
      <div className="relative w-full aspect-[4/3] bg-pink-100">
        <img
          src={c.avatar}
          alt={c.nom}
          className={`object-cover object-top w-full h-full ${!user?.isPremium ? 'blur-md select-none' : ''}`}
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
            <p className={`font-bold text-slate-900 text-sm ${!user?.isPremium ? 'blur-sm select-none' : ''}`}>{!user?.isPremium ? t("confidentialProfile") : c.nom}</p>
            <p className={`text-[11px] text-slate-400 ${!user?.isPremium ? 'blur-sm select-none' : ''}`}>{!user?.isPremium ? t("hiddenLocation") : c.localisation}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              <span className="font-semibold">{t("professionLabel")}</span> {c.profession}
            </p>
          </div>
          <button className="text-slate-300 hover:text-[#32A8D7] transition-colors">
            <Bookmark size={14} />
          </button>
        </div>
        <div className="flex gap-1.5 mt-3">
          <button
            onClick={(e) => {
              e.preventDefault();
              if (!user?.isPremium) {
                setShowPremiumModal(true);
                return;
              }
              const subject = encodeURIComponent(`Contact Candidat ${c.nom}`);
              const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=candidat@example.com&su=${subject}`;
              window.open(gmailUrl, "_blank", "noopener,noreferrer");
            }}
            className={`flex-1 py-1.5 rounded-lg border text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors ${
              !user?.isPremium 
                ? 'border-slate-200 text-slate-400 bg-slate-50 opacity-70 cursor-not-allowed'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Mail size={11} /> {t("sendEmail")}
          </button>
          <button className="flex-1 py-1.5 rounded-lg bg-[#32A8D7] hover:bg-[#2896c2] text-white text-[11px] font-semibold transition-colors">
            {t("viewProfile")}
          </button>
        </div>
      </div>
      </div>
      
      {showPremiumModal && (
        <PremiumRequiredModal 
          onClose={() => setShowPremiumModal(false)} 
          message={t("premiumRequiredCandidate")}
        />
      )}
    </>
  );
}

// ─── PublierModal ─────────────────────────────────────────────────────────────

interface PublierModalProps {
  onClose: () => void;
  onPublish: (emploi: Partial<Emploi>) => void;
}

function PublierModal({ onClose, onPublish }: PublierModalProps) {
  const t = useTranslations("recruiter.jobsTab");
  const countriesList = Country.getAllCountries();
  const [titre, setTitre] = useState("");
  const [entreprise, setEntreprise] = useState("");
  const [pays, setPays] = useState("BJ");
  const [ville, setVille] = useState("");
  const [typeEmploi, setTypeEmploi] = useState("CDI");
  const [modeTravail, setModeTravail] = useState("Temps plein");
  const [description, setDescription] = useState("");
  const [dureePublication, setDureePublication] = useState("30 jours (Recommandé)");
  const [dateExpiration, setDateExpiration] = useState("");
  const [heureExpiration, setHeureExpiration] = useState("23:59");

  const citiesList = pays ? City.getCitiesOfCountry(pays) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let validityDays: number | undefined = undefined;
      let expiresAt: string | undefined = undefined;

      if (dureePublication.startsWith("15")) validityDays = 15;
      else if (dureePublication.startsWith("30")) validityDays = 30;
      else if (dureePublication.startsWith("60")) validityDays = 60;
      else if (dureePublication.startsWith("90")) validityDays = 90;
      else if (dureePublication === "Date personnalisée" && dateExpiration) {
        const time = heureExpiration || "23:59";
        expiresAt = new Date(`${dateExpiration}T${time}:00`).toISOString();
      }

      const countryObj = Country.getCountryByCode(pays);
      const countryName = countryObj ? countryObj.name : pays;
      const fullLocation = ville ? `${ville}, ${countryName}` : (countryName || "Non spécifié");

      const payload = {
        title: titre,
        description: `Mode de travail : ${modeTravail}\n\n${description}`,
        location: fullLocation,
        contractType: typeEmploi,
        entreprise: entreprise, // Utilisé pour auto-créer le profil si inexistant
        validityDays,
        expiresAt,
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
        alert(`Erreur : ${errorData.error || t("errorPublish")}`);
      }
    } catch (error) {
      console.error(error);
      alert(t("errorUnexpected"));
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
            <h3 className="text-lg font-bold text-slate-900">{t("publishTitle")}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{t("publishDesc")}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Intitulé */}
          <div>
            <label className="block text-sm font-bold text-[#32A8D7] mb-2">{t("jobTitle")}</label>
            <input required type="text" value={titre} onChange={(e) => setTitre(e.target.value)} className={inputClass} placeholder={t("jobTitlePlaceholder")} />
          </div>

          {/* Entreprise */}
          <div>
            <label className="block text-sm font-bold text-[#32A8D7] mb-2">{t("company")}</label>
            <input required type="text" value={entreprise} onChange={(e) => setEntreprise(e.target.value)} className={inputClass} placeholder={t("companyPlaceholder")} />
          </div>

          {/* Type de travail */}
          <div>
            <label className="block text-sm font-bold text-[#32A8D7] mb-2">{t("contractType")}</label>
            <CustomSelect
              value={typeEmploi}
              onChange={setTypeEmploi}
              options={["CDI", "CDD", "Stage", "Freelance", "Alternance"]}
              className="w-full"
            />
          </div>

          {/* Lieu du travail */}
          <div>
            <label className="block text-sm font-bold text-[#32A8D7] mb-2">{t("workLocation")}</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <CustomSelect
                value={pays}
                onChange={(val) => {
                  setPays(val);
                  setVille("");
                }}
                placeholder={t("searchCountry") || "Sélectionner un pays"}
                options={[
                  { label: t("searchCountry") || "Sélectionner un pays", value: "" },
                  ...countriesList.map((c) => ({ label: c.name, value: c.isoCode })),
                ]}
                className="w-full"
              />
              {citiesList.length > 0 ? (
                <CustomSelect
                  value={ville}
                  onChange={(val) => setVille(val)}
                  disabled={!pays}
                  placeholder={t("city") || "Sélectionner une ville"}
                  options={[
                    { label: t("city") || "Sélectionner une ville", value: "" },
                    ...citiesList.map((city) => ({
                      label: city.name,
                      value: city.name,
                    })),
                  ]}
                  className="w-full"
                />
              ) : (
                <input
                  type="text"
                  value={ville}
                  onChange={(e) => setVille(e.target.value)}
                  className={inputClass}
                  placeholder={t("city") || "Ville"}
                />
              )}
            </div>
          </div>

          {/* Mode de travail */}
          <div>
            <label className="block text-sm font-bold text-[#32A8D7] mb-2">{t("workMode")}</label>
            <CustomSelect
              value={modeTravail}
              onChange={setModeTravail}
              options={["Temps plein", "Temps partiel", "Remote", "Hybride"]}
              className="w-full"
            />
          </div>

          {/* Durée de validité & Clôture automatique */}
          <div>
            <label className="block text-sm font-bold text-[#32A8D7] mb-2">
              Validité de l'offre (Clôture automatique)
            </label>
            <CustomSelect
              value={dureePublication}
              onChange={setDureePublication}
              options={[
                "30 jours (Recommandé)",
                "15 jours",
                "60 jours",
                "90 jours",
                "Date personnalisée",
                "Illimitée (Clôture manuelle)",
              ]}
              className="w-full"
            />
            {dureePublication === "Date personnalisée" && (
              <div className="mt-2.5 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Date de clôture
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={dateExpiration}
                    onChange={(e) => setDateExpiration(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Heure de clôture
                  </label>
                  <input
                    type="time"
                    value={heureExpiration}
                    onChange={(e) => setHeureExpiration(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-[#32A8D7] mb-2">{t("descriptionLabel")}</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className={`${inputClass} resize-none`} placeholder={t("descriptionPlaceholder")} />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              {t("cancel")}
            </button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-[#32A8D7] hover:bg-[#2896c2] text-white text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2">
              <Save size={15} /> {t("publishSubmit")}
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
  onProlonger: () => void;
}

function DetailOffreView({ emploi, onBack, onModifier, onSupprimer, onCloturer, onProlonger }: DetailOffreViewProps) {
  const t = useTranslations("recruiter.jobsTab");
  const locale = useLocale();
  const { data: applications = [] } = useSWR(`/api/applications?role=recruiter&jobOfferId=${emploi.id}`, fetcher);
  const candidates = Array.isArray(applications) ? applications.map((app: any) => ({
    id: app.talent?.userId || app.id,
    nom: app.talent?.user?.name || "Talent sans nom",
    localisation: t("unspecified"),
    profession: app.talent?.profession || "Candidat",
    avatar: app.talent?.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(app.talent?.user?.name || "T")}&background=random`,
    certifie: true,
  })) : [];

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <button onClick={onBack} className="hover:text-[#32A8D7] transition-colors">{t("home")}</button>
        <ChevronRight size={12} />
        <button onClick={onBack} className="hover:text-[#32A8D7] transition-colors">{t("jobOffers")}</button>
        <ChevronRight size={12} />
        <span className="text-slate-700 font-medium truncate max-w-[180px]">{emploi.titre || (emploi as any).title}</span>
      </nav>

      {/* Info card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <p className="text-xs text-slate-400 mb-1">
              {t("publishedOn")}{" "}
              <span className="font-semibold">{emploi.datePublication || ((emploi as any).createdAt ? new Date((emploi as any).createdAt).toLocaleDateString(locale === "en" ? "en-US" : "fr-FR") : t("recent"))}</span>
              &nbsp;·&nbsp;
              <span className="font-bold text-slate-700">{emploi._count?.applications || emploi.candidatures || 0} {t("candidates")}</span>
            </p>
            <h2 className="text-2xl font-extrabold text-[#32A8D7]">{emploi.titre || (emploi as any).title}</h2>
            <p className="text-sm text-slate-700 mt-0.5">
              <span className="font-semibold">{t("company")} :</span> {emploi.entreprise || (emploi as any).recruiter?.companyName}&nbsp;&nbsp;
              <span className="font-semibold">{t("locationLabel")}</span> {emploi.lieu || (emploi as any).location}
            </p>
          </div>
          <button 
            type="button"
            onClick={() => {
              const jobId = emploi.id;
              const url = `${window.location.origin}/dashboard/talent?tab=emplois&jobId=${jobId}`;
              if (navigator.share) {
                navigator.share({ title: emploi.titre || (emploi as any).title || "Offre d'emploi Netacuv", url }).catch(() => {});
              } else {
                navigator.clipboard?.writeText(url);
                alert(locale === "en" ? "Job offer link copied to clipboard!" : "Lien de l'offre copié dans le presse-papier !");
              }
            }}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-[#32A8D7] hover:border-[#32A8D7] transition-colors shrink-0 cursor-pointer"
            title={t("share") || "Partager l'offre"}
          >
            <Share2 size={18} />
          </button>
        </div>

        <div className="mt-3 space-y-1 text-sm text-slate-600">
          <p>{emploi.modeTravail || t("unspecified")}</p>
          <p>{emploi.taille || t("unspecified")}</p>
          <p>{t("contractType")} : {emploi.typeEmploi || (emploi as any).contractType}</p>
          <p>
            Compétences : {(emploi.competences || []).slice(0, 3).join(", ")}
            {(emploi.competences || []).length > 3 && ` ${t("andMore", { count: (emploi.competences || []).length - 3 })}`}
          </p>
        </div>

        {/* Status and Action Buttons */}
        {(() => {
          const isExpired = emploi.expiresAt && new Date(emploi.expiresAt) < new Date();
          const isClosed = emploi.status === "CLOSED" || isExpired;
          return (
            <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  !isClosed ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}>
                  {!isClosed ? (
                    <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Offre en cours</>
                  ) : (
                    <><Clock size={11} />Offre clôturée</>
                  )}
                </span>
                {emploi.expiresAt && (
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    isExpired ? "bg-red-50 text-red-600 border border-red-200" : "bg-sky-50 text-[#0071a2] border border-sky-100"
                  }`}>
                    {isExpired 
                      ? `Clôturée auto le ${new Date(emploi.expiresAt).toLocaleDateString("fr-FR")}` 
                      : `Clôture auto le ${new Date(emploi.expiresAt).toLocaleDateString("fr-FR")}`}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onProlonger}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Clock size={14} />
                  {isClosed ? "Prolonger & Réactiver" : "Prolonger l'offre"}
                </button>
                {!isClosed && (
                  <button
                    onClick={onCloturer}
                    className="px-4 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors border border-slate-200 cursor-pointer"
                  >
                    Clôturer définitivement
                  </button>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Description */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-base font-bold text-[#32A8D7] mb-4">{t("descriptionLabel")}</h3>
        <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
          {emploi.description}
        </div>
      </div>

      {/* Candidats postulés */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-base font-bold text-[#32A8D7] mb-1">{t("candidates")}</h3>
        <p className="text-sm text-slate-500 mb-5">{t("candidaturesReceived", { count: emploi._count?.applications || emploi.candidatures || 0 })}</p>
        {candidates.length === 0 ? (
          <div className="text-center py-8">
            <Users size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">{t("noCandidates")}</p>
            <p className="text-xs text-slate-400">{t("noCandidatesDesc")}</p>
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
          {t("delete")}
        </button>
        <button
          onClick={onModifier}
          className="flex-1 py-3 rounded-2xl bg-[#32A8D7] hover:bg-[#2896c2] text-white text-sm font-semibold shadow-sm transition-colors"
        >
          {t("edit")}
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
  const t = useTranslations("recruiter.jobsTab");
  const countriesList = Country.getAllCountries();

  const resolvedCountryCode = (() => {
    const raw = emploi.pays || (emploi as any).location?.split(",")?.slice(-1)[0]?.trim() || "BJ";
    const found = countriesList.find(c => c.isoCode.toLowerCase() === raw.toLowerCase() || c.name.toLowerCase() === raw.toLowerCase());
    return found ? found.isoCode : "BJ";
  })();

  const [titre, setTitre] = useState(emploi.titre || (emploi as any).title || "");
  const [entreprise, setEntreprise] = useState(emploi.entreprise || (emploi as any).recruiter?.companyName || "");
  const [pays, setPays] = useState(resolvedCountryCode);
  const [ville, setVille] = useState(emploi.ville || (emploi as any).location?.split(',')[0]?.trim() || "");
  const [typeEmploi, setTypeEmploi] = useState(emploi.typeEmploi || (emploi as any).contractType || "CDI");
  const [modeTravail, setModeTravail] = useState(emploi.modeTravail || "Temps plein");
  const [description, setDescription] = useState(emploi.description || (emploi as any).description || "");

  const citiesList = pays ? City.getCitiesOfCountry(pays) : [];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const countryObj = Country.getCountryByCode(pays);
    const countryName = countryObj ? countryObj.name : pays;
    const fullLocation = ville ? `${ville}, ${countryName}` : (countryName || "Non spécifié");
    onSave({ ...emploi, titre, entreprise, pays, ville, typeEmploi, modeTravail, description, lieu: fullLocation });
  };

  const sectionClass = "bg-white rounded-2xl border border-slate-100 shadow-sm p-6";
  const inputClass = "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none focus:border-[#32A8D7] focus:bg-white transition-colors";

  return (
    <form onSubmit={handleSave} className="space-y-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <button type="button" onClick={onBack} className="hover:text-[#32A8D7] transition-colors">{t("home")}</button>
        <ChevronRight size={12} />
        <button type="button" onClick={onBack} className="hover:text-[#32A8D7] transition-colors">{t("jobOffers")}</button>
        <ChevronRight size={12} />
        <span className="text-slate-700 font-medium truncate max-w-[180px]">{emploi.titre}</span>
      </nav>

      {/* Intitulé */}
      <div className={sectionClass}>
        <label className="block text-sm font-bold text-[#32A8D7] mb-3">{t("jobTitle")}</label>
        <input type="text" value={titre} onChange={(e) => setTitre(e.target.value)} className={inputClass} required />
      </div>

      {/* Entreprise */}
      <div className={sectionClass}>
        <label className="block text-sm font-bold text-[#32A8D7] mb-3">{t("company")}</label>
        <input type="text" value={entreprise} onChange={(e) => setEntreprise(e.target.value)} className={inputClass} required />
      </div>

      {/* Type de travail */}
      <div className={sectionClass}>
        <label className="block text-sm font-bold text-[#32A8D7] mb-3">{t("contractType")}</label>
        <CustomSelect
          value={typeEmploi}
          onChange={setTypeEmploi}
          options={["CDI", "CDD", "Stage", "Freelance", "Alternance"]}
          className="w-full"
        />
      </div>

      {/* Lieu */}
      <div className={sectionClass}>
        <label className="block text-sm font-bold text-[#32A8D7] mb-3">{t("workLocation")}</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CustomSelect
            value={pays}
            onChange={(val) => {
              setPays(val);
              setVille("");
            }}
            placeholder={t("searchCountry") || "Sélectionner un pays"}
            options={[
              { label: t("searchCountry") || "Sélectionner un pays", value: "" },
              ...countriesList.map((c) => ({ label: c.name, value: c.isoCode })),
            ]}
            className="w-full"
          />
          {citiesList.length > 0 ? (
            <CustomSelect
              value={ville}
              onChange={(val) => setVille(val)}
              disabled={!pays}
              placeholder={t("city") || "Sélectionner une ville"}
              options={[
                { label: t("city") || "Sélectionner une ville", value: "" },
                ...citiesList.map((city) => ({
                  label: city.name,
                  value: city.name,
                })),
              ]}
              className="w-full"
            />
          ) : (
            <input
              type="text"
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              className={inputClass}
              placeholder={t("city") || "Ville"}
            />
          )}
        </div>
      </div>

      {/* Mode de travail */}
      <div className={sectionClass}>
        <label className="block text-sm font-bold text-[#32A8D7] mb-3">{t("workMode")}</label>
        <CustomSelect
          value={modeTravail}
          onChange={setModeTravail}
          options={["Temps plein", "Temps partiel", "Remote", "Hybride"]}
          className="w-full"
        />
      </div>

      {/* Description */}
      <div className={sectionClass}>
        <label className="block text-sm font-bold text-[#32A8D7] mb-3">{t("descriptionLabel")}</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} className={`${inputClass} resize-none`} />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pb-4">
        <button type="button" onClick={onBack} className="flex-1 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
          {t("cancel")}
        </button>
        <button type="submit" className="flex-1 py-3 rounded-2xl bg-[#32A8D7] hover:bg-[#2896c2] text-white text-sm font-semibold shadow-sm transition-colors">
          {t("publishSave")}
        </button>
      </div>
    </form>
  );
}

// ─── Main EmploisTab ──────────────────────────────────────────────────────────

type EmploisView = "grid" | "detail" | "modifier";

export default function EmploisTab() {
  const t = useTranslations("recruiter.jobsTab");
  const locale = useLocale();
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const { data: emploisFetched, error, mutate } = useSWR(`/api/jobs?mine=true&page=${currentPage}&limit=${pageSize}`, fetcher);
  const emplois = Array.isArray(emploisFetched) ? emploisFetched : (emploisFetched?.jobs || []);
  const totalCount = emploisFetched?.totalCount ?? emploisFetched?.total ?? emplois.length;
  const totalPages = emploisFetched?.totalPages ?? Math.max(1, Math.ceil(totalCount / pageSize));
  const [view, setView] = useState<EmploisView>("grid");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleCreateClick = () => {
    const isAdmin = user?.role === "admin";
    if (!isAdmin && !user?.isPremium && emplois.length >= 1) {
      setShowLimitModal(true);
    } else {
      setShowModal(true);
    }
  };

  // Confirmation modals
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [confirmCloturerId, setConfirmCloturerId] = useState<number | null>(null);
  const [confirmActiverId, setConfirmActiverId] = useState<number | null>(null);
  const [prolongerJobId, setProlongerJobId] = useState<number | null>(null);
  const [prolongDays, setProlongDays] = useState<string>("30");
  const [prolongCustomDate, setProlongCustomDate] = useState<string>("");
  const [showPublishedSuccess, setShowPublishedSuccess] = useState(false);
  const [justPublishedId, setJustPublishedId] = useState<number | null>(null);

  const selectedEmploi = emplois.find((e: any) => e.id === selectedId) ?? null;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handlePublish = (data: Partial<Emploi>) => {
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
        showToast(t("jobDeletedToast"));
        if (view === "detail" || view === "modifier") {
          setView("grid");
          setSelectedId(null);
        }
      } else {
        showToast(t("errorDeleteToast"));
        setConfirmDeleteId(null);
      }
    } catch (error) {
      console.error(error);
      showToast(t("errorDeleteToast"));
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
        showToast(t("jobClosedToast") || "Offre clôturée définitivement.");
      } else {
        showToast(t("errorCloseToast") || "Erreur lors de la clôture.");
        setConfirmCloturerId(null);
      }
    } catch (error) {
      console.error(error);
      showToast(t("errorCloseToast") || "Erreur lors de la clôture.");
      setConfirmCloturerId(null);
    }
  };

  const confirmProlonger = async (id: number) => {
    try {
      const body: any = {};
      if (prolongDays === "custom" && prolongCustomDate) {
        body.expiresAt = new Date(prolongCustomDate).toISOString();
      } else {
        body.extendDays = parseInt(prolongDays) || 30;
      }
      body.status = "PUBLISHED";

      const res = await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        mutate();
        setProlongerJobId(null);
        showToast("Offre prolongée et réactivée avec succès !");
      } else {
        showToast("Erreur lors de la prolongation de l'offre.");
      }
    } catch (e) {
      showToast("Erreur lors de la prolongation.");
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
        showToast(t("jobUpdatedToast"));
        setView("detail");
      } else {
        showToast(t("errorUpdateToast"));
      }
    } catch (error) {
      console.error(error);
      showToast(t("errorUpdateToast"));
    }
  };

  const toggleStatus = async (id: number) => {
    const emp = emplois.find((e: any) => e.id === id);
    if (emp?.status === "PUBLISHED" || emp?.status === "Active") {
      setConfirmCloturerId(id);
    } else {
      setConfirmActiverId(id);
    }
    setOpenMenuId(null);
  };

  const confirmActiver = async (id: number) => {
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PUBLISHED" }),
      });
      if (res.ok) {
        mutate();
        showToast(t("jobReactivatedToast"));
      } else {
        showToast(t("errorReactivateToast"));
      }
    } catch (error) {
      console.error(error);
      showToast(t("errorReactivateToast"));
    } finally {
      setConfirmActiverId(null);
    }
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
          title={t("limitModalTitle")}
          message={t("limitModalMessage")}
          confirmLabel={t("understood")}
          cancelLabel={t("cancel")}
          onConfirm={() => setShowLimitModal(false)}
          onCancel={() => setShowLimitModal(false)}
        />
      )}

      {/* ── Confirmation: Supprimer offre ── */}
      {confirmDeleteId !== null && (
        <ConfirmModal
          title={t("deleteModalTitle")}
          message={t("deleteModalMessage")}
          confirmLabel={t("yesDelete")}
          cancelLabel={t("noContinue")}
          isDanger
          onConfirm={() => confirmDelete(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}

      {/* ── Confirmation: Clôturer offre ── */}
      {confirmCloturerId !== null && (
        <ConfirmModal
          title={t("closeModalTitle")}
          message={t("closeModalMessage")}
          confirmLabel={t("yesClose")}
          cancelLabel={t("noContinue")}
          isDanger
          onConfirm={() => confirmCloturer(confirmCloturerId)}
          onCancel={() => setConfirmCloturerId(null)}
        />
      )}

      {/* ── Confirmation: Activer offre ── */}
      {confirmActiverId !== null && (
        <ConfirmModal
          title={t("activateModalTitle") || "Activer l'offre d'emploi"}
          message={t("activateModalMessage") || "Êtes-vous sûr de vouloir réactiver et publier cette offre d'emploi aux talents ?"}
          confirmLabel={t("yesActivate") || "Oui, activer l'offre"}
          cancelLabel={t("noContinue") || "Annuler"}
          isDanger={false}
          onConfirm={() => confirmActiver(confirmActiverId)}
          onCancel={() => setConfirmActiverId(null)}
        />
      )}

      {/* ── Modal: Prolonger l'offre ── */}
      {prolongerJobId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-[#32A8D7] flex items-center justify-center font-bold">
                  <Calendar size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Prolonger la validité</h3>
                  <p className="text-xs text-slate-400">Définissez une nouvelle durée pour cette offre</p>
                </div>
              </div>
              <button
                onClick={() => setProlongerJobId(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 py-1">
              <label className="text-xs font-bold text-slate-700 block">
                Ajouter une période de validité :
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "+15 jours", val: "15" },
                  { label: "+30 jours (1 mois)", val: "30" },
                  { label: "+60 jours (2 mois)", val: "60" },
                  { label: "+90 jours (3 mois)", val: "90" },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => {
                      setProlongDays(opt.val);
                      setProlongCustomDate("");
                    }}
                    className={`p-2.5 text-xs font-semibold rounded-xl border text-left transition-all ${
                      prolongDays === opt.val
                        ? "border-[#32A8D7] bg-sky-50/50 text-[#0071a2]"
                        : "border-slate-200 hover:border-slate-300 text-slate-600"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <label className="text-xs font-medium text-slate-500 block mb-1.5">
                  Ou choisir une date limite précise :
                </label>
                <input
                  type="date"
                  value={prolongCustomDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    setProlongCustomDate(e.target.value);
                    setProlongDays("custom");
                  }}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#32A8D7]"
                />
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setProlongerJobId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => confirmProlonger(prolongerJobId)}
                className="flex-1 py-2.5 rounded-xl bg-[#32A8D7] hover:bg-[#2896c2] text-white text-xs font-semibold shadow-sm transition-colors"
              >
                Confirmer la prolongation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Success: Offre publiée ── */}
      {showPublishedSuccess && (
        <SuccessModal
          title={t("jobPublishedSuccess")}
          message={t("jobPublishedSuccessDesc")}
          primaryLabel={t("viewJob")}
          secondaryLabel={t("back")}
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
              <ArrowLeft size={16} /> {t("back")}
            </button>
          </div>
          <DetailOffreView
            emploi={selectedEmploi}
            onBack={backToGrid}
            onModifier={openModifier}
            onSupprimer={() => setConfirmDeleteId(selectedEmploi.id)}
            onCloturer={() => setConfirmCloturerId(selectedEmploi.id)}
            onProlonger={() => setProlongerJobId(selectedEmploi.id)}
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
              <ArrowLeft size={16} /> {t("backToDetail")}
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
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{t("createdJobs")}</p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-[#0071a2] text-xs font-bold rounded-full">
                <Briefcase size={11} />
                {t("totalJobs", { count: emplois.length })}
              </span>
            </div>
            <button
              onClick={handleCreateClick}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#32A8D7] hover:bg-[#2896c2] text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all"
            >
              <Plus size={16} /> {t("publishJob")}
            </button>
          </div>

          {/* Grid */}
          {emplois.length === 0 ? (
            <EmptyState
              type="offres"
              actionLabel={t("publishJob")}
              onAction={handleCreateClick}
            />
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
                      {emploi.status === "PUBLISHED" || emploi.status === "Active" ? t("active") : t("inactive")}
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
                        <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-20">
                          <button onClick={() => toggleStatus(emploi.id)} className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                            {(emploi.status === "Active" || emploi.status === "PUBLISHED") ? <Clock size={13} /> : <CheckCircle2 size={13} />}
                            {(emploi.status === "Active" || emploi.status === "PUBLISHED") ? t("closeOffer") : t("reopenOffer")}
                          </button>
                          <button onClick={() => { setProlongerJobId(emploi.id); setOpenMenuId(null); }} className="w-full text-left px-3.5 py-2 text-xs font-medium text-[#0071a2] hover:bg-sky-50 flex items-center gap-2">
                            <Calendar size={13} /> Prolonger l'offre
                          </button>
                          <button onClick={() => openDetail(emploi.id)} className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                            <Eye size={13} /> {t("viewDetail")}
                          </button>
                          <button onClick={() => { setConfirmDeleteId(emploi.id); setOpenMenuId(null); }} className="w-full text-left px-3.5 py-2 text-xs font-medium text-red-500 hover:bg-red-50 flex items-center gap-2">
                            <Trash2 size={13} /> {t("delete")}
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
                        <Users size={11} className="shrink-0" /><span>{t("applicationsCount", { count: emploi._count?.applications || emploi.candidatures || 0, s: (emploi._count?.applications || emploi.candidatures) !== 1 ? "s" : "" })}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Calendar size={11} className="shrink-0" /><span>{emploi.datePublication || ((emploi as any).createdAt ? new Date((emploi as any).createdAt).toLocaleDateString(locale === "en" ? "en-US" : "fr-FR") : "")}</span>
                      </div>
                      {emploi.expiresAt && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <Clock size={11} className="shrink-0 text-amber-500" />
                          <span>
                            Expire le {new Date(emploi.expiresAt).toLocaleDateString(locale === "en" ? "en-US" : "fr-FR")}
                            {new Date(emploi.expiresAt) < new Date() && (
                              <span className="ml-1 text-red-500 font-bold">(Expiré)</span>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card footer */}
                  <div className="px-4 pb-4">
                    <button
                      onClick={() => openDetail(emploi.id)}
                      className="w-full py-2.5 rounded-xl bg-[#f0f9ff] hover:bg-[#e0f3fc] text-[#0071a2] text-xs font-semibold border border-sky-100 hover:border-sky-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye size={13} /> {t("viewDetail")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            itemLabel={t("paginationItemLabel")}
            onPageChange={(page) => setCurrentPage(page)}
            className="mt-6 rounded-2xl border border-slate-100 shadow-xs"
          />
        </>
      )}
    </div>
  );
}
