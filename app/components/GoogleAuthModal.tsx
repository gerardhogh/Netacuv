"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth, UserRole } from "../context/AuthContext";
import { X, CheckCircle, ArrowRight } from "lucide-react";
import { signIn } from "next-auth/react";

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: UserRole;
  isSignUp?: boolean;
}

export default function GoogleAuthModal({
  isOpen,
  onClose,
  defaultRole = "talent",
  isSignUp = false,
}: GoogleAuthModalProps) {
  const router = useRouter();
  const { loginWithGoogle } = useAuth();
  const [role, setRole] = useState<UserRole>(defaultRole);
  const [customEmail, setCustomEmail] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSelectAccount = async (name: string, email: string) => {
    setIsLoading(true);
    try {
      await signIn("google", {
        callbackUrl:
          role === "admin"
            ? "/dashboard/admin"
            : role === "recruteur"
              ? "/dashboard/recruteur"
              : "/dashboard/talent",
      });
    } catch (err) {
      setIsLoading(false);
      alert("Erreur de connexion avec Google");
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes("@")) return;
    const extractedName = customEmail.split("@")[0].replace(/[._-]/g, " ");
    const formattedName =
      extractedName.charAt(0).toUpperCase() + extractedName.slice(1);
    handleSelectAccount(formattedName, customEmail);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 relative flex items-center justify-center">
              <Image
                src="/assets/google 1.png"
                alt="Google"
                width={28}
                height={28}
                className="object-contain"
              />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base leading-none">
                Google Identity
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {isSignUp
                  ? "Création rapide de compte"
                  : "Connexion sécurisée en 1 clic"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="py-8 text-center flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-4 animate-bounce">
                <CheckCircle size={32} />
              </div>
              <h4 className="text-xl font-bold text-slate-800 mb-1">
                Connexion réussie !
              </h4>
              <p className="text-sm text-slate-500">
                Redirection vers votre espace {role}...
              </p>
            </div>
          ) : (
            <>
              {/* Role selection toggle */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Se connecter en tant que :
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setRole("talent")}
                    className={`py-2 text-xs font-semibold rounded-lg transition-all ${role === "talent"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                      }`}
                  >
                    Talent
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("recruteur")}
                    className={`py-2 text-xs font-semibold rounded-lg transition-all ${role === "recruteur"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                      }`}
                  >
                    Recruteur
                  </button>
                </div>
              </div>

              {!useCustom ? (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600 font-medium">
                    Choisissez un compte Google pour continuer sur{" "}
                    <span className="text-blue-600 font-bold">Netacuv</span>
                  </p>

                  {/* Primary Google account card */}
                  <button
                    onClick={() =>
                      handleSelectAccount("Candidat", "candidat@email.com")
                    }
                    disabled={isLoading}
                    className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all text-left group"
                  >
                    <div className="w-11 h-11 rounded-full overflow-hidden relative border border-slate-200 flex-shrink-0">
                      <Image
                        src="/assets/avatar_africain.jpg"
                        alt="Candidat"
                        width={44}
                        height={44}
                        className="object-cover w-full h-full object-center"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                        Candidat
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        candidat@gmail.com
                      </p>
                    </div>
                    <ArrowRight
                      size={16}
                      className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all"
                    />
                  </button>

                  {/* Recruiter Google account card */}
                  <button
                    onClick={() => {
                      setRole("recruteur");
                      handleSelectAccount("Grand-G Corp", "contact.grandg@gmail.com");
                    }}
                    disabled={isLoading}
                    className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all text-left group"
                  >
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                      GG
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                        Grand-G Recrutement
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        contact.grandg@gmail.com
                      </p>
                    </div>
                    <ArrowRight
                      size={16}
                      className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all"
                    />
                  </button>

                  {/* Use another account */}
                  <button
                    type="button"
                    onClick={() => setUseCustom(true)}
                    className="w-full py-2.5 text-center text-xs font-semibold text-slate-500 hover:text-blue-600 hover:underline transition-colors mt-2"
                  >
                    Utiliser un autre compte Gmail
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCustomSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Adresse Gmail
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="votre.nom@gmail.com"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      className="input-field"
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setUseCustom(false)}
                      className="btn-outline flex-1 justify-center py-2.5 text-xs"
                    >
                      Retour
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary flex-1 justify-center py-2.5 text-xs"
                    >
                      {isLoading ? "Connexion..." : "Continuer"}
                    </button>
                  </div>
                </form>
              )}

              {isLoading && (
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-blue-600 font-medium">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  Authentification Google en cours...
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Protection SSL 256-bit</span>
          <span>Google OAuth 2.0</span>
        </div>
      </div>
    </div>
  );
}
