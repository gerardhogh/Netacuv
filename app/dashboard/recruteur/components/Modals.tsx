"use client";

import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

// ─── Generic Confirmation Modal ───────────────────────────────────────────────
interface ConfirmModalProps {
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
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-sm p-7 flex flex-col gap-5 text-center mx-auto relative">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 mb-2">{title}</h2>
          <p className="text-sm text-slate-500 leading-relaxed">{message}</p>
        </div>
        {children}
        <div className="flex gap-3 mt-1">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm transition-colors ${
              isDanger
                ? "bg-red-500 hover:bg-red-600"
                : "bg-[#32A8D7] hover:bg-[#2896c2]"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Success Modal ("Offre publiée") ─────────────────────────────────────────
interface SuccessModalProps {
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
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-sm p-7 flex flex-col gap-5 items-center text-center mx-auto relative">
        {/* Green check circle */}
        <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} className="w-8 h-8">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 mb-2">{title}</h2>
          <p className="text-sm text-slate-500">{message}</p>
        </div>
        <div className="flex gap-3 w-full mt-1">
          {onSecondary && (
            <button
              onClick={onSecondary}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {secondaryLabel}
            </button>
          )}
          <button
            onClick={onPrimary}
            className="flex-1 py-2.5 rounded-xl bg-[#32A8D7] hover:bg-[#2896c2] text-white text-sm font-semibold shadow-sm transition-colors"
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Suppression Modal (with reason selector) ───────────────────────────────
interface DeleteAccountModalProps {
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}

export function DeleteAccountModal({ onCancel, onConfirm }: DeleteAccountModalProps) {
  const [mounted, setMounted] = useState(false);
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const handleConfirm = () => {
    const finalReason = reason === "Autre raison" ? customReason : reason;
    if (!finalReason.trim()) {
      alert("Veuillez fournir une raison.");
      return;
    }
    onConfirm(finalReason);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-sm p-7 flex flex-col gap-5 text-center mx-auto relative">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 mb-2">Confirmer la suppression</h2>
          <p className="text-sm text-slate-500 mb-4">Veuillez sélectionner la raison de la suppression de votre compte :</p>
          <div className="relative text-left mb-3">
            <select 
              value={reason} 
              onChange={(e) => setReason(e.target.value)}
              className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 outline-none focus:border-[#32A8D7] focus:bg-white transition-colors cursor-pointer"
            >
              <option value="">Choisis la raison</option>
              <option>Je n'ai plus besoin du service</option>
              <option>J'ai trouvé une autre solution</option>
              <option>Le service ne correspond pas à mes besoins</option>
              <option>Problème technique</option>
              <option>Autre raison</option>
            </select>
            <svg className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          {reason === "Autre raison" && (
            <textarea
              placeholder="Précisez votre raison..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:border-[#32A8D7]"
              rows={3}
            />
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={!reason || (reason === "Autre raison" && !customReason.trim())}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-semibold shadow-sm transition-colors"
          >
            Supprimer mon compte
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Logout Modal ─────────────────────────────────────────────────────────────
import SharedLogoutModal from "@/app/components/LogoutModal";

export function LogoutModal({ onCancel, onConfirm }: { onCancel: () => void, onConfirm: () => void }) {
  return <SharedLogoutModal onCancel={onCancel} onConfirm={onConfirm} />;
}
