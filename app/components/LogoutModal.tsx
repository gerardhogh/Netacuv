"use client";

import React from "react";
import { LogOut } from "lucide-react";
import { ConfirmModal } from "@/app/components/ui/Modal";

import { useTranslations } from "next-intl";

interface LogoutModalProps {
  onCancel: () => void;
  onConfirm: () => void;
}

export default function LogoutModal({ onCancel, onConfirm }: LogoutModalProps) {
  const t = useTranslations("modals.logout");
  return (
    <ConfirmModal
      isOpen={true}
      onClose={onCancel}
      onConfirm={onConfirm}
      title={t("title")}
      message={t("message")}
      confirmLabel={t("confirm")}
      cancelLabel={t("cancel")}
      variant="danger"
      icon={<LogOut size={22} className="text-rose-600" />}
    />
  );
}
