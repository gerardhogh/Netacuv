"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import GoogleAuthModal from "../components/GoogleAuthModal";
import Navbar from "../components/Navbar";

type UserRole = "talent" | "recruteur" | "admin";

export default function ConnexionPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(true);
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
        setError(errorParam);
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
        setFormError(result.error);
      } else {
        // Redirection dynamique gérée après le login, par exemple via le callback,
        // Mais ici, on va rediriger vers le dashboard par défaut (ou on pourrait vérifier la session).
        // Si l'utilisateur est admin, on devrait l'envoyer vers /dashboard/admin. 
        // Pour simplifier l'UI sans await getSession(), on redirige vers le tab sélectionné s'il était bon, ou on fetch la session.
        if (email.trim().toLowerCase() === "admin@gmail.com") {
          router.push("/dashboard/admin");
        } else if (tab === "recruteur") {
          router.push("/dashboard/recruteur");
        } else {
          router.push("/dashboard/talent");
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
    <div className="h-screen flex flex-col items-center justify-center bg-[#002B49] px-4 pt-20 pb-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#32A8D7] blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#32A8D7] blur-[120px]"></div>
      </div>

      {/* Navbar overlay */}
      <div className="absolute top-0 w-full z-20">
        <Navbar variant="auth" />
      </div>

      <div className="z-10 w-full max-w-md animate-fade-in-up mt-6 md:mt-12">
        {/* Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl flex flex-col max-h-[calc(100vh-140px)] overflow-hidden">
          {/* Fixed Header */}
          <div className="pt-6 px-6 md:pt-8 md:px-8 pb-4 shrink-0 border-b border-white/10 shadow-sm">
            <div className="text-center mb-5">
              <h1 className="text-2xl font-bold text-white mb-1.5">Connectez-vous</h1>
              <p className="text-sm text-blue-100/80">
                Je n&apos;ai pas de compte sur Netacuv{" "}
                <Link href="/inscription" className="font-bold text-white hover:text-blue-200 transition-colors">
                  En créer un !
                </Link>
              </p>
            </div>

            <div className="flex gap-2 w-full p-1 bg-black/20 rounded-xl">
            {(["talent", "recruteur"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg capitalize transition-all ${
                  tab === t
                    ? "bg-[#32A8D7] text-white shadow-md"
                    : "text-blue-100 hover:bg-white/10"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}s
              </button>
            ))}
            </div>
          </div>

          {/* Scrollable Form Content */}
          <div className="px-6 md:px-8 py-4 overflow-y-auto custom-scrollbar flex-1">
          {error && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
                onClick={clearError}
              ></div>
              <div className="relative bg-[#002B49] w-full max-w-sm rounded-3xl shadow-2xl p-8 text-center animate-fade-in-up border border-white/10">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm border border-red-500/30">
                  <AlertCircle className="w-10 h-10 text-red-400" />
                </div>
                <h3 className="text-2xl font-black text-white mb-3 tracking-tight">Oups !</h3>
                <p className="text-sm text-blue-100/80 mb-8 leading-relaxed font-medium">{error}</p>
                <button
                  onClick={clearError}
                  className="w-full py-3.5 bg-[#32A8D7] hover:bg-[#2a95c2] text-white rounded-xl font-bold transition-all active:scale-[0.98] shadow-md"
                >
                  J'ai compris
                </button>
              </div>
            </div>
          )}

          {formError && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/20 border border-red-500/50 flex items-center gap-3 text-sm text-red-100">
              <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-start gap-3 text-sm text-emerald-100 relative pr-8">
              <div className="mt-0.5">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="font-medium">{successMessage}</span>
              <button 
                onClick={clearSuccess}
                className="absolute top-2.5 right-2 text-emerald-300 hover:text-emerald-100 transition-colors"
                aria-label="Fermer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-blue-100 mb-1.5">
                Adresse e-mail
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-300" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemple@email.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-[#32A8D7] focus:border-transparent transition-all [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                  id="email-connexion"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-100 mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-300" />
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-[#32A8D7] focus:border-transparent transition-all [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                  id="password-connexion"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
                  aria-label="Afficher le mot de passe"
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <Link
                  href="/mot-de-passe-oublie"
                  className="text-xs font-medium text-blue-300 hover:text-white transition-colors"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2.5 pt-1">
              <input
                type="checkbox"
                id="remember-me"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#32A8D7] focus:ring-[#32A8D7] focus:ring-offset-0"
              />
              <label
                htmlFor="remember-me"
                className="text-xs text-blue-100 cursor-pointer font-medium select-none"
              >
                Rester connecté
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              id="btn-connexion"
              className="w-full py-3 px-6 mt-1 rounded-xl font-bold text-white bg-[#32A8D7] hover:bg-[#2891bb] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-blue-200/60 text-xs font-medium">ou</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          {/* Social login buttons */}
          <div className="flex w-full">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading || googleLoading}
              id="btn-google-connexion"
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 active:scale-[0.99] transition-all text-sm font-bold text-white shadow-sm disabled:opacity-50"
            >
              {googleLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/40 border-t-transparent rounded-full animate-spin"></div>
                  Connexion à Google...
                </>
              ) : (
                <>
                  <Image
                    src="/assets/google 1.png"
                    alt="Google Logo"
                    width={20}
                    height={20}
                    className="object-contain bg-white rounded-full p-0.5"
                  />
                  Connexion avec Google
                </>
              )}
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
