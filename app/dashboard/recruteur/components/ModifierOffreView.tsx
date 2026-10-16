"use client";

import { useState } from "react";
import { ArrowLeft, Save, X } from "lucide-react";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { useTranslations, useLocale } from "next-intl";

export interface OffreData {
  id: string | number;
  titre: string;
  entreprise: string;
  typeEmploi: string;
  pays: string;
  ville: string;
  modeEmploi: string;
  description: string;
}

interface ModifierOffreViewProps {
  offre?: OffreData;
  onBack: () => void;
  onSave?: (offre: OffreData) => void;
}

export default function ModifierOffreView({ offre, onBack, onSave }: ModifierOffreViewProps) {
  const t = useTranslations("recruiter.editJob");
  const locale = useLocale();
  const [titre, setTitre] = useState(offre?.titre || (locale === "en" ? "Front-end Developer" : "Développeur Front-end"));
  const [entreprise, setEntreprise] = useState(offre?.entreprise || "TechAfrique");
  const [typeEmploi, setTypeEmploi] = useState(offre?.typeEmploi || "CDI");
  const [pays, setPays] = useState(offre?.pays || "Benin");
  const [ville, setVille] = useState(offre?.ville || "Cotonou");
  const [modeEmploi, setModeEmploi] = useState(offre?.modeEmploi || (locale === "en" ? "Part-time" : "Temps partiel"));
  const [description, setDescription] = useState(
    offre?.description ||
      (locale === "en" 
        ? "We are seeking a passionate and talented Front-end developer to join our dynamic team. You will participate in the design and development of modern, responsive user interfaces."
        : "Nous recherchons un développeur Front-end passionné et talentueux pour rejoindre notre équipe dynamique. Vous participerez à la conception et au développement de nos interfaces utilisateur modernes et réactives.")
  );

  const handleSave = () => {
    onSave?.({
      id: offre?.id || Date.now(),
      titre,
      entreprise,
      typeEmploi,
      pays,
      ville,
      modeEmploi,
      description,
    });
    onBack();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
          aria-label={t("back")}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t("title")}</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {locale === "en" ? "Update your job offer information" : "Mettez à jour les informations de votre offre d'emploi"}
          </p>
        </div>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Intitulé du poste */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {t("jobTitle")} <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm font-medium outline-none focus:border-[#32A8D7] focus:bg-white transition-colors placeholder:text-slate-400"
              placeholder={locale === "en" ? "e.g. Front-end Developer" : "Ex: Développeur Front-end"}
            />
          </div>

          {/* Entreprise */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {t("company")} <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={entreprise}
              onChange={(e) => setEntreprise(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm font-medium outline-none focus:border-[#32A8D7] focus:bg-white transition-colors placeholder:text-slate-400"
              placeholder={locale === "en" ? "Company name" : "Nom de l'entreprise"}
            />
          </div>

          {/* Type de travail */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {t("contractType")}
            </label>
            <CustomSelect
              value={typeEmploi}
              onChange={setTypeEmploi}
              options={["CDI", "CDD", "Stage", "Freelance", "Alternance", "Intérim"]}
              className="w-full"
            />
          </div>

          {/* Lieu du travail – Pays */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {t("country")}
            </label>
            <CustomSelect
              value={pays}
              onChange={setPays}
              options={[
                { label: "Bénin", value: "Benin" },
                { label: "Côte d'Ivoire", value: "Cote d'Ivoire" },
                { label: "Sénégal", value: "Senegal" },
                { label: "Togo", value: "Togo" },
                { label: "Cameroun", value: "Cameroun" },
                { label: "France", value: "France" },
              ]}
              className="w-full"
            />
          </div>

          {/* Ville */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {t("city")}
            </label>
            <input
              type="text"
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm font-medium outline-none focus:border-[#32A8D7] focus:bg-white transition-colors placeholder:text-slate-400"
              placeholder={locale === "en" ? "e.g. Cotonou" : "Ex: Cotonou"}
            />
          </div>

          {/* Mode de travail */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {t("workMode")}
            </label>
            <div className="flex flex-wrap gap-3">
              {[
                { fr: "Temps plein", en: "Full-time" },
                { fr: "Temps partiel", en: "Part-time" },
                { fr: "Télétravail", en: "Remote" },
                { fr: "Hybride", en: "Hybrid" },
                { fr: "Sur site", en: "On-site" },
              ].map((item) => {
                const label = locale === "en" ? item.en : item.fr;
                return (
                  <button
                    key={item.fr}
                    type="button"
                    onClick={() => setModeEmploi(label)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                      modeEmploi === label || modeEmploi === item.fr
                        ? "bg-[#32A8D7] text-white border-[#32A8D7] shadow-sm"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:border-[#32A8D7]/50 hover:text-[#32A8D7]"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {t("description")} <span className="text-red-400">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm font-medium outline-none focus:border-[#32A8D7] focus:bg-white transition-colors resize-none placeholder:text-slate-400"
              placeholder={locale === "en" ? "Describe the position, missions, required profile..." : "Décrivez le poste, les missions, le profil recherché..."}
            />
            <p className="text-xs text-slate-400 mt-1.5">{description.length} {locale === "en" ? "characters" : "caractères"}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            <X size={15} />
            {t("cancel")}
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#32A8D7] hover:bg-[#2896c2] text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all"
          >
            <Save size={15} />
            {t("save")}
          </button>
        </div>
      </div>
    </div>
  );
}
