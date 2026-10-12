"use client";

import React, { useState } from "react";
import Image from "next/image";
import useSWR from "swr";
import {
  Search,
  Zap,
  CheckCircle2,
  XCircle,
  Users,
  Briefcase,
  Sparkles,
  ShieldCheck,
  CreditCard,
  AlertCircle,
  FileText,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Modal } from "@/app/components/ui/Modal";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface UserActivationItem {
  id: string;
  name: string;
  email: string;
  avatar: string;
  userType: "talent" | "recruteur";
  roleName: string;
  isPremium: boolean;
  active: boolean;
  createdAt: string;
  details: string;
}

export default function ActivationOffresPage() {
  const [filterType, setFilterType] = useState<"all" | "talents" | "recruteurs">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "premium" | "gratuit">("all");
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Modal confirmation state
  const [confirmModalData, setConfirmModalData] = useState<{
    user: UserActivationItem;
    targetPremium: boolean;
  } | null>(null);

  const queryParams = new URLSearchParams();
  if (filterType !== "all") queryParams.set("type", filterType);
  if (search.trim()) queryParams.set("q", search.trim());

  const {
    data: users = [],
    isLoading,
    mutate,
  } = useSWR<UserActivationItem[]>(
    `/api/admin/activation?${queryParams.toString()}`,
    fetcher
  );

  const handleOpenConfirm = (user: UserActivationItem) => {
    setConfirmModalData({
      user,
      targetPremium: !user.isPremium,
    });
  };

  const handleConfirmToggle = async () => {
    if (!confirmModalData) return;
    const { user, targetPremium } = confirmModalData;
    setLoadingId(user.id);

    try {
      const res = await fetch("/api/admin/activation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, isPremium: targetPremium }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Une erreur est survenue");
      }

      toast.success(
        targetPremium
          ? `Offre Premium activée avec succès pour ${user.name} !`
          : `Offre Premium désactivée pour ${user.name}`,
        {
          icon: targetPremium ? "✨" : "ℹ️",
          style: {
            borderRadius: "12px",
            background: "#1E293B",
            color: "#fff",
            fontSize: "13px",
          },
        }
      );
      mutate();
      setConfirmModalData(null);
    } catch (err: any) {
      toast.error(err.message || "Échec de l'opération");
    } finally {
      setLoadingId(null);
    }
  };

  const filteredUsers = Array.isArray(users)
    ? users.filter((u) => {
        if (filterStatus === "premium") return u.isPremium;
        if (filterStatus === "gratuit") return !u.isPremium;
        return true;
      })
    : [];

  const totalUsers = Array.isArray(users) ? users.length : 0;
  const premiumCount = Array.isArray(users) ? users.filter((u) => u.isPremium).length : 0;
  const talentsCount = Array.isArray(users) ? users.filter((u) => u.userType === "talent").length : 0;
  const recruitersCount = Array.isArray(users) ? users.filter((u) => u.userType === "recruteur").length : 0;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Toaster position="top-right" />

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#008de4] to-[#32A8D7] text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Zap size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                Activation manuelle des offres Premium
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Accordez ou retirez l&apos;accès à l&apos;offre Premium aux Talents et Recruteurs réels de la plateforme sans paiement requis.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-[#008de4] border border-blue-200">
              <ShieldCheck size={14} /> Accès Super Admin
            </span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
            <p className="text-xs text-slate-500 font-medium">Comptes éligibles</p>
            <p className="text-xl font-black text-slate-800 mt-1">{totalUsers}</p>
          </div>
          <div className="bg-amber-50/50 rounded-xl p-3.5 border border-amber-100">
            <p className="text-xs text-amber-700 font-medium">Offres Premium actives</p>
            <p className="text-xl font-black text-amber-600 mt-1">{premiumCount}</p>
          </div>
          <div className="bg-blue-50/50 rounded-xl p-3.5 border border-blue-100">
            <p className="text-xs text-blue-700 font-medium">Talents</p>
            <p className="text-xl font-black text-blue-600 mt-1">{talentsCount}</p>
          </div>
          <div className="bg-emerald-50/50 rounded-xl p-3.5 border border-emerald-100">
            <p className="text-xs text-emerald-700 font-medium">Recruteurs</p>
            <p className="text-xl font-black text-emerald-600 mt-1">{recruitersCount}</p>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom d'utilisateur, entreprise ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#008de4] focus:border-transparent transition-all"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* User type filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterType === "all" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilterType("talents")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterType === "talents" ? "bg-white text-blue-600 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Users size={13} /> Talents
            </button>
            <button
              onClick={() => setFilterType("recruteurs")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterType === "recruteurs" ? "bg-white text-emerald-600 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Briefcase size={13} /> Recruteurs
            </button>
          </div>

          {/* Status filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterStatus === "all" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Tout statut
            </button>
            <button
              onClick={() => setFilterStatus("premium")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterStatus === "premium" ? "bg-white text-amber-600 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Sparkles size={13} /> Premium
            </button>
            <button
              onClick={() => setFilterStatus("gratuit")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterStatus === "gratuit" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Standard
            </button>
          </div>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Utilisateur / Entreprise</th>
                <th className="py-3.5 px-5">Type de profil</th>
                <th className="py-3.5 px-5">Activité</th>
                <th className="py-3.5 px-5 text-center">Offre actuelle</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-xs font-medium">Chargement des utilisateurs...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-medium">Aucun profil correspondant trouvé.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isProcessing = loadingId === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* User */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden relative border border-slate-200 shrink-0 bg-blue-50">
                            <Image
                              src={u.avatar}
                              alt={u.name}
                              fill
                              className="object-cover object-center w-full h-full"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 text-sm truncate flex items-center gap-1.5">
                              {u.name}
                              {u.isPremium && (
                                <span title="Offre Premium active" className="inline-block">
                                  <Sparkles size={14} className="text-amber-500 fill-amber-400" />
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-400 truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Type & Role */}
                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                            u.userType === "recruteur"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {u.userType === "recruteur" ? (
                            <Briefcase size={12} />
                          ) : (
                            <Users size={12} />
                          )}
                          {u.userType === "recruteur" ? "Recruteur" : "Talent"}
                        </span>
                      </td>

                      {/* Details */}
                      <td className="py-4 px-5">
                        <span className="text-xs text-slate-600 font-medium">
                          {u.details}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5 text-center">
                        {u.isPremium ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
                            <CheckCircle2 size={13} className="text-amber-500" />
                            Premium Actif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                            <XCircle size={13} className="text-slate-400" />
                            Standard
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-5 text-right">
                        <button
                          disabled={isProcessing}
                          onClick={() => handleOpenConfirm(u)}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                            u.isPremium
                              ? "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
                              : "bg-gradient-to-r from-[#008de4] to-[#32A8D7] hover:from-blue-600 hover:to-[#2891bb] text-white shadow-blue-500/20"
                          }`}
                        >
                          {isProcessing ? (
                            <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : u.isPremium ? (
                            <>
                              <XCircle size={14} />
                              Désactiver l&apos;offre
                            </>
                          ) : (
                            <>
                              <Zap size={14} />
                              Activer l&apos;offre
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODALE DE CONFIRMATION D'ACTIVATION / DÉSACTIVATION ── */}
      {confirmModalData && (
        <Modal
          isOpen={true}
          onClose={() => setConfirmModalData(null)}
          title={
            confirmModalData.targetPremium
              ? "Confirmer l'activation de l'offre Premium"
              : "Confirmer la désactivation de l'offre Premium"
          }
          description="Cette action est exécutée par l'administrateur sans paiement requis."
        >
          <div className="space-y-4">
            {/* Profil récapitulatif */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden relative border border-slate-200 bg-blue-100 shrink-0">
                <Image
                  src={confirmModalData.user.avatar}
                  alt={confirmModalData.user.name}
                  fill
                  className="object-cover object-center w-full h-full"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-800 text-sm truncate">
                  {confirmModalData.user.name}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {confirmModalData.user.email}
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700">
                  {confirmModalData.user.userType}
                </span>
              </div>
            </div>

            {/* Note d'information */}
            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-100 text-xs text-slate-700 space-y-2">
              <div className="flex items-start gap-2">
                <CreditCard size={16} className="text-[#008de4] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <span className="font-bold text-slate-900">Enregistrement comptable :</span> Cette opération sera automatiquement consignée dans{" "}
                  <span className="font-semibold text-[#008de4]">l&apos;historique des transactions</span> ainsi que dans le journal d&apos;audit comme une offre accordée par l&apos;administration.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Sparkles size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  {confirmModalData.targetPremium
                    ? "L'utilisateur profitera immédiatement de tous les avantages Premium (CV complet, entretiens vidéo certifiés IA, filtres avancés)."
                    : "L'utilisateur repassera au niveau Standard (accès gratuit standard)."}
                </p>
              </div>
            </div>

            {/* Actions modal */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModalData(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer text-center"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={loadingId === confirmModalData.user.id}
                onClick={handleConfirmToggle}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                  confirmModalData.targetPremium
                    ? "bg-gradient-to-r from-[#008de4] to-[#32A8D7] hover:from-blue-600 hover:to-[#2891bb]"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {loadingId === confirmModalData.user.id ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : confirmModalData.targetPremium ? (
                  <>
                    <Zap size={15} />
                    Confirmer l&apos;activation
                  </>
                ) : (
                  <>
                    <XCircle size={15} />
                    Confirmer la désactivation
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
