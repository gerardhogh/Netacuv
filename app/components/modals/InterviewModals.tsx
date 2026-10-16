"use client";

import { Modal } from "../ui/Modal";
import { Trash2, Video } from "lucide-react";
import { useTranslations } from "next-intl";

export function StartInterviewModal({ isOpen, onClose, onConfirm }: { isOpen: boolean, onClose: () => void, onConfirm: () => void }) {
  const t = useTranslations("interview.modals");
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("startTitle")}
      description={t("startDesc")}
    >
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-3 sm:mt-4">
        <button 
          onClick={onClose}
          className="w-full sm:w-auto px-4 py-2 rounded-md text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors text-center cursor-pointer"
        >
          {t("startCancel")}
        </button>
        <button 
          onClick={() => { onClose(); onConfirm(); }}
          className="w-full sm:w-auto px-4 py-2 rounded-md text-xs sm:text-sm font-medium bg-[#008de4] text-white hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <Video size={16} />
          {t("startConfirm")}
        </button>
      </div>
    </Modal>
  );
}

export function CancelInterviewModal({ isOpen, onClose, onConfirm }: { isOpen: boolean, onClose: () => void, onConfirm: () => void }) {
  const t = useTranslations("interview.modals");
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("cancelTitle")}
      description={t("cancelDesc")}
    >
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-3 sm:mt-4">
        <button 
          onClick={() => { onClose(); onConfirm(); }}
          className="w-full sm:w-auto px-4 py-2 rounded-md text-xs sm:text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors text-center cursor-pointer"
        >
          {t("cancelLeave")}
        </button>
        <button 
          onClick={onClose}
          className="w-full sm:w-auto px-4 py-2 rounded-md text-xs sm:text-sm font-medium bg-[#008de4] text-white hover:bg-blue-600 transition-colors text-center cursor-pointer shadow-sm"
        >
          {t("cancelContinue")}
        </button>
      </div>
    </Modal>
  );
}

export function DeleteVideoModal({ isOpen, onClose, onConfirm }: { isOpen: boolean, onClose: () => void, onConfirm: () => void }) {
  const t = useTranslations("interview.modals");
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("deleteTitle")}
      description={t("deleteDesc")}
    >
      <div className="flex justify-end gap-3 mt-2">
        <button 
          onClick={onClose}
          className="px-4 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
        >
          {t("deleteKeep")}
        </button>
        <button 
          onClick={() => { onClose(); onConfirm(); }}
          className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2"
        >
          <Trash2 size={16} />
          {t("deleteConfirm")}
        </button>
      </div>
    </Modal>
  );
}

export function ReplaceVideoModal({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const t = useTranslations("interview.modals");
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("replaceTitle")}
      description={t("replaceDesc")}
      maxWidth="max-w-lg"
    >
      <div className="flex flex-col-reverse sm:flex-row justify-end items-stretch sm:items-center gap-2.5 sm:gap-3 mt-4">
        <button
          onClick={onClose}
          className="w-full sm:w-auto px-4 py-2.5 rounded-md text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors whitespace-nowrap text-center cursor-pointer"
        >
          {t("replaceCancel")}
        </button>
        <button
          onClick={() => {
            onClose();
            onConfirm();
          }}
          className="w-full sm:w-auto px-5 py-2.5 rounded-md text-xs sm:text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center justify-center gap-2 shadow-sm whitespace-nowrap cursor-pointer"
        >
          <Trash2 size={16} />
          {t("replaceConfirm")}
        </button>
      </div>
    </Modal>
  );
}
