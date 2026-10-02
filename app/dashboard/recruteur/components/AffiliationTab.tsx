"use client";

import { useState } from "react";
import useSWR from "swr";
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
} from "lucide-react";

interface Affilie {
  id: number;
  name: string;
  email: string;
  dateInscription: string;
  statut: "Inscrit" | "En attente" | "Inactif";
  gain: number;
}

const MOCK_AFFILIES: Affilie[] = [];

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Retrait Mobile Money</h3>
            <p className="text-xs text-slate-400 mt-0.5">Solde disponible : <span className="font-bold text-green-600">{cagnotte.toLocaleString()} CFA</span></p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Opérateur</label>
            <div className="relative">
              <select
                value={operateur}
                onChange={(e) => setOperateur(e.target.value)}
                className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none focus:border-[#32A8D7] focus:bg-white transition-colors cursor-pointer"
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
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Montant à retirer (CFA)</label>
            <input
              required
              type="number"
              min={500}
              max={cagnotte}
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none focus:border-[#32A8D7] focus:bg-white transition-colors"
              placeholder="Ex: 5000"
            />
            <p className="text-[10px] text-slate-400 mt-1">Minimum : 500 CFA · Maximum : {cagnotte.toLocaleString()} CFA</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[#32A8D7] hover:bg-[#2896c2] text-white text-sm font-semibold shadow-sm transition-colors"
            >
              Confirmer le retrait
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AffiliationTab() {
  const fetcher = (url: string) => fetch(url).then(res => res.json());
  const { data, error, isLoading } = useSWR("/api/affiliation/me", fetcher);

  const cagnotte = data?.cagnotte || 0;
  const referralCode = data?.referralCode || "En attente...";
  const referralLink = `https://netacuv.com/inscription?ref=${referralCode}`;
  const affilies: Affilie[] = data?.affilies || [];

  const [copied, setCopied] = useState(false);
  const [showRetraitModal, setShowRetraitModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const copyLink = () => {
    if (!data?.referralCode) return;
    navigator.clipboard?.writeText(referralLink).catch(() => {});
    setCopied(true);
    showToast("Lien de parrainage copié !");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRetrait = async (montant: number, operateur: string, numero: string) => {
    setShowRetraitModal(false);
    try {
      const res = await fetch("/api/affiliation/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ montant, operateur, numero })
      });
      if (res.ok) {
        showToast(`Demande de retrait de ${montant.toLocaleString()} CFA via ${operateur} envoyée !`);
      } else {
        const err = await res.json();
        showToast(err.error || "Erreur lors de la demande de retrait");
      }
    } catch (error) {
      showToast("Erreur de connexion.");
    }
  };

  const inscrits = affilies.filter((a) => a.statut === "Inscrit").length;
  const enAttente = affilies.filter((a) => a.statut === "En attente").length;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm animate-fade-in border border-slate-700">
          <CheckCircle size={16} className="text-green-400" />
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

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center">
              <Users size={17} className="text-[#32A8D7]" />
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mes affiliés</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{affilies.length}</p>
          <p className="text-xs text-slate-400 mt-1">{inscrits} inscrits · {enAttente} en attente</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
              <Wallet size={17} className="text-green-600" />
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cagnotte</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{cagnotte.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">CFA disponibles</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
              <TrendingUp size={17} className="text-purple-600" />
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gains totaux</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {affilies.reduce((acc, a) => acc + a.gain, 0).toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 mt-1">CFA générés</p>
        </div>
      </div>

      {/* Two-col layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Left: Affiliates list */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Liste des affiliés</h3>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-sky-50 text-[#0071a2]">
              Cagnotte sur invitation : {cagnotte.toLocaleString()} CFA
            </span>
          </div>
          <div className="divide-y divide-slate-50">
            {affilies.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <Users size={32} className="text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-600">Aucun affilié</p>
                <p className="text-xs text-slate-400 mt-1">
                  Vous n'avez parrainé personne pour le moment. Partagez votre lien !
                </p>
              </div>
            ) : (
              affilies.map((affilie) => (
                <div key={affilie.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#32A8D7] to-[#0071a2] flex items-center justify-center text-white text-xs font-bold">
                      {affilie.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{affilie.name}</p>
                      <p className="text-[10px] text-slate-400">{affilie.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400">{affilie.dateInscription}</span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        affilie.statut === "Inscrit"
                          ? "bg-green-50 text-green-600 border-green-100"
                          : affilie.statut === "En attente"
                          ? "bg-amber-50 text-amber-600 border-amber-100"
                          : "bg-slate-100 text-slate-400 border-slate-200"
                      }`}
                    >
                      {affilie.statut === "Inscrit" ? <CheckCircle size={9} /> : affilie.statut === "En attente" ? <Clock size={9} /> : <AlertCircle size={9} />}
                      {affilie.statut}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Referral link + withdrawal */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Referral link card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <Gift size={16} className="text-[#32A8D7]" />
              <h3 className="font-bold text-slate-900 text-sm">Mon lien de parrainage</h3>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 rounded-xl border border-slate-200 px-3 py-2.5">
              <p className="flex-1 text-[11px] text-slate-600 font-medium truncate">{referralLink}</p>
              <button
                onClick={copyLink}
                className={`p-1.5 rounded-lg transition-all ${
                  copied ? "bg-green-100 text-green-600" : "hover:bg-slate-200 text-slate-500 hover:text-slate-700"
                }`}
                title="Copier le lien"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              Partagez ce lien et gagnez <span className="font-bold text-[#32A8D7]">2 500 CFA</span> par recruteur parrainé inscrit.
            </p>
          </div>

          {/* Withdrawal card */}
          <div className="bg-gradient-to-br from-[#08304c] to-[#0d4a73] rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Wallet size={16} className="text-sky-300" />
              <h3 className="font-bold text-sm">Retrait Mobile Money</h3>
            </div>
            <p className="text-xs text-sky-200 mb-1">Solde disponible</p>
            <p className="text-3xl font-bold mb-4">{cagnotte.toLocaleString()} <span className="text-lg font-normal text-sky-300">CFA</span></p>
            <button
              onClick={() => setShowRetraitModal(true)}
              className="w-full py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Wallet size={15} />
              Effectuer un retrait
            </button>
          </div>

          {/* How it works */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h4 className="font-bold text-slate-900 text-xs mb-3">Comment ça fonctionne ?</h4>
            <div className="space-y-2.5">
              {[
                { step: "1", text: "Copiez votre lien de parrainage unique" },
                { step: "2", text: "Partagez-le aux recruteurs de votre réseau" },
                { step: "3", text: "Gagnez 2 500 CFA par recruteur inscrit" },
                { step: "4", text: "Retirez vos gains via Mobile Money" },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#32A8D7] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-px">
                    {item.step}
                  </span>
                  <p className="text-[11px] text-slate-600 leading-snug">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
