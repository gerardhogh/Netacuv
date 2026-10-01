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
    <div
      className="min-h-screen flex flex-col relative"
      style={{
        backgroundImage: "url('/assets/Fond.png')",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        backgroundPosition: "center",
      }}
    >
      {/* Navbar with pill transparent variant */}
      <Navbar />

      {/* Center card */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-slate-100 animate-fade-in-up">
          {/* Title */}
          <h1 className="text-3xl font-extrabold text-center mb-2" style={{ color: "#32A8D7" }}>
            Connectez -vous
          </h1>
          <p className="text-center text-sm mb-6 text-slate-500">
            Je n&apos;ai pas de compte sur Netacuv{" "}
            <Link href="/inscription" className="font-bold" style={{ color: "#32A8D7" }}>
              En créer un !
            </Link>
          </p>

          <div className="flex gap-3 mb-8 w-full">
            {(["talent", "recruteur"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`flex-1 px-4 py-2 text-sm font-semibold rounded-lg capitalize transition-all border ${
                  tab === t
                    ? "bg-[#32A8D7] text-white border-transparent shadow-md"
                    : "bg-transparent text-[#32A8D7] border-[#32A8D7] hover:bg-blue-50"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}s
              </button>
            ))}
          </div>

          {error && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
                onClick={clearError}
              ></div>
              <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 text-center animate-fade-in-up border border-slate-100">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm border border-red-100">
                  <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">Oups !</h3>
                <p className="text-sm text-slate-500 mb-8 leading-relaxed font-medium">{error}</p>
                <button
                  onClick={clearError}
                  className="w-full py-3.5 bg-[#32A8D7] hover:bg-[#2a95c2] text-white rounded-xl font-bold transition-all active:scale-[0.98] shadow-md shadow-blue-500/20"
                >
                  J'ai compris
                </button>
              </div>
            </div>
          )}

          {formError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-600">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 flex items-start gap-2 text-xs text-green-700 relative pr-8">
              <div className="mt-0.5">
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="font-medium">{successMessage}</span>
              <button 
                onClick={clearSuccess}
                className="absolute top-2.5 right-2 text-green-500 hover:text-green-800 transition-colors"
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
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Entrer l'e-mail"
                  className="w-full px-4 py-3 bg-[#F9FAFB] border-0 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#32A8D7] transition-all"
                  id="email-connexion"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 pr-11 bg-[#F9FAFB] border-0 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#32A8D7] transition-all"
                  id="password-connexion"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label="Afficher le mot de passe"
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <Link
                  href="/mot-de-passe-oublie"
                  className="text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
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
                className="custom-checkbox"
              />
              <label
                htmlFor="remember-me"
                className="text-xs text-slate-600 cursor-pointer font-medium select-none"
              >
                Rester connecté
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              id="btn-connexion"
              className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-[#32A8D7] hover:bg-[#2a95c2] active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 text-sm mt-3"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Connexion en cours...
                </>
              ) : (
                "Connexion"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-slate-400 text-xs font-medium">ou</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          {/* Social login buttons */}
          <div className="flex w-full">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading || googleLoading}
              id="btn-google-connexion"
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-[0.99] transition-all text-sm font-bold text-slate-700 shadow-sm disabled:opacity-50"
            >
              {googleLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                  Connexion à Google...
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
                  Connexion avec Google
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
