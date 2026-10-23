"use client";

import { useState } from "react";
import useSWR from "swr";
import { QRCodeSVG } from "qrcode.react";
import {
  Users,
  Copy,
  Check,
  Wallet,
  ChevronDown,
  X,
  CheckCircle,
  Download,
  QrCode,
  Link2,
  UserCheck,
  ShieldCheck,
  FileCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";

interface Affilie {
  id: string | number;
  name: string;
  email: string;
  dateInscription: string;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Demande de Retrait</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Disponible : <span className="font-semibold text-emerald-600">{cagnotte.toLocaleString()} FCFA</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Opérateur</label>
            <div className="relative">
              <select
                value={operateur}
                onChange={(e) => setOperateur(e.target.value)}
                className="w-full appearance-none px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 outline-none focus:border-[#32A8D7] focus:ring-1 focus:ring-[#32A8D7] transition-all cursor-pointer"
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
            <label className="block text-xs font-medium text-slate-700 mb-1">Numéro de téléphone</label>
            <input
              required
              type="tel"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 outline-none focus:border-[#32A8D7] focus:ring-1 focus:ring-[#32A8D7] transition-all"
              placeholder="+229 97 00 00 00"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Montant à retirer (FCFA)</label>
            <input
              required
              type="number"
              min={500}
              max={cagnotte}
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 outline-none focus:border-[#32A8D7] focus:ring-1 focus:ring-[#32A8D7] transition-all"
              placeholder="Ex : 500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Minimum 500 FCFA · Max {cagnotte.toLocaleString()} FCFA
            </p>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={Number(montant) < 500 || Number(montant) > cagnotte}
              className="flex-1 py-2 rounded-lg bg-[#32A8D7] hover:bg-[#2896c2] disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              Confirmer
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
    showToast("Code copié");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    if (!referralLink) return;
    navigator.clipboard?.writeText(referralLink).catch(() => {});
    setCopiedLink(true);
    showToast("Lien copié");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById("affiliation-qrcode");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = `qrcode-${referralCode || "netacuv"}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
    showToast("QR Code téléchargé");
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
        showToast(`Retrait de ${montant.toLocaleString()} FCFA demandé`);
        mutate();
      } else {
        const err = await res.json();
        showToast(err.error || "Erreur de retrait");
      }
    } catch {
      showToast("Erreur de connexion");
    }
  };

  const valides = affilies.filter((a) => a.statut === "Validé" || a.statut === "Inscrit").length;

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 text-xs border border-slate-700 animate-in fade-in duration-150">
          <CheckCircle size={14} className="text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Modal */}
      {showRetraitModal && (
        <RetraitModal
          cagnotte={cagnotte}
          onClose={() => setShowRetraitModal(false)}
          onConfirm={handleRetrait}
        />
      )}

      {/* ── EN-TÊTE ÉPURÉ AVEC SOLDE ── */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Programme de Parrainage</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Invitez de nouveaux utilisateurs sur Netacuv et recevez vos primes par Mobile Money.
          </p>
        </div>

        <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
          <div className="text-left sm:text-right">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Solde</span>
            <span className="text-lg font-bold text-slate-900">{cagnotte.toLocaleString()} FCFA</span>
          </div>
          <button
            onClick={() => setShowRetraitModal(true)}
            disabled={cagnotte < 500}
            className="px-4 py-2 rounded-lg bg-[#32A8D7] hover:bg-[#2896c2] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Wallet size={14} />
            <span>Retirer</span>
          </button>
        </div>
      </div>

      {/* ── 3 INDICATEURS CLÉS (SOBRES) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs font-medium text-slate-500">Rémunération</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{bonusPerReferral} FCFA</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Par filleul éligible</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs font-medium text-slate-500">Plafond Quotidien</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{dailyLimit} / jour max</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Jusqu&apos;à {monthlyMaxPotential.toLocaleString()} FCFA / mois
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs font-medium text-slate-500">Mes Filleuls</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{affilies.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {valides} validé(s) sur {affilies.length}
          </div>
        </div>
      </div>

      {/* ── BLOC PARTAGE (CODE + LIEN + QR CODE) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Code et Lien (2/3 de l'espace) */}
        <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 mb-1">
              <Link2 size={15} className="text-[#32A8D7]" />
              <span>Vos liens de parrainage</span>
            </div>
            <p className="text-xs text-slate-500">
              Partagez ce code ou ce lien avec vos contacts pour les relier à votre compte.
            </p>
          </div>

          <div className="space-y-3">
            {/* Code */}
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                Code de parrainage
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={referralCode || "..."}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-800 select-all outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                >
                  {copiedCode ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  <span>{copiedCode ? "Copié" : "Copier"}</span>
                </button>
              </div>
            </div>

            {/* Lien */}
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                Lien direct d&apos;inscription
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={referralLink}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-600 select-all outline-none truncate"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                >
                  {copiedLink ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  <span>{copiedLink ? "Copié" : "Copier"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code (1/3 de l'espace) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col items-center justify-between text-center">
          <div className="w-full">
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-900 mb-1">
              <QrCode size={15} className="text-[#32A8D7]" />
              <span>QR Code</span>
            </div>
            <p className="text-[11px] text-slate-400">À faire scanner directement</p>
          </div>

          <div className="my-3 p-2 bg-white border border-slate-200 rounded-lg shadow-2xs">
            {referralLink ? (
              <QRCodeSVG
                id="affiliation-qrcode"
                value={referralLink}
                size={105}
                level="M"
                includeMargin={false}
              />
            ) : (
              <div className="w-[105px] h-[105px] bg-slate-100 rounded" />
            )}
          </div>

          <button
            type="button"
            onClick={handleDownloadQR}
            className="w-full py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download size={13} />
            <span>Télécharger (.svg)</span>
          </button>
        </div>
      </div>

      {/* ── CONDITIONS D'ÉLIGIBILITÉ (SOBRE ET DIRECT) ── */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
          Conditions d&apos;éligibilité au bonus (25 FCFA)
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Le bonus est débloqué dès que le filleul valide les 3 étapes suivantes :
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
            <div className="w-7 h-7 rounded-md bg-[#32A8D7]/10 text-[#0071a2] flex items-center justify-center shrink-0 mt-0.5">
              <UserCheck size={15} />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-800">1. Inscription</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Avec votre code ou en scannant votre QR code.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
            <div className="w-7 h-7 rounded-md bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck size={15} />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-800">2. Offre Premium</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Activation de l&apos;abonnement Premium.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
            <div className="w-7 h-7 rounded-md bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <FileCheck size={15} />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-800">3. Profil 100% complet</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Renseignement de tous les champs du profil.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TABLE DES FILLEULS ── */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Users size={15} className="text-slate-500" />
            <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
              Historique des parrainages ({affilies.length})
            </h3>
          </div>
        </div>

        {affilies.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-xs text-slate-400">Aucun parrainage enregistré pour le moment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-medium text-slate-400 bg-slate-50/30">
                  <th className="py-2.5 px-5">Utilisateur</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Statut</th>
                  <th className="py-2.5 px-5 text-right">Gain</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {affilies.map((affilie) => (
                  <tr key={String(affilie.id)} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-5">
                      <div className="font-medium text-slate-800">{affilie.name}</div>
                      <div className="text-[11px] text-slate-400">{affilie.email}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {affilie.dateInscription}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                          affilie.statut === "Validé" || affilie.statut === "Inscrit"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : affilie.statut === "Profil incomplet"
                            ? "bg-sky-50 text-sky-700 border border-sky-200"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {affilie.statut === "Validé" || affilie.statut === "Inscrit" ? (
                          <CheckCircle2 size={11} className="text-emerald-600" />
                        ) : affilie.statut === "Profil incomplet" ? (
                          <AlertCircle size={11} className="text-sky-600" />
                        ) : (
                          <Clock size={11} className="text-slate-400" />
                        )}
                        <span>
                          {affilie.statut === "Validé" || affilie.statut === "Inscrit"
                            ? "Validé"
                            : affilie.statut === "Profil incomplet"
                            ? "Profil incomplet"
                            : "En attente"}
                        </span>
                      </span>
                    </td>
                    <td className="py-3 px-5 text-right font-semibold text-slate-700 whitespace-nowrap">
                      {affilie.gain > 0 ? (
                        <span className="text-emerald-600">+{affilie.gain} FCFA</span>
                      ) : (
                        <span className="text-slate-400">0 FCFA</span>
                      )}
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
