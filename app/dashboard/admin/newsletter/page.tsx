"use client";

import React, { useState, useEffect } from "react";
import {
  Mail, Send, Users, RefreshCw, CheckCircle2, AlertCircle, Loader2,
  ExternalLink, Eye, ShieldCheck, MailCheck
} from "lucide-react";
import toast from "react-hot-toast";

interface Subscriber {
  id: string;
  email: string;
  created_at: string;
  unsubscribed?: boolean;
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(true);

  // Formulaire d'envoi
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isTestMode, setIsTestMode] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Récupération des abonnés
  const fetchSubscribers = async () => {
    setLoadingSubscribers(true);
    try {
      const res = await fetch("/api/admin/newsletter");
      const data = await res.json();
      if (res.ok) {
        setSubscribers(data.subscribers || []);
      } else {
        toast.error(data.error || "Erreur de chargement des abonnés.");
      }
    } catch {
      toast.error("Impossible de contacter le serveur.");
    } finally {
      setLoadingSubscribers(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  // Envoi de la newsletter
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim() || !message.trim()) {
      toast.error("Veuillez renseigner un objet et un message.");
      return;
    }

    if (isTestMode && !testEmail.trim()) {
      toast.error("Veuillez renseigner l'adresse e-mail de test.");
      return;
    }

    const confirmText = isTestMode
      ? `Envoyer un e-mail de test à ${testEmail} ?`
      : `Confirmer l'envoi de cette newsletter à tous les ${subscribers.length} abonnés ?`;

    if (!window.confirm(confirmText)) return;

    setSending(true);

    try {
      const res = await fetch("/api/admin/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          message: message.trim(),
          testEmailOnly: isTestMode ? testEmail.trim() : undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Newsletter envoyée avec succès !");
        if (!isTestMode) {
          setSubject("");
          setMessage("");
        }
      } else {
        toast.error(data.error || "Erreur lors de l'envoi.");
      }
    } catch {
      toast.error("Erreur de connexion avec le serveur.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-sky-50 text-[#32A8D7] rounded-xl shrink-0">
            <Mail size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold">
              <span className="text-[#232323]">Gestion de la</span>{" "}
              <span className="text-[#32A8D7]">Newsletter</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Consultez vos abonnés et diffusez vos annonces et actualités via Resend.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://resend.com/audiences"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-[#32A8D7] text-xs font-semibold rounded-xl transition-all shadow-xs"
          >
            <ExternalLink size={14} />
            Dashboard Resend
          </a>
          <button
            onClick={fetchSubscribers}
            disabled={loadingSubscribers}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#32A8D7] hover:bg-[#2896c2] text-white text-xs font-semibold rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={14} className={loadingSubscribers ? "animate-spin" : ""} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-[#32A8D7] flex items-center justify-center shrink-0">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Abonnés actifs</p>
            <h3 className="text-2xl font-black text-slate-800">
              {loadingSubscribers ? "..." : subscribers.length}
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Audience Resend</p>
            <h3 className="text-sm font-bold text-slate-800">Connectée (General)</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <MailCheck size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Service E-mailing</p>
            <h3 className="text-sm font-bold text-slate-800">Resend API Actif</h3>
          </div>
        </div>
      </div>

      {/* Main 2-columns section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Formulaire de Rédaction (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 shadow-xs p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Créer &amp; Envoyer une Newsletter</h2>
              <p className="text-xs text-slate-500 mt-0.5">Le message sera mis en page avec le template officiel Netacuv.</p>
            </div>
            <button
              type="button"
              onClick={() => setPreviewOpen(!previewOpen)}
              className="text-xs font-semibold text-[#32A8D7] hover:text-[#2896c2] flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-sky-50 transition-colors cursor-pointer"
            >
              <Eye size={14} />
              {previewOpen ? "Masquer aperçu" : "Aperçu de l'email"}
            </button>
          </div>

          {/* Aperçu direct en accordéon si activé */}
          {previewOpen && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3 animate-fade-in text-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aperçu du rendu final</p>
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
                <div className="bg-[#1699d2] text-white p-4 text-center font-bold text-lg">
                  Netacuv
                </div>
                <div className="p-5 text-slate-700 space-y-3">
                  <p className="font-bold text-slate-900 text-base">{subject || "(Objet du message)"}</p>
                  <p className="whitespace-pre-line text-sm text-slate-600 leading-relaxed">
                    {message || "Le texte de votre newsletter apparaîtra ici..."}
                  </p>
                </div>
                <div className="text-[11px] text-slate-400 text-center border-t border-slate-100 py-3 bg-slate-50/50">
                  © {new Date().getFullYear()} Netacuv • Tous droits réservés
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSend} className="space-y-5">
            {/* Cible d'envoi */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Destinataire(s)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsTestMode(false)}
                  className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                    !isTestMode
                      ? "border-[#32A8D7] bg-sky-50/50 text-[#0c749e] ring-1 ring-[#32A8D7]"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  }`}
                >
                  <Users size={18} className={!isTestMode ? "text-[#32A8D7]" : "text-slate-400"} />
                  <div>
                    <p className="text-xs font-bold">Tous les abonnés</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {subscribers.length} destinataire(s) actif(s)
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setIsTestMode(true)}
                  className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                    isTestMode
                      ? "border-[#32A8D7] bg-sky-50/50 text-[#0c749e] ring-1 ring-[#32A8D7]"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  }`}
                >
                  <Send size={18} className={isTestMode ? "text-[#32A8D7]" : "text-slate-400"} />
                  <div>
                    <p className="text-xs font-bold">Test uniquement</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Envoyer à un e-mail unique
                    </p>
                  </div>
                </button>
              </div>

              {isTestMode && (
                <div className="mt-3 animate-fade-in">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="Votre adresse email pour tester (ex: admin@netacuv.com)"
                    required={isTestMode}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#32A8D7]"
                  />
                </div>
              )}
            </div>

            {/* Objet du mail */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Objet de l'e-mail
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ex : Découvrez les dernières offres d'emploi vérifiées sur Netacuv !"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#32A8D7]"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Corps du message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={8}
                placeholder="Bonjour à tous,&#10;&#10;Nous avons le plaisir de vous annoncer..."
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#32A8D7] leading-relaxed font-sans"
              />
            </div>

            {/* Bouton d'action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={sending}
                className="w-full py-3.5 px-6 rounded-xl bg-[#32A8D7] hover:bg-[#2896c2] active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#32A8D7]/20 transition-all disabled:opacity-60 cursor-pointer"
              >
                {sending ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Envoi en cours via Resend...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    {isTestMode ? "Envoyer le test" : `Diffuser la newsletter (${subscribers.length} abonnés)`}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Liste des Abonnés (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Users size={18} className="text-[#32A8D7]" />
              Liste des Abonnés ({subscribers.length})
            </h2>
          </div>

          {loadingSubscribers ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 size={24} className="animate-spin text-[#32A8D7]" />
              <p className="text-xs">Chargement des abonnés...</p>
            </div>
          ) : subscribers.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Aucun abonné enregistré pour le moment.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto pr-1">
              {subscribers.map((subscriber) => (
                <div key={subscriber.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      {subscriber.email}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Inscrit le {new Date(subscriber.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 size={10} />
                    Actif
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
