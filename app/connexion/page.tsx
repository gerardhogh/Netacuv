"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { Eye, EyeOff, Lock, Mail, AlertCircle, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import GoogleAuthModal from "../components/GoogleAuthModal";
import Navbar from "../components/Navbar";

type UserRole = "talent" | "recruteur" | "admin";

export default function ConnexionPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [tab, setTab] = useState<UserRole>("talent");
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const errorParam = params.get("error");
      if (errorParam) {
        if (errorParam === "Callback" || errorParam === "OAuthCallback") {
          setError("La connexion avec Google a échoué. Assurez-vous que l'URL de redirection est configurée dans Google Cloud Console, ou connectez-vous avec votre adresse email et mot de passe.");
        } else if (errorParam === "OAuthAccountNotLinked") {
          setError("Cet email est déjà lié à un compte existant. Connectez-vous avec votre mot de passe.");
        } else {
          setError(errorParam);
        }
      }
      const messageParam = params.get("message");
      if (messageParam) {
        setSuccessMessage(messageParam);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFormError("");

    if (!email.trim() || !password.trim()) {
      setFormError("Veuillez renseigner votre email et mot de passe.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        const errLower = result.error.toLowerCase();
        if (
          errLower.includes("google") ||
          errLower.includes("continuer avec google")
        ) {
          setError(result.error);
        } else if (errLower.includes("trop de tentatives") || errLower.includes("bloqué")) {
          setError(result.error);
        } else if (
          errLower.includes("aucun compte") ||
          errLower.includes("non trouvé") ||
          errLower.includes("introuvable") ||
          errLower.includes("pas de compte") ||
          errLower.includes("n'existe pas")
        ) {
          setError(result.error);
        } else {
          setFormError(result.error);
        }
      } else {
        try {
          const session = await getSession();
          const userRole = (session?.user as any)?.role?.toString()?.toUpperCase() || "";
          const isAdmin = [
            "SUPER ADMIN", "ADMIN", "ADMINISTRATEUR",
            "ADMIN RH / MODÉRATEUR", "MANAGER IA & CERTIFICATION",
            "GESTIONNAIRE FINANCIER", "SUPPORT CLIENT"
          ].includes(userRole);

          if (isAdmin) {
            window.location.href = "/dashboard/admin";
          } else if (userRole === "RECRUTEUR" || userRole === "RECRUITER" || tab === "recruteur") {
            window.location.href = "/dashboard/recruteur";
          } else {
            window.location.href = "/dashboard/talent";
          }
        } catch {
          window.location.href = "/dashboard";
        }
      }
    } catch (err) {
      setFormError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      // Create cookies to remember the intended role and the auth action
      document.cookie = `netacuv_intended_role=${tab}; path=/; max-age=3600`;
      document.cookie = `netacuv_auth_action=login; path=/; max-age=3600`;
      
      await signIn("google", {
        callbackUrl:
          tab === "admin"
            ? "/dashboard/admin"
            : tab === "recruteur"
            ? "/dashboard/recruteur"
            : "/dashboard/talent",
      });
    } catch (e) {
      console.error("Unexpected error:", e);
      setError("Une erreur inattendue s'est produite lors de la connexion Google.");
      setGoogleLoading(false);
    }
  };

  const clearError = () => {
    setError("");
    if (typeof window !== "undefined") {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("error");
      window.history.replaceState({}, "", newUrl.toString());
    }
  };

  const clearSuccess = () => {
    setSuccessMessage("");
    if (typeof window !== "undefined") {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("message");
      window.history.replaceState({}, "", newUrl.toString());
    }
  };

  return (
    <div
      style={{ backgroundColor: "#061527", color: "#ffffff" }}
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-[#0b223d] via-[#061527] to-[#030b14] font-sans pt-24 pb-8 px-4 text-center selection:bg-sky-400/30 text-white"
    >
      {/* Ambient Lighting & Glows bleu nuit teintés Netacuv */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 bg-[#32A8D7]/20 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-[30rem] h-[30rem] bg-[#1e8ae9]/20 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[45rem] h-[45rem] bg-[#0c3e70]/30 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute top-1/4 right-1/4 w-80 h-80 bg-[#f97316]/10 rounded-full blur-3xl" />

      {/* Netacuv "N" Symbol Watermarks in Background */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden select-none">
        <div className="w-[580px] h-[580px] max-w-[90vw] max-h-[90vw] opacity-[0.02] transform -rotate-12 scale-110">
          <Image
            src="/Logo/SVG/Asset 14.svg"
            alt=""
            width={580}
            height={580}
            className="w-full h-full object-contain"
            priority
          />
        </div>
        <div className="absolute -top-16 -right-16 w-80 h-80 opacity-[0.015] transform rotate-12">
          <Image
            src="/Logo/SVG/Asset 14.svg"
            alt=""
            width={320}
            height={320}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 opacity-[0.015] transform -rotate-6">
          <Image
            src="/Logo/SVG/Asset 14.svg"
            alt=""
            width={320}
            height={320}
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Navbar overlay */}
      <div className="absolute top-0 w-full z-20">
        <Navbar variant="auth" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center max-w-md w-full mt-4 md:mt-8">
        {/* Card Modal (Cadre en bleu nuit dégradé avec bordure animée) */}
        <div className="animated-gradient-stroke shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_35px_rgba(50,168,215,0.2)] w-full transition-all duration-300">
          <div className="relative z-10 bg-gradient-to-b from-[#0e2747] via-[#091b32] to-[#051323] p-6 sm:p-8 rounded-[14px] w-full border border-sky-400/20 backdrop-blur-xl text-left">
            {/* Header */}
            <div className="text-center mb-5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1.5 tracking-tight">
                Connectez-vous
              </h1>
              <p className="text-xs sm:text-sm text-blue-100/80">
                Vous n&apos;avez pas de compte ?{" "}
                <Link href="/inscription" className="font-bold text-[#32A8D7] hover:text-sky-300 underline underline-offset-2 transition-colors">
                  Créer un compte
                </Link>
              </p>
            </div>

            {/* Role selector */}
            <div className="flex gap-2 w-full p-1 bg-black/30 border border-white/10 rounded-xl mb-5">
              {(["talent", "recruteur"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg capitalize transition-all ${
                    tab === t
                      ? "bg-[#32A8D7] text-white shadow-md"
                      : "text-blue-100/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}s
                </button>
              ))}
            </div>

            {/* Modal d'erreur globale / Redirection inscription */}
            {error && (() => {
              const isNoAccountError =
                error.toLowerCase().includes("pas de compte") ||
                error.toLowerCase().includes("n'existe pas") ||
                error.toLowerCase().includes("non trouvé") ||
                error.toLowerCase().includes("introuvable") ||
                error.toLowerCase().includes("aucun compte");

              return (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div 
                    className="absolute inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity" 
                    onClick={clearError}
                  ></div>
                  <div className="relative bg-gradient-to-b from-[#0e2747] via-[#091b32] to-[#051323] w-full max-w-sm rounded-2xl shadow-2xl p-6 sm:p-8 text-center animate-fade-in-up border border-sky-400/20">
                    <div className="w-16 h-16 bg-[#32A8D7]/15 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#32A8D7]/30 shadow-[0_0_20px_rgba(50,168,215,0.25)]">
                      {isNoAccountError ? (
                        <UserPlus className="w-8 h-8 text-[#32A8D7]" />
                      ) : (
                        <AlertCircle className="w-8 h-8 text-red-400" />
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
                      {isNoAccountError ? "Compte introuvable" : "Oups !"}
                    </h3>
                    <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                      {isNoAccountError
                        ? "Vous n'avez pas encore de compte sur Netacuv. Pour accéder à la plateforme, vous devez d'abord vous inscrire."
                        : error}
                    </p>

                    {isNoAccountError ? (
                      <div className="flex flex-col gap-2.5">
                        <Link
                          href={`/inscription?type=${tab}`}
                          onClick={clearError}
                          className="w-full py-3 bg-[#32A8D7] hover:bg-[#2891bb] text-white rounded-xl font-bold transition-all shadow-md text-sm text-center block"
                        >
                          S&apos;inscrire sur Netacuv
                        </Link>
                        <button
                          type="button"
                          onClick={clearError}
                          className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                        >
                          Réessayer
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={clearError}
                        className="w-full py-3 bg-[#32A8D7] hover:bg-[#2891bb] text-white rounded-xl font-bold transition-all shadow-md text-sm"
                      >
                        J&apos;ai compris
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Form Error */}
            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center gap-2.5 text-xs text-red-200">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-200 relative pr-7">
                <span className="font-medium">{successMessage}</span>
                <button 
                  onClick={clearSuccess}
                  className="absolute top-2.5 right-2 text-emerald-300 hover:text-white"
                  aria-label="Fermer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Bouton Google Login (Gmail) en tête */}
            <div className="mb-5">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading || googleLoading}
                id="btn-google-connexion"
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 active:scale-[0.99] transition-all text-sm font-bold text-white shadow-sm disabled:opacity-50"
              >
                {googleLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-transparent rounded-full animate-spin"></div>
                    <span>Connexion à Google...</span>
                  </>
                ) : (
                  <>
                    <Image
                      src="/assets/google 1.png"
                      alt="Google Logo"
                      width={20}
                      height={20}
                      className="object-contain"
                    />
                    <span>Continuer avec Google</span>
                  </>
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-white/10"></div>
              <span className="text-blue-200/50 text-xs font-medium uppercase tracking-wider">ou avec e-mail</span>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>

            {/* Formulaire classique */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Adresse e-mail
                </label>
                <div className="relative">
                  <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemple@email.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#32A8D7] focus:ring-1 focus:ring-[#32A8D7] transition-all [&:-webkit-autofill]:shadow-[0_0_0_1000px_#091b32_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                    id="email-connexion"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Mot de passe
                  </label>
                  <Link
                    href="/mot-de-passe-oublie"
                    className="text-xs font-medium text-sky-400 hover:text-sky-300 transition-colors"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
                <div className="relative">
                  <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-11 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#32A8D7] focus:ring-1 focus:ring-[#32A8D7] transition-all [&:-webkit-autofill]:shadow-[0_0_0_1000px_#091b32_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                    id="password-connexion"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    aria-label="Afficher le mot de passe"
                  >
                    {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>



              <button
                type="submit"
                disabled={isLoading || !email || !password}
                id="btn-connexion"
                className="w-full py-3 px-6 rounded-xl font-bold text-white bg-[#32A8D7] hover:bg-[#2891bb] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2 text-sm mt-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Connexion en cours...
                  </>
                ) : (
                  "Se connecter"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
