"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Clock } from "lucide-react";

interface DeletedAccount {
  id: string;
  email: string;
  role: string;
  reason: string;
  createdAt: string;
}

export default function SuppressionsPage() {
  const [deletions, setDeletions] = useState<DeletedAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="text-red-500" /> Suppressions de compte
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Historique des utilisateurs ayant supprimé définitivement leur compte.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-10">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : deletions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
          <p className="text-slate-500">Aucune suppression enregistrée pour le moment.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Utilisateur (Email)</th>
                  <th className="px-6 py-4">Rôle</th>
                  <th className="px-6 py-4">Raison évoquée</th>
                  <th className="px-6 py-4">Date de suppression</th>
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
                        d.role === "RECRUITER" ? "bg-purple-100 text-purple-700" :
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
