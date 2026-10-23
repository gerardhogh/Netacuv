"use client";

import { useState } from "react";
import useSWR from "swr";
import { QRCodeSVG } from "qrcode.react";
import {
  Users,
  Copy,
  Check,
  TrendingUp,
  Wallet,
  Gift,
  ChevronDown,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  QrCode,
  ShieldCheck,
  Flame,
  Share2,
  Sparkles,
  Info,
  CheckCircle2,
} from "lucide-react";

interface Affilie {
  id: string | number;
  name: string;
  email: string;
  dateInscription: string;
  step1Registered?: boolean;
  step2Premium?: boolean;
  step3ProfileComplete?: boolean;
  isEligible?: boolean;
  statut: "Validé" | "En attente" | "Profil incomplet" | "Inscrit" | "Inactif";
  gain: number;
}

interface RetraitModalProps {
  cagnotte: number;
  onClose: () => void;
  onConfirm: (montant: number, operateur: string, numero: string) => void;
}

function RetraitModal({ cagnotte, onClose, onConfirm }: RetraitModalProps) {
  const [montant, setMontant] = useState("");
  const [operateur, setOperateur] = useState("MTN Mobile Money");
  const [numero, setNumero] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(Number(montant), operateur, numero);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Retrait Mobile Money</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Solde disponible : <span className="font-bold text-emerald-600">{cagnotte.toLocaleString()} FCFA</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200/60 rounded-xl text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Opérateur Mobile</label>
            <div className="relative">
              <select
                value={operateur}
                onChange={(e) => setOperateur(e.target.value)}
                className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none focus:border-[#32A8D7] focus:bg-white transition-colors cursor-pointer font-medium"
              >
                <option>MTN Mobile Money</option>
                <option>Moov Money</option>
                <option>Wave</option>
                <option>Orange Money</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Numéro de téléphone</label>
            <input
              required
              type="tel"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none focus:border-[#32A8D7] focus:bg-white transition-colors"
              placeholder="+229 97 00 00 00"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Montant à retirer (FCFA)</label>
            <input
              required
              type="number"
              min={500}
              max={cagnotte}
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none focus:border-[#32A8D7] focus:bg-white transition-colors"
              placeholder="Ex : 1000"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Minimum : 500 FCFA · Maximum : {cagnotte.toLocaleString()} FCFA
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={Number(montant) < 500 || Number(montant) > cagnotte}
              className="flex-1 py-2.5 rounded-xl bg-[#32A8D7] hover:bg-[#2896c2] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold shadow-md transition-all cursor-pointer"
            >
              Confirmer le retrait
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface AffiliationProgramProps {
  role?: "talent" | "recruteur";
}

export default function AffiliationProgram({ role = "talent" }: AffiliationProgramProps) {
  const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then((res) => res.json());
  const { data, mutate } = useSWR("/api/affiliation/me", fetcher);

  const cagnotte: number = data?.cagnotte || 0;
  const referralCode: string = data?.referralCode || "";
  const affilies: Affilie[] = data?.affilies || [];
  const dailyCount: number = data?.dailyReferralsCount || 0;
  const dailyLimit: number = data?.dailyLimit || 15;
  const bonusPerReferral: number = data?.bonusPerReferral || 25;
  const monthlyMaxPotential: number = data?.monthlyMaxPotential || 11250;

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://netacuv.com";
  const referralLink = referralCode
    ? `${origin}/inscription?ref=${referralCode}`
    : `${origin}/inscription`;

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showRetraitModal, setShowRetraitModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCopyCode = () => {
    if (!referralCode) return;
    navigator.clipboard?.writeText(referralCode).catch(() => {});
    setCopiedCode(true);
    showToast("Code de parrainage copié !");
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyLink = () => {
    if (!referralLink) return;
    navigator.clipboard?.writeText(referralLink).catch(() => {});
    setCopiedLink(true);
    showToast("Lien d'invitation copié dans le presse-papier !");
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById("affiliation-qrcode");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = `qrcode-parrainage-${referralCode || "netacuv"}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
    showToast("QR Code téléchargé avec succès !");
  };

  const handleRetrait = async (montant: number, operateur: string, numero: string) => {
    setShowRetraitModal(false);
    try {
      const res = await fetch("/api/affiliation/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ montant, operateur, numero }),
      });
      if (res.ok) {
        showToast(`Demande de retrait de ${montant.toLocaleString()} FCFA via ${operateur} enregistrée !`);
        mutate();
      } else {
        const err = await res.json();
        showToast(err.error || "Erreur lors du retrait.");
      }
    } catch (e) {
      showToast("Erreur de connexion.");
    }
  };

  const valides = affilies.filter((a) => a.statut === "Validé" || a.statut === "Inscrit").length;
  const enAttente = affilies.filter((a) => a.statut !== "Validé" && a.statut !== "Inscrit").length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-4 duration-200 border border-slate-700">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Modal de Retrait */}
      {showRetraitModal && (
        <RetraitModal
          cagnotte={cagnotte}
          onClose={() => setShowRetraitModal(false)}
          onConfirm={handleRetrait}
        />
      )}

      {/* ── BANNIÈRE D'EN-TÊTE ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#072444] via-[#093259] to-[#04162a] p-6 sm:p-8 text-white border border-sky-400/20 shadow-xl">
        <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 bg-[#32A8D7]/20 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-400/10 border border-sky-400/25 text-sky-300 text-xs font-semibold mb-3">
              <Sparkles size={13} className="text-[#32A8D7]" />
              <span>Programme de Parrainage & Affiliation Officiel</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Gagnez des récompenses en agrandissant Netacuv
            </h1>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Invitez vos confrères {role === "recruteur" ? "recruteurs et entreprises" : "talents et professionnels"} à rejoindre la plateforme. 
              Partagez votre code ou votre QR code et touchez vos gains directement via Mobile Money.
            </p>
          </div>

          <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col items-center sm:items-end shrink-0 w-full md:w-auto">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Cagnotte disponible</span>
            <div className="text-3xl font-black text-emerald-400 mt-1">
              {cagnotte.toLocaleString()} <span className="text-base font-bold text-white">FCFA</span>
            </div>
            <button
              onClick={() => setShowRetraitModal(true)}
              disabled={cagnotte < 500}
              className="mt-3 w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#32A8D7] hover:bg-[#2896c2] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Wallet size={14} />
              <span>Demander un retrait</span>
            </button>
            <p className="text-[10px] text-slate-400 mt-1.5">Dès 500 FCFA · Retrait instantané</p>
          </div>
        </div>
      </div>

      {/* ── KPI & RÉMUNÉRATION ET PLAFOND ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Rémunération par filleul */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:border-sky-200 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rémunération</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-[#32A8D7] flex items-center justify-center">
              <Gift size={16} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{bonusPerReferral} <span className="text-base font-bold text-slate-500">FCFA</span></p>
          <p className="text-xs text-slate-500 mt-1">
            Par filleul éligible (3 étapes complétées)
          </p>
        </div>

        {/* Plafond quotidien */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:border-amber-200 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Plafond Quotidien</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <Flame size={16} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{dailyLimit} <span className="text-base font-bold text-slate-500">/ jour max</span></p>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
            <span>Aujourd&apos;hui :</span>
            <span className="font-bold text-slate-800">{dailyCount} / {dailyLimit} validé(s)</span>
          </div>
        </div>

        {/* Potentiel mensuel */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:border-purple-200 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Potentiel Mensuel</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-purple-600">
            Jusqu&apos;à {monthlyMaxPotential.toLocaleString()} <span className="text-sm font-bold text-slate-500">FCFA</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Potentiel théorique à activité maximale (15/j)
          </p>
        </div>

        {/* Total des affiliés */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mes Parrainages</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{affilies.length}</p>
          <p className="text-xs text-slate-500 mt-1">
            <strong className="text-emerald-600">{valides}</strong> validé(s) · <strong className="text-amber-500">{enAttente}</strong> en cours
          </p>
        </div>
      </div>

      {/* ── SECTION D'AFFICHAGE DU CODE ET DU QR CODE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Colonne Gauche : Code de parrainage & Lien d'invitation (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-sky-50 text-[#32A8D7]">
                <Share2 size={18} />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Vos accès de parrainage direct</h3>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Partagez votre code textuel ou votre lien sécurisé. Vos filleuls n&apos;ont qu&apos;à l&apos;indiquer lors de leur inscription.
            </p>

            {/* Code textuel avec copie rapide */}
            <div className="mb-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Votre Code de Parrainage Textuel
              </label>
              <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-slate-900 to-[#0b223d] rounded-2xl border border-slate-800">
                <span className="flex-1 px-3 py-2 text-base font-mono font-black tracking-widest text-[#32A8D7] select-all uppercase">
                  {referralCode || "Chargement..."}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
                    copiedCode
                      ? "bg-emerald-500 text-white"
                      : "bg-[#32A8D7] hover:bg-[#2896c2] text-white"
                  }`}
                >
                  {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedCode ? "Copié !" : "Copier le code"}</span>
                </button>
              </div>
            </div>

            {/* Lien d'invitation complet avec copie rapide */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Votre Lien d&apos;Invitation Automatique
              </label>
              <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="flex-1 px-3 py-1.5 text-xs text-slate-600 truncate font-medium select-all">
                  {referralLink}
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    copiedLink
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-white hover:bg-slate-200/80 text-slate-700 border border-slate-200"
                  }`}
                >
                  {copiedLink ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedLink ? "Lien copié" : "Copier le lien"}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-500" />
              Attribution instantanée et sécurisée en base de données
            </span>
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Rejoins Netacuv avec mon lien de parrainage : ${referralLink}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold transition-colors cursor-pointer"
            >
              <span>Partager sur WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Colonne Droite : QR Code de parrainage scannable et téléchargeable (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-[#071c33] rounded-3xl p-6 sm:p-7 text-white border border-sky-400/20 shadow-md flex flex-col items-center text-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-400/10 border border-sky-400/30 text-sky-300 text-[11px] font-bold mb-3">
              <QrCode size={13} />
              <span>QR Code Scannable & Téléchargeable</span>
            </div>
            <h4 className="font-extrabold text-white text-base">Faites scanner votre profil</h4>
            <p className="text-xs text-slate-300 mt-1 max-w-xs">
              Présentez ce QR Code directement depuis votre écran ou téléchargez-le pour vos supports.
            </p>
          </div>

          <div className="my-5 p-4 bg-white rounded-2xl shadow-xl flex flex-col items-center border-4 border-sky-400/30">
            {referralLink ? (
              <QRCodeSVG
                id="affiliation-qrcode"
                value={referralLink}
                size={140}
                level="H"
                includeMargin={false}
              />
            ) : (
              <div className="w-[140px] h-[140px] bg-slate-100 rounded-lg animate-pulse" />
            )}
            <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase mt-2">
              {referralCode || "NETACUV"}
            </span>
          </div>

          <button
            type="button"
            onClick={handleDownloadQR}
            className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
          >
            <Download size={14} className="text-[#32A8D7]" />
            <span>Télécharger le QR Code (.SVG)</span>
          </button>
        </div>
      </div>

      {/* ── CONDITIONS D'ÉLIGIBILITÉ DU BONUS (SECTION DÉTAILLÉE) ── */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-slate-100 gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#32A8D7] mb-1">
              <ShieldCheck size={14} />
              <span>Règles d&apos;éligibilité du bonus</span>
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Conditions requises pour débloquer les 25 FCFA par filleul
            </h3>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
            3 étapes obligatoires
          </span>
        </div>

        <p className="text-xs text-slate-600 mb-6 leading-relaxed">
          Pour que le bonus de <strong>25 FCFA</strong> soit débloqué et crédité sur votre cagnotte de parrainage, votre filleul doit impérativement accomplir et valider l&apos;ensemble des 3 étapes suivantes :
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Étape 1 */}
          <div className="relative p-5 rounded-2xl bg-gradient-to-b from-sky-50/60 to-white border border-sky-100 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-xl bg-[#32A8D7] text-white text-xs font-black flex items-center justify-center mb-3 shadow-sm">
                1
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1.5">Inscription avec votre code</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Le filleul doit créer son compte sur Netacuv en saisissant votre code de parrainage ou en utilisant votre lien ou QR code.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-sky-100/60 flex items-center gap-1.5 text-[11px] font-bold text-sky-700">
              <CheckCircle2 size={13} />
              <span>Liaison automatique</span>
            </div>
          </div>

          {/* Étape 2 */}
          <div className="relative p-5 rounded-2xl bg-gradient-to-b from-purple-50/60 to-white border border-purple-100 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white text-xs font-black flex items-center justify-center mb-3 shadow-sm">
                2
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1.5">Activation de l&apos;offre Premium</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Le filleul doit souscrire à l&apos;abonnement Netacuv Premium pour valider son engagement sur la plateforme.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-purple-100/60 flex items-center gap-1.5 text-[11px] font-bold text-purple-700">
              <CheckCircle2 size={13} />
              <span>Abonnement Premium actif</span>
            </div>
          </div>

          {/* Étape 3 */}
          <div className="relative p-5 rounded-2xl bg-gradient-to-b from-emerald-50/60 to-white border border-emerald-100 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white text-xs font-black flex items-center justify-center mb-3 shadow-sm">
                3
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1.5">Profil complété à 100%</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Le filleul doit renseigner l&apos;intégralité des informations de son profil (bio, coordonnées, compétences, CV...).
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-emerald-100/60 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
              <CheckCircle2 size={13} />
              <span>Profil vérifié & complet</span>
            </div>
          </div>
        </div>

        {/* Note récapitulative */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
          <Info size={18} className="text-[#32A8D7] shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong>À noter :</strong> La prime de <strong>25 FCFA</strong> est versée instantanément sur votre solde affilié dès que votre filleul a complété les 3 étapes ci-dessus. Tout filleul n&apos;ayant pas encore finalisé ces critères reste au statut <em>« En attente »</em> dans votre tableau de bord.
          </p>
        </div>
      </div>

      {/* ── LISTE ET HISTORIQUE DES PARRAINAGES ── */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Historique de vos parrainages</h3>
            <p className="text-xs text-slate-400 mt-0.5">Suivez l&apos;état d&apos;éligibilité de chacun de vos filleuls</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
            {affilies.length} inscrit(s)
          </span>
        </div>

        {affilies.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Users size={36} className="text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">Aucun parrainage enregistré</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Vous n&apos;avez pas encore de filleul lié à votre compte. Partagez votre code ou votre QR code pour commencer à gagner vos primes !
            </p>
            <button
              onClick={handleCopyLink}
              className="mt-4 px-5 py-2.5 rounded-xl bg-[#32A8D7] hover:bg-[#2896c2] text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Copy size={13} />
              <span>Partager mon lien</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/75 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-6">Filleul</th>
                  <th className="py-3 px-4">Date d&apos;inscription</th>
                  <th className="py-3 px-4">Statut d&apos;éligibilité</th>
                  <th className="py-3 px-6 text-right">Gain débloqué</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {affilies.map((affilie) => (
                  <tr key={String(affilie.id)} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#32A8D7] to-[#0b223d] text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                          {affilie.name.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{affilie.name}</p>
                          <p className="text-[11px] text-slate-400">{affilie.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {affilie.dateInscription}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                          affilie.statut === "Validé" || affilie.statut === "Inscrit"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : affilie.statut === "Profil incomplet"
                            ? "bg-sky-50 text-sky-700 border-sky-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {affilie.statut === "Validé" || affilie.statut === "Inscrit" ? (
                          <CheckCircle size={12} className="text-emerald-500" />
                        ) : affilie.statut === "Profil incomplet" ? (
                          <AlertCircle size={12} className="text-sky-500" />
                        ) : (
                          <Clock size={12} className="text-amber-500" />
                        )}
                        <span>
                          {affilie.statut === "Validé" || affilie.statut === "Inscrit"
                            ? "Validé (3/3 étapes)"
                            : affilie.statut === "Profil incomplet"
                            ? "Profil incomplet"
                            : "En attente Premium"}
                        </span>
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right whitespace-nowrap">
                      <span
                        className={`font-black text-sm ${
                          affilie.gain > 0 ? "text-emerald-600" : "text-slate-400"
                        }`}
                      >
                        {affilie.gain > 0 ? `+${affilie.gain} FCFA` : "0 FCFA"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
