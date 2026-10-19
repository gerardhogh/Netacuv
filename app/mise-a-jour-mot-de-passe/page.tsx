"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Lock, Eye, EyeOff, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import Navbar from "../components/Navbar";

function UpdatePasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const token = searchParams?.get("token");
  const emailParam = searchParams?.get("email");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // To handle the case where user opens this page without a hash
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    // Si pas de token ou d'email dans l'URL, c'est invalide
    if (!token || !emailParam) {
      setError("Le lien de réinitialisation est invalide ou a expiré. Veuillez refaire la demande.");
    }
    setCheckingSession(false);
  }, [token, emailParam]);

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const isValid = hasMinLength && hasUppercase && hasNumber && hasSpecial && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isValid) {
      setError("Le mot de passe ne respecte pas les critères ou les mots de passe ne correspondent pas.");
      return;
    }

    if (!token || !emailParam) {
      setError("Lien invalide.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token,
          email: emailParam,
          password: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de la synchronisation de la base de données");
        setIsLoading(false);
        return;
      }
      
      router.push("/connexion?message=Mot+de+passe+mis+%C3%A0+jour+avec+succ%C3%A8s.+Veuillez+vous+connecter.");
    } catch (err: any) {
      console.error(err);
      setError("Une erreur est survenue lors de l'enregistrement de votre nouveau mot de passe.");
    } finally {
      setIsLoading(false);
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
          <div className="relative z-10 bg-gradient-to-b from-[#0e2747] via-[#091b32] to-[#051323] p-7 sm:p-9 rounded-[14px] w-full border border-sky-400/20 backdrop-blur-xl text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 text-center tracking-tight">
              Nouveau mot de passe
            </h1>
            <p className="text-center text-sm mb-6 text-slate-300">
              Veuillez définir votre nouveau mot de passe sécurisé.
            </p>

            {checkingSession ? (
              <div className="flex flex-col items-center justify-center py-10">
                <div className="w-8 h-8 border-3 border-[#32A8D7] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-sm text-slate-400">Vérification du lien sécurisé...</p>
              </div>
            ) : error && !isValid && !password ? (
              <div className="mb-6 p-5 rounded-xl bg-red-500/15 border border-red-500/30 flex flex-col items-center gap-3 text-center">
                <AlertCircle size={32} className="text-red-400" />
                <span className="text-sm text-red-200 font-medium leading-relaxed">{error}</span>
                <Link
                  href="/mot-de-passe-oublie"
                  className="mt-2 text-sm font-bold text-[#32A8D7] hover:underline"
                >
                  Refaire la demande
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center gap-2 text-xs text-red-200">
                    <AlertCircle size={16} className="flex-shrink-0 text-red-400" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Nouveau mot de passe */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <Lock
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type={showPwd ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-11 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#32A8D7] focus:ring-1 focus:ring-[#32A8D7] transition-all [&:-webkit-autofill]:shadow-[0_0_0_1000px_#091b32_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  
                  {/* Instructions */}
                  <div className="mt-3 space-y-1.5 pl-1">
                    <div className="flex items-center gap-2 text-xs">
                      {hasMinLength ? <CheckCircle2 size={14} className="text-[#32A8D7]" /> : <XCircle size={14} className="text-slate-500" />}
                      <span className={hasMinLength ? "text-[#32A8D7] font-medium" : "text-slate-400"}>Au moins 8 caractères</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {hasUppercase ? <CheckCircle2 size={14} className="text-[#32A8D7]" /> : <XCircle size={14} className="text-slate-500" />}
                      <span className={hasUppercase ? "text-[#32A8D7] font-medium" : "text-slate-400"}>Une lettre majuscule</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {hasNumber ? <CheckCircle2 size={14} className="text-[#32A8D7]" /> : <XCircle size={14} className="text-slate-500" />}
                      <span className={hasNumber ? "text-[#32A8D7] font-medium" : "text-slate-400"}>Un chiffre</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {hasSpecial ? <CheckCircle2 size={14} className="text-[#32A8D7]" /> : <XCircle size={14} className="text-slate-500" />}
                      <span className={hasSpecial ? "text-[#32A8D7] font-medium" : "text-slate-400"}>Un caractère spécial</span>
                    </div>
                  </div>
                </div>

                {/* Confirmer le mot de passe */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <Lock
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type={showConfirmPwd ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-11 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#32A8D7] focus:ring-1 focus:ring-[#32A8D7] transition-all [&:-webkit-autofill]:shadow-[0_0_0_1000px_#091b32_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showConfirmPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && password !== confirmPassword && (
                    <p className="text-xs text-red-400 mt-1.5 pl-1">Les mots de passe ne correspondent pas.</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !isValid}
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-[#32A8D7] hover:bg-[#2891bb] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] transition-all shadow-lg flex items-center justify-center gap-2 text-sm mt-4"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Mise à jour...
                    </>
                  ) : (
                    "Enregistrer le nouveau mot de passe"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UpdatePasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Chargement...</div>}>
      <UpdatePasswordForm />
    </Suspense>
  );
}
