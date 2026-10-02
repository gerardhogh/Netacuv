"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  Mail,
  Download,
  Eye,
  Video,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Share2,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import PremiumRequiredModal from "@/app/components/PremiumRequiredModal";

export interface CandidatData {
  id: string | number;
  name: string;
  profession: string;
  location: string;
  email?: string;
  phone?: string;
  imageUrl?: string;
  cvUrl?: string;
  videoUrl?: string;
  status?: "Accepté" | "En attente" | "Rejeté";
}

interface FullCandidatProfile {
  id: string | number;
  name: string;
  email: string;
  contact: string;
  date: string;
  status: string;
  videoUrl?: string;
  domaine: string;
  location: string;
  profession: string;
  bio: string;
  imageUrl: string;
  isVerified: boolean;
  skills: string[];
  gender: string;
  interviewSession?: {
    id: string;
    status: string;
    videoRecordings?: string;
    aiScore?: number;
    aiFeedback?: string;
  } | null;
  cvUrl?: string;
}

interface CandidatProfilDetailProps {
  candidat?: CandidatData;
  onBack: () => void;
  onSendEmail?: (email: string, name: string) => void;
}

export default function CandidatProfilDetail({
  candidat,
  onBack,
  onSendEmail,
}: CandidatProfilDetailProps) {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<"informations" | "reseaux" | "video">("informations");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [fullProfile, setFullProfile] = useState<FullCandidatProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Fetch full data if candidat.id is provided
  useEffect(() => {
    if (candidat?.id) {
      setIsLoading(true);
      fetch(`/api/talents/${candidat.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) {
            setFullProfile(data);
          }
          setIsLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setIsLoading(false);
        });
    }
  }, [candidat?.id]);

  const name = fullProfile?.name || candidat?.name || "Alicia PARKER";
  const profession = fullProfile?.profession || candidat?.profession || "Développeur Frontend";
  const email = fullProfile?.email || candidat?.email || "jean.dossou@mail.com";
  const phone = fullProfile?.contact || candidat?.phone || "+229 01 91 49 61 67";
  const imageUrl = fullProfile?.imageUrl || candidat?.imageUrl || "/assets/candidate-alicia-parker.jpg";
  
  let finalVideoUrl = fullProfile?.videoUrl;
  if (fullProfile?.interviewSession?.videoRecordings) {
    try {
      const parsed = JSON.parse(fullProfile.interviewSession.videoRecordings);
      if (Array.isArray(parsed) && parsed.length > 0) {
        finalVideoUrl = parsed[0];
      } else if (typeof parsed === 'string') {
        finalVideoUrl = parsed;
      }
    } catch (e) {
      finalVideoUrl = fullProfile.interviewSession.videoRecordings;
    }
  }

  const showNotification = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleDownloadCv = () => {
    const url = fullProfile?.cvUrl || candidat?.cvUrl;
    if (url) {
      window.open(url, "_blank");
      showNotification("Téléchargement du CV au format PDF en cours...");
    } else {
      showNotification("Aucun CV disponible pour ce candidat.");
    }
  };

  const handlePreviewCv = () => {
    const url = fullProfile?.cvUrl || candidat?.cvUrl;
    if (url) {
      window.open(url, "_blank");
      showNotification("Ouverture de l'aperçu du document CV...");
    } else {
      showNotification("Aucun CV disponible pour ce candidat.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm animate-fade-in border border-slate-700">
          <CheckCircle size={18} className="text-green-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Breadcrumb & Retour */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
          <button
            type="button"
            onClick={onBack}
            className="hover:text-[#32A8D7] transition-colors"
          >
            Accueil
          </button>
          <span>&rsaquo;</span>
          <button
            type="button"
            onClick={onBack}
            className="hover:text-[#32A8D7] transition-colors"
          >
            Liste des candidatures
          </button>
          <span>&rsaquo;</span>
          <span className="text-slate-800 font-bold">Profil du talent</span>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#32A8D7] hover:underline"
        >
          <ArrowLeft size={16} />
          Retour à la liste
        </button>
      </div>

      {/* Layout principal : Colonne Gauche (Profil + CV) & Colonne Droite (3 Tabs) */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">

        {/* ── COLONNE GAUCHE ── */}
        <div className="space-y-6">

          {/* Carte Résumé Profil */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col items-center text-center">
            <div className="relative w-28 h-28 rounded-full overflow-hidden mb-4 ring-4 ring-pink-100 bg-pink-100">
              <Image
                src={imageUrl}
                alt={name}
                fill
                sizes="112px"
                className="object-cover"
              />
            </div>

            <h2 className="text-lg font-bold text-slate-900 leading-snug">
              {name}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5 mb-3">
              {profession}
            </p>

            <div className="flex items-center gap-2 mb-5">
              <span className="text-[11px] font-bold px-3 py-0.5 rounded-md bg-emerald-500 text-white">
                Actif
              </span>
              <span className="text-[11px] font-bold px-3 py-0.5 rounded-md bg-sky-50 text-[#32A8D7] border border-sky-200">
                Certifié
              </span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                if (!user?.isPremium) {
                  setShowPremiumModal(true);
                  return;
                }
                if (onSendEmail) {
                  onSendEmail(email, name);
                } else {
                  const subject = encodeURIComponent(`Contact Candidat ${name}`);
                  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}`;
                  window.open(gmailUrl, "_blank", "noopener,noreferrer");
                }
              }}
              className={`w-full py-2.5 px-4 text-xs font-semibold rounded-lg transition-colors shadow-xs ${
                !user?.isPremium
                  ? 'bg-slate-50 border border-slate-200 text-slate-400 cursor-not-allowed opacity-70'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Envoyer un mail
            </button>
          </div>

          {/* Carte CV actualisé */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-700">
              CV actualisé le 21 avril 2025
            </h3>

            {/* Document Preview */}
            <div className="relative w-full aspect-[1/1.3] rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shadow-inner group">
              {(fullProfile?.cvUrl || candidat?.cvUrl) ? (
                <iframe
                  src={`${fullProfile?.cvUrl || candidat?.cvUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                  className="w-full h-full rounded border-0 bg-white pointer-events-none"
                  title="Aperçu du CV"
                />
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full text-slate-400 p-6">
                  <span className="text-sm font-medium">Aucun CV disponible</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3">
                <span className="text-[11px] text-white font-medium bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded">
                  Document certifié Netacuv
                </span>
              </div>
            </div>

            {/* Actions CV */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleDownloadCv}
                className="flex-1 py-2 px-2 text-[11px] font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Download size={13} className="text-red-500" />
                Télécharger le pdf
              </button>
              <button
                type="button"
                onClick={handlePreviewCv}
                className="flex-1 py-2 px-2 text-[11px] font-semibold text-white bg-[#32A8D7] hover:bg-[#2896c2] rounded-md transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Eye size={13} />
                Prévisualiser
              </button>
            </div>
          </div>

        </div>

        {/* ── COLONNE DROITE : TABS DU PROFIL ── */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col">

          {/* Onglets navigation supérieure */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl mb-8 max-w-lg">
            <button
              type="button"
              onClick={() => setActiveSubTab("informations")}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
                activeSubTab === "informations"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Informations
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab("reseaux")}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
                activeSubTab === "reseaux"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Réseaux
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab("video")}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
                activeSubTab === "video"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Vidéo Entretien
            </button>
          </div>

          {/* ── SUB-TAB 1 : INFORMATIONS ── */}
          {activeSubTab === "informations" && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Prénom
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={name?.split(" ")[0] || "Non spécifié"}
                    className="w-full bg-slate-100 border border-slate-200/80 rounded-md py-2.5 px-3.5 text-xs text-slate-800 font-medium outline-none cursor-default"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Nom
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={name?.split(" ").slice(1).join(" ") || "Non spécifié"}
                    className="w-full bg-slate-100 border border-slate-200/80 rounded-md py-2.5 px-3.5 text-xs text-slate-800 font-medium outline-none cursor-default"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Titre professionnel
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={profession}
                    className="w-full bg-slate-100 border border-slate-200/80 rounded-md py-2.5 px-3.5 text-xs text-slate-800 font-medium outline-none cursor-default"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Nom d'utilisateur
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={name?.toLowerCase().replace(/\s+/g, '') || "user"}
                    className="w-full bg-slate-100 border border-slate-200/80 rounded-md py-2.5 px-3.5 text-xs text-slate-800 font-medium outline-none cursor-default"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Sexe H/F
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={fullProfile?.gender || "Non précisé"}
                    className="w-full bg-slate-100 border border-slate-200/80 rounded-md py-2.5 px-3.5 text-xs text-slate-800 font-medium outline-none cursor-default"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Profession / Domaine
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={fullProfile?.domaine || profession}
                    className="w-full bg-slate-100 border border-slate-200/80 rounded-md py-2.5 px-3.5 text-xs text-slate-800 font-medium outline-none cursor-default"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Localisation
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={fullProfile?.location || candidat?.location || "Non spécifié"}
                    className="w-full bg-slate-100 border border-slate-200/80 rounded-md py-2.5 px-3.5 text-xs text-slate-800 font-medium outline-none cursor-default"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Numéro de téléphone
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={phone}
                    className="w-full bg-slate-100 border border-slate-200/80 rounded-md py-2.5 px-3.5 text-xs text-slate-800 font-medium outline-none cursor-default"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={email}
                    className="w-full bg-slate-100 border border-slate-200/80 rounded-md py-2.5 px-3.5 text-xs text-slate-800 font-medium outline-none cursor-default"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Biographie
                </label>
                <textarea
                  readOnly
                  rows={3}
                  value={fullProfile?.bio || "Aucune biographie disponible."}
                  className="w-full bg-slate-100 border border-slate-200/80 rounded-md p-3.5 text-xs text-slate-800 font-medium outline-none cursor-default resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Compétences clés
                </label>
                <input
                  type="text"
                  readOnly
                  value={fullProfile?.skills?.join(", ") || "Non spécifié"}
                  className="w-full bg-slate-100 border border-slate-200/80 rounded-md py-2.5 px-3.5 text-xs text-slate-800 font-medium outline-none cursor-default"
                />
              </div>
            </div>
          )}

          {/* ── SUB-TAB 2 : RÉSEAUX ── */}
          {activeSubTab === "reseaux" && (
            <div className="space-y-4 animate-fade-in max-w-2xl">
              {[
                { label: "Facebook", prefix: "https://web.facebook.com/gerardhounnou.gh", color: "text-blue-600" },
                { label: "LinkedIn", prefix: "https://web.facebook.com/gerardhounnou.gh", color: "text-sky-700" },
                { label: "Twitter", prefix: "https://web.facebook.com/gerardhounnou.gh", color: "text-slate-900" },
                { label: "Pinterest", prefix: "https://web.facebook.com/gerardhounnou.gh", color: "text-red-600" },
                { label: "Behance", prefix: "https://web.facebook.com/gerardhounnou.gh", color: "text-blue-500" },
              ].map((network) => (
                <div key={network.label} className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className={`w-28 text-xs font-bold ${network.color}`}>
                    {network.label} :
                  </span>
                  <input
                    type="text"
                    readOnly
                    value={network.prefix}
                    className="flex-1 bg-white border border-slate-200 rounded-md py-2.5 px-3.5 text-xs text-slate-700 font-medium outline-none hover:border-slate-300"
                  />
                </div>
              ))}
            </div>
          )}

          {/* ── SUB-TAB 3 : VIDÉO ENTRETIEN ── */}
          {activeSubTab === "video" && (
            <div className="space-y-6 animate-fade-in">
              {/* Header de section vidéo */}
              <div className="flex items-center gap-2.5 text-[#32A8D7]">
                <Video size={22} />
                <h3 className="text-base font-bold text-[#0071a2]">
                  Entretien vidéo de {name}
                </h3>
              </div>

              {/* Texte explicatif officiel */}
              <div className="p-4 sm:p-5 rounded-xl bg-sky-50/60 border border-sky-100 text-xs text-slate-700 space-y-3 leading-relaxed">
                <p>
                  Ce test est constitué de 20 questions avec une variation de temps pour répondre. Les talents disposent de 3 tentatives. En cas d'annulation, l'entretien recommence depuis le début.
                </p>
                <p>
                  Si les 3 tentatives ont étés annulées sans succès, ils devront attendre 3 jours avant de pouvoir réessayer.
                </p>
                <p className="font-bold italic text-slate-800">
                  Bon visionnage à vous !
                </p>
              </div>

              {/* Lecteur Vidéo interactif avec la vidéo enregistrée par le talent */}
              {finalVideoUrl ? (
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 shadow-xl border border-slate-200 flex flex-col">
                  <video
                    src={finalVideoUrl}
                    controls
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="relative w-full aspect-video rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400">
                  <Video size={48} className="mb-4 opacity-50" />
                  <p className="text-sm font-medium">Aucune vidéo d'entretien disponible</p>
                </div>
              )}

              {/* AI Score and Feedback (if available) */}
              {fullProfile?.interviewSession?.aiScore !== undefined && fullProfile?.interviewSession?.aiScore !== null && (
                <div className="mt-6 p-5 rounded-xl bg-indigo-50/60 border border-indigo-100">
                  <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-2 mb-3">
                    <CheckCircle size={18} className="text-indigo-500" />
                    Évaluation de l'IA Netacuv
                  </h4>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-shrink-0 w-16 h-16 rounded-full bg-white border-2 border-indigo-200 flex items-center justify-center shadow-sm">
                      <span className="text-lg font-black text-indigo-600">{fullProfile.interviewSession.aiScore}%</span>
                    </div>
                    <div className="text-xs text-slate-700 leading-relaxed">
                      Ce score est calculé par notre intelligence artificielle en analysant la pertinence des réponses, le langage corporel, et la clarté de l'expression.
                    </div>
                  </div>
                  {fullProfile.interviewSession.aiFeedback && (
                    <div className="bg-white rounded-lg p-4 border border-indigo-50 text-xs text-slate-700 leading-relaxed shadow-sm">
                      <strong className="text-indigo-800 block mb-1">Résumé de l'analyse :</strong>
                      {fullProfile.interviewSession.aiFeedback}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {showPremiumModal && (
        <PremiumRequiredModal 
          onClose={() => setShowPremiumModal(false)} 
          message="Passez au plan Premium pour contacter ce talent et consulter ses informations détaillées."
        />
      )}
    </div>
  );
}
