"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Clock, ShieldCheck, RefreshCw, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";

interface DeletedAccount {
  id: string;
  email: string;
  role: string;
  reason: string;
  createdAt: string;
}

export default function SuppressionsPage() {
  const t = useTranslations("admin.deletions");
  const [deletions, setDeletions] = useState<DeletedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [purging, setPurging] = useState(false);

  const fetchDeletions = () => {
    fetch("/api/admin/suppressions")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setDeletions(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDeletions();
  }, []);

  const handleApplyRetention = async () => {
    if (!confirm("Voulez-vous exécuter immédiatement la politique de conservation ?\nTous les comptes inactifs depuis plus de 2 ans et leurs données associées (profils, CV, vidéos) seront définitivement purgés.")) {
      return;
    }

    setPurging(true);
    const toastId = toast.loading("Application de la politique de conservation (> 2 ans)...");

    try {
      const res = await fetch("/api/cron/cleanup", { method: "POST" });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(
          data.deletedUsersCount > 0
            ? `${data.deletedUsersCount} compte(s) inactif(s) depuis > 2 ans purgé(s) avec succès.`
            : "Aucun compte inactif depuis plus de 2 ans à purger.",
          { id: toastId }
        );
        fetchDeletions();
      } else {
        toast.error(data.error || "Erreur lors de l'application de la purge", { id: toastId });
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Erreur de connexion au serveur", { id: toastId });
    } finally {
      setPurging(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="text-red-500" /> {t("pageTitle")}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {t("pageSubtitle")}
          </p>
        </div>

        <button
          onClick={handleApplyRetention}
          disabled={purging}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-all shadow-sm"
        >
          {purging ? (
            <>
              <RefreshCw size={16} className="animate-spin text-blue-400" />
              <span>Purge en cours...</span>
            </>
          ) : (
            <>
              <Trash2 size={16} className="text-red-400" />
              <span>Appliquer la rétention (&gt; 2 ans)</span>
            </>
          )}
        </button>
      </div>

      {/* Bannière explicative sur la conservation des données */}
      <div className="bg-blue-50/70 border border-blue-200/60 rounded-2xl p-4 flex items-start gap-3.5">
        <div className="p-2 bg-blue-100 rounded-xl text-blue-700 shrink-0 mt-0.5">
          <ShieldCheck size={20} />
        </div>
        <div className="text-sm text-slate-700 leading-relaxed">
          <strong className="text-blue-950 font-bold block mb-0.5">Règle de conservation légale des données (2 ans)</strong>
          Conformément à la politique de confidentialité Netacuv et aux réglementations sur la protection des données personnelles, les comptes n&apos;ayant enregistré aucune activité depuis plus de 2 ans ainsi que leurs données associées (profils, CV, vidéos de simulation IA, offres et logs) sont automatiquement supprimés via le cron quotidien.
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-10">
          <div className="w-8 h-8 border-4 border-[#32A8D7] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : deletions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
          <p className="text-slate-500">{t("empty")}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">{t("thUser")}</th>
                  <th className="px-6 py-4">{t("thRole")}</th>
                  <th className="px-6 py-4">{t("thReason")}</th>
                  <th className="px-6 py-4">{t("thDate")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deletions.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {d.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        d.role === "TALENT" ? "bg-blue-100 text-blue-700" :
                        (d.role === "RECRUITEUR" || d.role === "RECRUTER" || d.role === "RECRUTEUR" || d.role === "RECRUITER") ? "bg-purple-100 text-purple-700" :
                        "bg-slate-100 text-slate-700"
                      }`}>
                        {d.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={d.reason}>
                      {d.reason}
                    </td>
                    <td className="px-6 py-4 text-slate-500 flex items-center gap-1.5">
                      <Clock size={14} />
                      {new Date(d.createdAt).toLocaleDateString("fr-FR", {
                        day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
