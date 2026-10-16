"use client";

import React, { ReactNode, useState } from "react";
import { useTranslations } from "next-intl";
import { Modal, ConfirmModal as CentralConfirmModal } from "@/app/components/ui/Modal";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import SharedLogoutModal from "@/app/components/LogoutModal";

// ─── Generic Confirmation Modal ───────────────────────────────────────────────
export interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
}

export function ConfirmModal({
  title,
  message,
  confirmLabel,
  cancelLabel = "Non, continuer",
  isDanger = false,
  onConfirm,
  onCancel,
  children,
}: ConfirmModalProps) {
  return (
    <CentralConfirmModal
      isOpen={true}
      onClose={onCancel}
      onConfirm={onConfirm}
      title={title}
      message={message}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      variant={isDanger ? "danger" : "primary"}
    >
      {children}
    </CentralConfirmModal>
  );
}

// ─── Success Modal ("Offre publiée") ─────────────────────────────────────────
export interface SuccessModalProps {
  title: string;
  message: string;
  primaryLabel: string;
  secondaryLabel?: string;
  onPrimary: () => void;
  onSecondary?: () => void;
}

export function SuccessModal({
  title,
  message,
  primaryLabel,
  secondaryLabel = "Retour",
  onPrimary,
  onSecondary,
}: SuccessModalProps) {
  return (
    <Modal
      isOpen={true}
      onClose={onSecondary || onPrimary}
      title={title}
      description={message}
      icon={<CheckCircle2 size={24} className="text-emerald-600" />}
      iconColor="success"
      maxWidth="max-w-md"
    >
      <div className="flex gap-3 w-full mt-6">
        {onSecondary && (
          <button
            type="button"
            onClick={onSecondary}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {secondaryLabel}
          </button>
        )}
        <button
          type="button"
          onClick={onPrimary}
          className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#1e8ae9] to-[#32A8D7] hover:from-[#1877c9] hover:to-[#2896c2] text-white text-sm font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          {primaryLabel}
        </button>
      </div>
    </Modal>
  );
}

// ─── Suppression Modal (with CustomSelect dropdown) ───────────────────────────
export interface DeleteAccountModalProps {
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}

export function DeleteAccountModal({ onCancel, onConfirm }: DeleteAccountModalProps) {
  const t = useTranslations("recruiter.modals");
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const handleConfirm = () => {
    const finalReason = reason === "other" ? customReason : reason;
    if (!finalReason.trim()) {
      alert(t("pleaseProvideReason"));
      return;
    }
    onConfirm(finalReason);
  };

  const REASONS = [
    { label: t("reasonNotNeeded"), value: t("reasonNotNeeded") },
    { label: t("reasonOtherSolution"), value: t("reasonOtherSolution") },
    { label: t("reasonNotMatching"), value: t("reasonNotMatching") },
    { label: t("reasonTechnicalIssue"), value: t("reasonTechnicalIssue") },
    { label: t("reasonOther"), value: "other" },
  ];

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title={t("confirmDelete")}
      description={t("deleteAccountDesc")}
      icon={<AlertTriangle size={24} className="text-rose-600" />}
      iconColor="danger"
      maxWidth="max-w-lg"
    >
      <div className="space-y-3 my-3">
        <label className="text-xs font-semibold text-slate-700 block">
          {t("reasonPlaceholder") || "Veuillez sélectionner un motif de départ :"}
        </label>
        
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {REASONS.map((r) => (
            <label
              key={r.value}
              onClick={() => setReason(r.value)}
              className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                reason === r.value
                  ? "border-red-400 bg-red-50/50 text-slate-900 font-medium"
                  : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
              }`}
            >
              <input
                type="radio"
                name="deleteReason"
                checked={reason === r.value}
                onChange={() => setReason(r.value)}
                className="mt-0.5 text-red-600 focus:ring-red-500 border-slate-300 shrink-0 cursor-pointer"
              />
              <span className="leading-snug">{r.label}</span>
            </label>
          ))}
        </div>

        {reason === "other" && (
          <textarea
            placeholder={t("specifyReason")}
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs outline-none focus:border-red-400 focus:bg-white transition-colors mt-2"
            rows={3}
          />
        )}
      </div>

      <div className="flex items-center gap-3 mt-6 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer text-center whitespace-nowrap"
        >
          {t("cancel")}
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!reason || (reason === "other" && !customReason.trim())}
          className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-red-500/20 transition-all cursor-pointer text-center whitespace-nowrap"
        >
          {t("deleteAccountBtn")}
        </button>
      </div>
    </Modal>
  );
}

// ─── Logout Modal ─────────────────────────────────────────────────────────────
export function LogoutModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return <SharedLogoutModal onCancel={onCancel} onConfirm={onConfirm} />;
}
