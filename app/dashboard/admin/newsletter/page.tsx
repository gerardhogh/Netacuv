"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Mail, Send, Users, RefreshCw, CheckCircle2, Loader2,
  ExternalLink, Eye, ShieldCheck, MailCheck, Download, Trash2, Search, UserMinus
} from "lucide-react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

interface Subscriber {
  id: string;
  email: string;
  created_at: string;
  status?: "ACTIVE" | "UNSUBSCRIBED";
  source?: string;
  unsubscribed?: boolean;
}

export default function AdminNewsletterPage() {
  const t = useTranslations("admin.newsletter");
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Formulaire d'envoi
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isTestMode, setIsTestMode] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Récupération des abonnés
  const fetchSubscribers = async () => {
    setLoadingSubscribers(true);
    try {
      const res = await fetch("/api/admin/newsletter");
      const data = await res.json();
      if (res.ok) {
        setSubscribers(data.subscribers || []);
      } else {
        toast.error(data.error || t("toastServerError"));
      }
    } catch {
      toast.error(t("toastServerError"));
    } finally {
      setLoadingSubscribers(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  // Filtrage des abonnés
  const filteredSubscribers = useMemo(() => {
    if (!searchQuery.trim()) return subscribers;
    const q = searchQuery.toLowerCase().trim();
    return subscribers.filter((s) => s.email.toLowerCase().includes(q));
  }, [subscribers, searchQuery]);

  const activeCount = useMemo(() => {
    return subscribers.filter((s) => !s.unsubscribed && s.status !== "UNSUBSCRIBED").length;
  }, [subscribers]);

  const unsubscribedCount = useMemo(() => {
    return subscribers.filter((s) => s.unsubscribed || s.status === "UNSUBSCRIBED").length;
  }, [subscribers]);

  // Export CSV
  const handleExportCSV = () => {
    if (subscribers.length === 0) {
      toast.error(t("toastNoSubscribersExport"));
      return;
    }
    const headers = ["ID", "Email", "Statut", "Source", "Date Inscription"];
    const rows = subscribers.map((s) => [
      s.id,
      s.email,
      s.unsubscribed ? "DESABONNE" : "ACTIF",
      s.source || "FOOTER",
      new Date(s.created_at).toISOString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `netacuv_newsletter_subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(t("toastExportSuccess"));
  };

  // Suppression d'un abonné
  const handleDeleteSubscriber = async (id: string, email: string) => {
    if (!window.confirm(t("confirmDeleteSubscriber", { email }))) {
      return;
    }
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/newsletter?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || t("toastDeleteSuccess"));
        setSubscribers((prev) => prev.filter((s) => s.id !== id));
      } else {
        toast.error(data.error || t("toastDeleteError"));
      }
    } catch {
      toast.error(t("toastServerError"));
    } finally {
      setDeletingId(null);
    }
  };

  // Envoi de la newsletter
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim() || !message.trim()) {
      toast.error(t("toastSubjectMessageRequired"));
      return;
    }

    if (isTestMode && !testEmail.trim()) {
      toast.error(t("toastTestEmailRequired"));
      return;
    }

    const confirmText = isTestMode
      ? t("confirmSendTest", { email: testEmail })
      : t("confirmSendBroadcast", { count: activeCount });

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
        toast.success(data.message || t("toastSendSuccess"));
        if (!isTestMode) {
          setSubject("");
          setMessage("");
        }
      } else {
        toast.error(data.error || t("toastSendError"));
      }
    } catch {
      toast.error(t("toastServerError"));
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
              <span className="text-[#232323]">{t("title")}</span>{" "}
              <span className="text-[#32A8D7]">{t("titleHighlight")}</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {t("subtitle")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            disabled={subscribers.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-[#32A8D7] text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
            title={t("exportCSV")}
          >
            <Download size={14} />
            {t("exportCSV")}
          </button>
          <a
            href="https://resend.com/audiences"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-[#32A8D7] text-xs font-semibold rounded-xl transition-all shadow-xs"
          >
            <ExternalLink size={14} />
            {t("resend")}
          </a>
          <button
            onClick={fetchSubscribers}
            disabled={loadingSubscribers}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#32A8D7] hover:bg-[#2896c2] text-white text-xs font-semibold rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={14} className={loadingSubscribers ? "animate-spin" : ""} />
            {t("refresh")}
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
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t("activeSubscribers")}</p>
            <h3 className="text-2xl font-black text-slate-800">
              {loadingSubscribers ? "..." : activeCount}
            </h3>
            {unsubscribedCount > 0 && (
              <p className="text-[11px] text-slate-400 mt-0.5">
                {t("unsubscribedCount", { count: unsubscribedCount })}
              </p>
            )}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t("database")}</p>
            <h3 className="text-sm font-bold text-slate-800">{t("databaseType")}</h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">{t("databaseSecure")}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <MailCheck size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t("emailService")}</p>
            <h3 className="text-sm font-bold text-slate-800">{t("emailServiceType")}</h3>
            <p className="text-[11px] text-blue-600 font-medium mt-0.5">{t("emailServiceStatus")}</p>
          </div>
        </div>
      </div>

      {/* Main 2-columns section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Formulaire de Rédaction (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 shadow-xs p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">{t("composeTitle")}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{t("composeSubtitle")}</p>
            </div>
            <button
              type="button"
              onClick={() => setPreviewOpen(!previewOpen)}
              className="text-xs font-semibold text-[#32A8D7] hover:text-[#2896c2] flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-sky-50 transition-colors cursor-pointer"
            >
              <Eye size={14} />
              {previewOpen ? t("hidePreview") : t("showPreview")}
            </button>
          </div>

          {/* Aperçu direct en accordéon si activé */}
          {previewOpen && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3 animate-fade-in text-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("previewHeading")}</p>
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
                <div className="bg-gradient-to-r from-[#1e8ae9] to-[#32A8D7] text-white p-4 flex items-center justify-center">
                  <img src="/Logo/PNG/Logo%20white.png" alt="Netacuv" className="h-8 w-auto object-contain" />
                </div>
                <div className="p-5 text-slate-700 space-y-3">
                  <p className="font-bold text-slate-900 text-base">{subject || t("previewSubjectPlaceholder")}</p>
                  <p className="whitespace-pre-line text-sm text-slate-600 leading-relaxed">
                    {message || t("previewBodyPlaceholder")}
                  </p>
                </div>
                <div className="text-[11px] text-slate-400 text-center border-t border-slate-100 py-3 bg-slate-50/50">
                  {t("copyright", { year: new Date().getFullYear() })}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSend} className="space-y-5">
            {/* Cible d'envoi */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {t("recipientsLabel")}
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
                    <p className="text-xs font-bold">{t("allActiveSubscribers")}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {t("activeRecipientsCount", { count: activeCount })}
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
                    <p className="text-xs font-bold">{t("testOnly")}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {t("sendSingleEmail")}
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
                    placeholder={t("testEmailPlaceholder")}
                    required={isTestMode}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#32A8D7]"
                  />
                </div>
              )}
            </div>

            {/* Objet du mail */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {t("subjectLabel")}
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={t("subjectPlaceholder")}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#32A8D7]"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {t("bodyLabel")}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={8}
                placeholder={t("bodyPlaceholder")}
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
                    {t("sendingLoader")}
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    {isTestMode ? t("sendTestBtn") : t("sendBroadcastBtn", { count: activeCount })}
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
              {t("subscribersHeading", { count: filteredSubscribers.length })}
            </h2>
          </div>

          {/* Recherche */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#32A8D7]"
            />
          </div>

          {loadingSubscribers ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 size={24} className="animate-spin text-[#32A8D7]" />
              <p className="text-xs">{t("loadingSubscribers")}</p>
            </div>
          ) : filteredSubscribers.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              {searchQuery ? t("emptySearch") : t("emptySubscribers")}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto pr-1">
              {filteredSubscribers.map((subscriber) => {
                const isUnsub = subscriber.unsubscribed || subscriber.status === "UNSUBSCRIBED";
                return (
                  <div key={subscriber.id} className="py-3 flex items-center justify-between gap-3 group">
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold truncate ${isUnsub ? "text-slate-400 line-through" : "text-slate-800"}`}>
                        {subscriber.email}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-400">
                          {new Date(subscriber.created_at).toLocaleDateString("fr-FR")}
                        </span>
                        {subscriber.source && (
                          <span className="text-[9px] px-1.5 py-0.2 bg-slate-100 text-slate-500 rounded font-medium">
                            {subscriber.source}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isUnsub ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 flex items-center gap-1">
                          <UserMinus size={10} />
                          {t("unsubscribed")}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 size={10} />
                          {t("active")}
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteSubscriber(subscriber.id, subscriber.email)}
                        disabled={deletingId === subscriber.id}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                        title={t("deleteSubscriberTitle")}
                      >
                        {deletingId === subscriber.id ? (
                          <Loader2 size={13} className="animate-spin text-rose-500" />
                        ) : (
                          <Trash2 size={13} />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
