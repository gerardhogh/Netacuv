"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Download, Eye } from "lucide-react";

export function TalentDetails({ talent, onBack }: { talent: any, onBack: () => void }) {
  const [activeTab, setActiveTab] = useState("Informations");

  const tabs = ["Informations", "Réseaux", "Vidéo Entretien"];

  return (
    <div className="animate-fade-in-up">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <button onClick={onBack} className="hover:text-slate-800 transition-colors">Accueil</button>
        <span>›</span>
        <button onClick={onBack} className="hover:text-slate-800 transition-colors">Liste des talents</button>
        <span>›</span>
        <span className="text-slate-800 font-semibold">Détails</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Sidebar */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center text-center shadow-sm">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md mb-4 relative">
              <Image src={talent.avatar || "/assets/avatar_africain.jpg"} alt={talent.name} fill className="object-cover object-center w-full h-full" />
            </div>
            <h2 className="text-xl font-black text-slate-900">{talent.name}</h2>
            <p className="text-slate-500 text-sm mb-4">{talent.domaine}</p>
            <div className="flex items-center gap-2 mb-6">
              {talent.status === "Actif" ? (
                <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold shadow-sm">Actif</span>
              ) : (
                <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-bold shadow-sm">{talent.status}</span>
              )}
              {talent.certifie && (
                <span className="px-3 py-1 bg-blue-100 text-[#32A8D7] rounded-full text-xs font-bold shadow-sm">Certifié</span>
              )}
            </div>
            <a 
              href={`https://mail.google.com/mail/?view=cm&fs=1&to=${talent.email}&su=Contact%20Check%20CV&body=Bonjour%20${talent.name},`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full block py-2.5 px-4 bg-white border border-[#32A8D7] text-[#32A8D7] rounded-lg font-bold hover:bg-[#32A8D7] hover:text-white transition-colors"
            >
              Envoyer un mail
            </a>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <p className="text-sm font-bold text-slate-800 mb-4">CV actualisé le {talent.date}</p>
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50 aspect-[1/1.4] relative mb-4 flex flex-col group">
              <div className="flex-1 relative">
                {talent.cvUrl ? (
                  <iframe
                    src={`${talent.cvUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                    className="w-full h-full rounded border-0 bg-white pointer-events-none"
                    title="Aperçu du CV"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full text-slate-400 p-6">
                    <span className="text-sm font-medium">Aucun CV disponible</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold text-sm transition-colors">
                <Download size={16} className="text-red-500" /> Télécharger le pdf
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-[#32A8D7] text-white rounded-lg font-semibold text-sm hover:bg-[#2892bd] transition-colors">
                Prévisualiser
              </button>
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="w-full lg:w-2/3 bg-white rounded-xl border border-slate-200 p-6 shadow-sm min-h-[500px]">
          <div className="flex bg-slate-50 p-1 rounded-xl mb-6">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${activeTab === tab ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "Informations" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Prénom</label>
                <input readOnly type="text" value={talent.firstName} className="w-full bg-slate-50 border-none rounded-lg p-3 text-sm text-slate-600 focus:ring-0" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nom</label>
                <input readOnly type="text" value={talent.lastName} className="w-full bg-slate-50 border-none rounded-lg p-3 text-sm text-slate-600 focus:ring-0" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Titre professionnel</label>
                <input readOnly type="text" value={talent.domaine} className="w-full bg-slate-50 border-none rounded-lg p-3 text-sm text-slate-600 focus:ring-0" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nom d&apos;utilisateur</label>
                <input readOnly type="text" value={talent.username} className="w-full bg-slate-50 border-none rounded-lg p-3 text-sm text-slate-600 focus:ring-0" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Sexe H/F</label>
                <input readOnly type="text" value={talent.gender} className="w-full bg-slate-50 border-none rounded-lg p-3 text-sm text-slate-600 focus:ring-0" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Types d&apos;opportunités recherchées</label>
                <input readOnly type="text" value={talent.opportunity} className="w-full bg-slate-50 border-none rounded-lg p-3 text-sm text-slate-600 focus:ring-0" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Pays/Nationalité</label>
                <input readOnly type="text" value={talent.country} className="w-full bg-slate-50 border-none rounded-lg p-3 text-sm text-slate-600 focus:ring-0" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Ville</label>
                <input readOnly type="text" value={talent.location} className="w-full bg-slate-50 border-none rounded-lg p-3 text-sm text-slate-600 focus:ring-0" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Numéro de téléphone</label>
                <input readOnly type="text" value={talent.contact} className="w-full bg-slate-50 border-none rounded-lg p-3 text-sm text-slate-600 focus:ring-0" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                <input readOnly type="text" value={talent.email} className="w-full bg-slate-50 border-none rounded-lg p-3 text-sm text-slate-600 focus:ring-0" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Biographie</label>
                <textarea readOnly value={talent.bio} rows={3} className="w-full bg-slate-50 border-none rounded-lg p-3 text-sm text-slate-600 focus:ring-0 resize-none" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Compétences clés</label>
                <input readOnly type="text" value={talent.skills} className="w-full bg-slate-50 border-none rounded-lg p-3 text-sm text-slate-600 focus:ring-0" />
              </div>
            </div>
          )}

          {activeTab === "Réseaux" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center text-white font-bold font-serif">f</div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-xs text-slate-500 font-semibold">Facebook</span>
                    <span className="text-sm font-medium text-slate-800 truncate">{talent.socials?.facebook || "Non renseigné"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-[#0A66C2] flex items-center justify-center text-white font-bold">in</div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-xs text-slate-500 font-semibold">LinkedIn</span>
                    <span className="text-sm font-medium text-slate-800 truncate">{talent.socials?.linkedin || "Non renseigné"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white font-bold">X</div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-xs text-slate-500 font-semibold">Twitter</span>
                    <span className="text-sm font-medium text-slate-800 truncate">{talent.socials?.twitter || "Non renseigné"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-[#E60023] flex items-center justify-center text-white font-bold font-serif">P</div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-xs text-slate-500 font-semibold">Pinterest</span>
                    <span className="text-sm font-medium text-slate-800 truncate">{talent.socials?.pinterest || "Non renseigné"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-[#1769FF] flex items-center justify-center text-white font-bold text-[10px]">Be</div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-xs text-slate-500 font-semibold">Behance</span>
                    <span className="text-sm font-medium text-slate-800 truncate">{talent.socials?.behance || "Non renseigné"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === "Vidéo Entretien" && (
            <div className="flex flex-col items-center justify-center min-h-[300px]">
              {talent.videoUrl ? (
                <div className="w-full bg-black rounded-xl aspect-[16/9] overflow-hidden shadow-md relative border border-slate-200">
                  <video 
                    src={talent.videoUrl} 
                    controls 
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="text-center text-slate-500 py-20 bg-slate-50 rounded-xl border border-slate-100 w-full">
                  <p className="font-medium text-sm">Aucune vidéo d'entretien disponible</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
