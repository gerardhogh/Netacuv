"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Lock, Eye, EyeOff, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // To handle the case where user opens this page without a hash
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Supabase intercepte automatiquement le hash #access_token=... dans l'URL
    // et déclenche un événement onAuthStateChange
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      
      if (event === "PASSWORD_RECOVERY" || session) {
        setCheckingSession(false);
      }
    });

    // Cas où on ouvre la page avec une session déjà active, ou si l'event ne se lance pas
    const checkInitialSession = async () => {
      const { data } = await supabase.auth.getSession();
      
      // Laisser le temps à l'event listener de catcher le hash (PKCE ou implicite)
      setTimeout(() => {
        if (!mounted) return;
        if (!data.session && window.location.hash.indexOf("type=recovery") === -1 && window.location.hash.indexOf("access_token=") === -1) {
          setError("Le lien de réinitialisation est invalide ou a expiré. Veuillez refaire la demande.");
          setCheckingSession(false);
        }
      }, 1500);
    };

    checkInitialSession();

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

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

    setIsLoading(true);

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      setError("Session expirée. Veuillez refaire la demande.");
      setIsLoading(false);
      return;
    }

    // 1. Update password in Supabase Auth
    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    });

    if (updateError) {
      setError(updateError.message);
      setIsLoading(false);
      return;
    }

    // 2. Sync new password hash to Prisma DB for NextAuth Credentials
    try {
      const res = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: sessionData.session.access_token,
          password: password,
        }),
      });

      if (!res.ok) {
        throw new Error("Erreur lors de la synchronisation de la base de données");
      }
    } catch (err: any) {
      console.error(err);
      setError("Une erreur est survenue lors de l'enregistrement de votre nouveau mot de passe.");
      setIsLoading(false);
      return;
    }

    // Supabase will automatically sign in the user after password update (if they aren't already), 
    // but the flow requires redirecting them to login to re-enter credentials for security.
    await supabase.auth.signOut();
    router.push("/connexion?message=Mot+de+passe+mis+%C3%A0+jour+avec+succ%C3%A8s.+Veuillez+vous+connecter.");
  };

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{
        backgroundImage: "url('/assets/Fond.png')",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        backgroundPosition: "center",
      }}
    >
      {/* Top Logo */}
      <div className="w-full flex justify-center pt-8 md:pt-12">
        <Link href="/" className="relative h-10 w-40 transition-opacity hover:opacity-90">
          <Image
            src="/Logo/PNG/Logo.png"
            alt="Netacuv Logo"
            fill
            sizes="(max-width: 768px) 150px, 192px"
            className="object-contain"
            priority
          />
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100 animate-fade-in-up">
          <h1 className="text-2xl font-extrabold text-center mb-2" style={{ color: "#32A8D7" }}>
            Nouveau mot de passe
          </h1>
          <p className="text-center text-sm mb-6 text-slate-500">
            Veuillez définir votre nouveau mot de passe.
          </p>

          {checkingSession ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="w-8 h-8 border-4 border-[#32A8D7] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-sm text-slate-500">Vérification du lien sécurisé...</p>
            </div>
          ) : error && !isValid && !password ? (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex flex-col items-center gap-3 text-center">
              <AlertCircle size={32} className="text-red-500" />
              <span className="text-sm text-red-600 font-medium">{error}</span>
              <Link
                href="/mot-de-passe-oublie"
                className="mt-2 text-sm font-bold text-[#32A8D7] hover:underline"
              >
                Refaire la demande
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-600">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Nouveau mot de passe */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-11 py-3 bg-[#F9FAFB] border-0 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#32A8D7] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                
                {/* Instructions */}
                <div className="mt-3 space-y-1.5 pl-1">
                  <div className="flex items-center gap-2 text-xs">
                    {hasMinLength ? <CheckCircle2 size={14} className="text-green-500" /> : <XCircle size={14} className="text-slate-300" />}
                    <span className={hasMinLength ? "text-green-600 font-medium" : "text-slate-500"}>Au moins 8 caractères</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {hasUppercase ? <CheckCircle2 size={14} className="text-green-500" /> : <XCircle size={14} className="text-slate-300" />}
                    <span className={hasUppercase ? "text-green-600 font-medium" : "text-slate-500"}>Une lettre majuscule</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {hasNumber ? <CheckCircle2 size={14} className="text-green-500" /> : <XCircle size={14} className="text-slate-300" />}
                    <span className={hasNumber ? "text-green-600 font-medium" : "text-slate-500"}>Un chiffre</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {hasSpecial ? <CheckCircle2 size={14} className="text-green-500" /> : <XCircle size={14} className="text-slate-300" />}
                    <span className={hasSpecial ? "text-green-600 font-medium" : "text-slate-500"}>Un caractère spécial</span>
                  </div>
                </div>
              </div>

              {/* Confirmer le mot de passe */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type={showConfirmPwd ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-11 py-3 bg-[#F9FAFB] border-0 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#32A8D7] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmPassword.length > 0 && password !== confirmPassword && (
                  <p className="text-xs text-red-500 mt-1 pl-1">Les mots de passe ne correspondent pas.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || !isValid}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-[#32A8D7] hover:bg-[#2a95c2] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 text-sm mt-6"
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
  );
}
