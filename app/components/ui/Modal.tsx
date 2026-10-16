"use client";

import React, { useEffect, useState, ReactNode } from "react";
import { createPortal } from "react-dom";
import { X, AlertTriangle, AlertCircle, CheckCircle2, Info } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: ReactNode;
  iconColor?: "primary" | "danger" | "warning" | "success";
  children: ReactNode;
  maxWidth?: string; // e.g. "max-w-md", "max-w-lg", "max-w-xl"
  showCloseButton?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  icon,
  iconColor = "primary",
  children,
  maxWidth = "max-w-md",
  showCloseButton = true,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted || !isOpen || typeof document === "undefined") return null;

  const iconStyles = {
    primary: "bg-blue-50 border-blue-200/80 text-[#1e8ae9]",
    danger: "bg-rose-50 border-rose-200/80 text-rose-600",
    warning: "bg-amber-50 border-amber-200/80 text-amber-600",
    success: "bg-emerald-50 border-emerald-200/80 text-emerald-600",
  }[iconColor];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop click dismiss */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div
        className={`relative z-10 w-full ${maxWidth} bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 text-left animate-in zoom-in-95 duration-200 overflow-hidden mx-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3.5">
            {icon && (
              <div
                className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 shadow-xs mt-0.5 ${iconStyles}`}
              >
                {icon}
              </div>
            )}
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight leading-snug">
                {title}
              </h3>
              {description && (
                <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          </div>

          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0 -mr-1 -mt-1"
              title="Fermer"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div>{children}</div>
      </div>
    </div>,
    document.body
  );
}

// ─── Standardized Confirmation Modal (Platform-wide) ──────────────────────────
export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary" | "warning" | "success";
  icon?: ReactNode;
  isLoading?: boolean;
  children?: ReactNode;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  variant = "primary",
  icon,
  isLoading = false,
  children,
}: ConfirmModalProps) {
  const defaultIcon = {
    danger: <AlertTriangle size={22} />,
    warning: <AlertCircle size={22} />,
    success: <CheckCircle2 size={22} />,
    primary: <Info size={22} />,
  }[variant];

  const buttonStyle = {
    primary: "bg-gradient-to-r from-[#1e8ae9] to-[#32A8D7] hover:from-[#1877c9] hover:to-[#2896c2] text-white shadow-md shadow-blue-500/20",
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/20",
    warning: "bg-[#F97316] hover:bg-[#EA580C] text-white shadow-md shadow-orange-500/20",
    success: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20",
  }[variant];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={message}
      icon={icon || defaultIcon}
      iconColor={variant}
      maxWidth="max-w-md"
    >
      {children && <div className="mb-5">{children}</div>}

      <div className="flex items-center gap-3 mt-6">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all cursor-pointer ${buttonStyle} ${
            isLoading ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Traitement..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

export default Modal;
