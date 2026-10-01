"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Phone,
  Building2,
  Upload,
  AlertCircle,
  FileCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import GoogleAuthModal from "../components/GoogleAuthModal";
import Navbar from "../components/Navbar";

type UserRole = "talent" | "recruteur" | "admin";

function InscriptionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const defaultRole: UserRole =
    searchParams.get("type") === "recruteur" ? "recruteur" : "talent";

  const [role, setRole] = useState<UserRole>(defaultRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError(
        role === "recruteur"
          ? "Veuillez renseigner le nom de votre entreprise."
          : "Veuillez renseigner votre nom complet."
      );
      return;
    }
    if (!email.trim()) {
      setError("Veuillez renseigner votre adresse e-mail.");
      return;
    }
    if (!hasMinLength || !hasUppercase || !hasNumber || !hasSpecial) {
      setError("Le mot de passe ne respecte pas les critères requis.");
      return;
    }
    if (!acceptTerms) {
      setError("Veuillez accepter les conditions d'utilisation.");
      return;
    }

    setIsLoading(true);
    try {
      const roleName = role === "recruteur" ? "RECRUTEUR" : "TALENT";
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          roleName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          // Flatten the zod errors
          const errorMsg = Object.values(data.errors).flat().join(", ");
          setError(errorMsg || data.message);
        } else {
          setError(data.message || "Erreur lors de la création de compte.");
        }
        setIsLoading(false);
        return;
      }

      // Automatically sign in after register
      await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (role === "recruteur") {
        router.push("/dashboard/recruteur");
      } else {
        router.push("/dashboard/talent");
      }
    } catch (err) {
      setError("Erreur lors de la création de compte. Veuillez réessayer.");
      setIsLoading(false);
    }
  };

  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      // Create cookies to remember the intended role and the auth action for Google signup
      document.cookie = `netacuv_intended_role=${role}; path=/; max-age=3600`;
      document.cookie = `netacuv_auth_action=register; path=/; max-age=3600`;
      
      await signIn("google", {
        callbackUrl:
          role === "admin"
            ? "/dashboard/admin"
            : role === "recruteur"
            ? "/dashboard/recruteur"
            : "/dashboard/talent",
      });
    } catch (e) {
      console.error("Unexpected error:", e);
      setError("Une erreur inattendue s'est produite lors de la connexion Google.");
      setGoogleLoading(false);
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
      {/* Main card */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-slate-100 animate-fade-in-up">
          <h1 className="text-3xl font-extrabold text-center mb-2" style={{ color: "#32A8D7" }}>
            Créer un compte
          </h1>
          <p className="text-center text-sm mb-6 text-slate-500">
            Rejoignez la plateforme Netacuv dès aujourd'hui
          </p>

          {/* Role selector */}
          <div className="flex gap-3 mb-8 w-full">
            <button
              type="button"
              onClick={() => setRole("talent")}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg capitalize transition-all border ${
                role === "talent"
                  ? "bg-[#32A8D7] text-white border-transparent shadow-md"
                  : "bg-transparent text-[#32A8D7] border-[#32A8D7] hover:bg-blue-50"
              }`}
              id="tab-talent"
            >
              Je suis un Talent
            </button>
            <button
              type="button"
              onClick={() => setRole("recruteur")}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg capitalize transition-all border ${
                role === "recruteur"
                  ? "bg-[#32A8D7] text-white border-transparent shadow-md"
                  : "bg-transparent text-[#32A8D7] border-[#32A8D7] hover:bg-blue-50"
              }`}
              id="tab-recruteur"
            >
              Je suis un Recruteur
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-600">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nom complet ou Entreprise */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                {role === "recruteur" ? "Nom de l'entreprise" : "Nom complet"}
              </label>
              <div className="relative">
                {role === "recruteur" ? (
                  <Building2
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                ) : (
                  <User
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                )}
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={
                    role === "recruteur" ? "Ex: Grand-G Corp" : "Ex: Candidat"
                  }
                  className="w-full pl-10 pr-4 py-3 bg-[#F9FAFB] border-0 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#32A8D7] transition-all"
                  id="nom-complet"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email professionnel ou personnel
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Entrer l'e-mail"
                  className="w-full pl-10 pr-4 py-3 bg-[#F9FAFB] border-0 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#32A8D7] transition-all"
                  id="email-inscription"
                />
              </div>
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Téléphone (WhatsApp de préférence)
              </label>
              <div className="relative">
                <Phone
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+229 XX XX XX XX"
                  className="w-full pl-10 pr-4 py-3 bg-[#F9FAFB] border-0 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#32A8D7] transition-all"
                  id="telephone"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Mot de passe
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
                  id="password-inscription"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="mt-3 space-y-2">
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

            {/* CV upload for Talents */}
            {role === "talent" && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Votre CV <span className="text-slate-400 font-normal">(optionnel)</span>
                </label>
                <label
                  htmlFor="cv-upload-input"
                  className="flex items-center gap-3 p-3.5 rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#32A8D7] hover:bg-blue-50/30 cursor-pointer transition-all"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-[#32A8D7] flex-shrink-0">
                    {cvFile ? <FileCheck size={18} /> : <Upload size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-700 truncate">
                      {cvFile ? cvFile.name : "Glissez votre CV ici (.PDF, .DOC)"}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Taille maximale : 10 Mo
                    </p>
                  </div>
                </label>
                <input
                  type="file"
                  id="cv-upload-input"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setCvFile(e.target.files[0]);
                    }
                  }}
                />
              </div>
            )}

            {/* Referral code */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Code de parrainage{" "}
                <span className="text-slate-400 font-normal">(optionnel)</span>
              </label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="Ex: CC-XXXX"
                className="w-full px-4 py-2.5 bg-[#F9FAFB] border-0 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#32A8D7] transition-all"
                id="code-parrainage"
              />
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start gap-2.5 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="custom-checkbox mt-0.5"
              />
              <label
                htmlFor="terms"
                className="text-xs text-slate-500 leading-relaxed cursor-pointer select-none"
              >
                J'accepte les{" "}
                <Link
                  href="/conditions"
                  className="font-medium hover:underline"
                  style={{ color: "#32A8D7" }}
                >
                  conditions d'utilisation
                </Link>{" "}
                et la{" "}
                <Link
                  href="/confidentialite"
                  className="font-medium hover:underline"
                  style={{ color: "#32A8D7" }}
                >
                  politique de confidentialité
                </Link>
                .
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              id="btn-creer-compte"
              className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-[#32A8D7] hover:bg-[#2a95c2] active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 text-sm mt-3"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Création en cours...
                </>
              ) : (
                "Créer mon compte"
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
              id="btn-google-inscription"
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
                  S'inscrire avec Google
                </>
              )}
            </button>
          </div>

          <p className="text-center text-xs text-slate-500 mt-6">
            Déjà inscrit ?{" "}
            <Link
              href="/connexion"
              className="font-bold hover:underline"
              style={{ color: "#32A8D7" }}
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function InscriptionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <InscriptionForm />
    </Suspense>
  );
}
