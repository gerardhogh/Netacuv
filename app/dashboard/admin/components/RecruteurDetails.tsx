"use client";
import React, { useState } from "react";
import Image from "next/image";

export function RecruteurDetails({ recruteur, onBack }: { recruteur: any, onBack: () => void }) {
  const [activeTab, setActiveTab] = useState("Informations");

  return (
    <div className="animate-fade-in-up">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <button onClick={onBack} className="hover:text-slate-800 transition-colors">Accueil</button>
        <span>›</span>
        <button onClick={onBack} className="hover:text-slate-800 transition-colors">Liste des recruteurs</button>
        <span>›</span>
        <span className="text-slate-800 font-semibold">Détails</span>
      </div>

      <div className="w-full space-y-6">
        {/* Avatar section */}
        <div className="flex justify-center">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center gap-4 w-60">
            <div className="w-28 h-28 rounded-full bg-blue-50 border-4 border-white shadow-md relative flex items-center justify-center">
              <div className="w-full h-full rounded-full overflow-hidden relative bg-gradient-to-b from-blue-100 to-blue-200 flex items-center justify-center">
                {recruteur.logo ? (
                  <Image src={recruteur.logo} alt={recruteur.name} fill className="object-cover object-center w-full h-full" />
                ) : (
                  <div className="text-4xl font-black text-[#1E4D7B]">{recruteur.name.substring(0, 1).toUpperCase()}</div>
                )}
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-lg font-bold text-slate-800">{recruteur.name}</h2>
              <p className="text-sm text-slate-500 font-medium">Recruteur</p>
            </div>
          </div>
        </div>
        
        {/* Tab card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden w-full">
          {/* Tab nav */}
          <div className="flex border-b border-slate-100">
            {["Informations", "Réseaux"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3.5 text-sm font-semibold transition-colors capitalize ${
                  activeTab === tab
                    ? "bg-white text-slate-900 border-b-2 border-[#32A8D7]"
                    : "bg-slate-50 text-slate-400 hover:text-slate-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-6">
            {activeTab === "Informations" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-1.5">Nom de l'entreprise</label>
                  <input readOnly type="text" value={recruteur.name} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1.5">Secteur d'activité</label>
                  <input readOnly type="text" value={recruteur.secteur || "Non renseigné"} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1.5">Email de contact</label>
                  <input readOnly type="text" value={recruteur.email} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1.5">Téléphone</label>
                  <input readOnly type="text" value={recruteur.contact} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1.5">Site web</label>
                  <input readOnly type="text" value={recruteur.website || "Non renseigné"} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1.5">Adresse</label>
                  <input readOnly type="text" value={recruteur.address || "Non renseigné"} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1.5">Description de l'entreprise</label>
                  <textarea readOnly value={recruteur.description || "Non renseigné"} rows={3} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none resize-none" />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1.5">Compétences clés</label>
                  <input readOnly type="text" value={recruteur.skills || "Non renseigné"} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none" />
                </div>
              </div>
            )}

            {activeTab === "Réseaux" && (
              <div className="text-center text-slate-500 py-20">
                Contenu des réseaux sociaux
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
