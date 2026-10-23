"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { AlertCircle, Sparkles, Briefcase, Gift, CheckCircle2, Loader2, X } from "lucide-react";
import Navbar from "../components/Navbar";

type UserRole = "talent" | "recruteur";

function InscriptionForm() {
  const tAuth = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();

  const defaultRole: UserRole =
    searchParams.get("type") === "recruteur" ? "recruteur" : "talent";
  const urlRef = (searchParams.get("ref") || "").trim();

  const [role, setRole] = useState<UserRole>(defaultRole);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  // Referral / Invitation code states
  const [referralCode, setReferralCode] = useState(urlRef);
  const [showReferralInput, setShowReferralInput] = useState(Boolean(urlRef));
  const [referralStatus, setReferralStatus] = useState<"idle" | "checking" | "valid" | "invalid">(
    urlRef ? "checking" : "idle"
  );
  const [referrerName, setReferrerName] = useState("");

  // Validate referral code whenever it changes (with debounce)
  useEffect(() => {
    const cleanCode = referralCode.trim();
    if (!cleanCode) {
      setReferralStatus("idle");
      setReferrerName("");
      return;
    }

    if (cleanCode.length < 3) {
      setReferralStatus("idle");
      setReferrerName("");
      return;
    }

    const timer = setTimeout(async () => {
      setReferralStatus("checking");
      try {
        const res = await fetch(`/api/affiliation/verify?code=${encodeURIComponent(cleanCode)}`);
        const data = await res.json();
        if (data.valid) {
          setReferralStatus("valid");
          setReferrerName(data.referrerName || "Membre Netacuv");
        } else {
          setReferralStatus("invalid");
          setReferrerName("");
        }
      } catch (err) {
        setReferralStatus("idle");
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [referralCode]);

  const handleGoogleSignup = async () => {
    setError("");

    if (!acceptTerms) {
      setError(tAuth("termsRequired"));
      return;
    }

    setGoogleLoading(true);
    try {
      // Create cookies to remember the intended role and the auth action for Google signup
      document.cookie = `netacuv_intended_role=${role}; path=/; max-age=3600`;
      document.cookie = `netacuv_auth_action=register; path=/; max-age=3600`;

      // Memorize referral code in cookie if provided and valid
      if (referralCode.trim()) {
        document.cookie = `netacuv_referral_code=${encodeURIComponent(referralCode.trim().toUpperCase())}; path=/; max-age=3600`;
      } else {
        document.cookie = `netacuv_referral_code=; path=/; max-age=0`;
      }

      await signIn("google", {
        callbackUrl:
          role === "recruteur"
            ? "/dashboard/recruteur"
            : "/dashboard/talent",
      });
    } catch (e) {
      console.error("Unexpected error:", e);
      setError("Une erreur inattendue s'est produite lors de l'inscription avec Google.");
      setGoogleLoading(false);
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
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {tAuth("registerTitle")}
              </h1>
            </div>

            {/* Role selector */}
            <div className="mb-6">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 text-center">
                {tAuth("registerSubtitle")}
              </label>
              <div className="flex gap-2 w-full p-1 bg-black/30 border border-white/10 rounded-xl">
                <button
                  type="button"
                  onClick={() => setRole("talent")}
                  id="tab-talent"
                  className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    role === "talent"
                      ? "bg-[#32A8D7] text-white shadow-md"
                      : "text-blue-100/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Sparkles size={14} />
                  <span>{tAuth("talent")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("recruteur")}
                  id="tab-recruteur"
                  className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    role === "recruteur"
                      ? "bg-[#32A8D7] text-white shadow-md"
                      : "text-blue-100/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Briefcase size={14} />
                  <span>{tAuth("recruiter")}</span>
                </button>
              </div>
            </div>

            {/* Referral / Invitation Code Section */}
            <div className="mb-6">
              {!showReferralInput ? (
                <button
                  type="button"
                  onClick={() => setShowReferralInput(true)}
                  className="w-full py-2.5 px-3 rounded-xl border border-dashed border-sky-400/30 hover:border-sky-400/60 bg-sky-500/5 hover:bg-sky-500/10 transition-all text-xs text-sky-300 hover:text-white flex items-center justify-center gap-2 group"
                >
                  <Gift size={14} className="text-[#32A8D7] group-hover:scale-110 transition-transform" />
                  <span>{tAuth("referralQuestion")}</span>
                </button>
              ) : (
                <div className="p-3.5 rounded-xl bg-black/40 border border-sky-400/25 relative animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="referral-input"
                      className="text-xs font-semibold text-slate-200 flex items-center gap-1.5"
                    >
                      <Gift size={14} className="text-[#32A8D7]" />
                      <span>{tAuth("referralLabel")}</span>
                    </label>
                    {!urlRef && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowReferralInput(false);
                          setReferralCode("");
                          setReferralStatus("idle");
                        }}
                        className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
                        title="Masquer"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      id="referral-input"
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      placeholder={tAuth("referralPlaceholder")}
                      className="w-full py-2 px-3 text-xs font-mono font-bold tracking-wider rounded-lg bg-black/60 border border-white/15 focus:border-[#32A8D7] text-white placeholder:text-slate-500 placeholder:font-sans placeholder:font-normal focus:outline-none transition-all uppercase"
                    />
                    {referralStatus === "checking" && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 size={14} className="animate-spin text-[#32A8D7]" />
                      </div>
                    )}
                  </div>

                  {referralStatus === "valid" && (
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg">
                      <CheckCircle2 size={13} className="flex-shrink-0 text-emerald-400" />
                      <span>
                        {tAuth("referralActivated", { name: referrerName })}
                      </span>
                    </div>
                  )}

                  {referralStatus === "invalid" && referralCode.trim().length >= 3 && (
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-300 font-medium bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-lg">
                      <AlertCircle size={13} className="flex-shrink-0 text-amber-400" />
                      <span>{tAuth("referralInvalid")}</span>
                    </div>
                  )}

                  {urlRef && referralStatus === "valid" && (
                    <p className="text-[10px] text-sky-300/80 mt-1.5 italic text-left">
                      {tAuth("referralAutoApplied")}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Error banner */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center gap-2.5 text-xs text-red-200">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Terms Checkbox */}
            <div className="flex items-start gap-2.5 mb-6">
              <input
                type="checkbox"
                id="terms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="custom-checkbox mt-0.5"
              />
              <label
                htmlFor="terms"
                className="text-xs text-slate-300 leading-relaxed cursor-pointer select-none"
              >
                {tAuth("termsAccept")}{" "}
                <Link href="/terms" className="text-sky-300 hover:underline">
                  {tAuth("termsOfUse")}
                </Link>{" "}
                {tAuth("termsAnd")}{" "}
                <Link href="/privacy" className="text-sky-300 hover:underline">
                  {tAuth("privacyPolicy")}
                </Link>
                .
              </label>
            </div>

            {/* Main Google Signup Button */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={googleLoading || !acceptTerms}
              id="btn-google-inscription"
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-white/15 bg-white/10 hover:bg-white/15 active:scale-[0.99] transition-all text-sm font-bold text-white shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/60 border-t-transparent rounded-full animate-spin"></div>
                  <span>{tAuth("connectingWithGoogle")}</span>
                </>
              ) : (
                <>
                  <Image
                    src="/assets/google 1.png"
                    alt="Google Logo"
                    width={22}
                    height={22}
                    className="object-contain"
                  />
                  <span>{tAuth("signUpWithGoogle")}</span>
                </>
              )}
            </button>

            {/* Footer switch to login */}
            <div className="mt-6 pt-4 border-t border-white/10 text-center">
              <p className="text-xs text-slate-300">
                {tAuth("alreadyHaveAccount")}{" "}
                <Link
                  href="/connexion"
                  className="font-bold text-[#32A8D7] hover:text-sky-300 underline underline-offset-2 transition-colors ml-1"
                >
                  {tAuth("signInLink")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InscriptionPage() {
  return (
    <Suspense
      fallback={
        <div 
          style={{ backgroundColor: "#061527", color: "#ffffff" }}
          className="min-h-screen flex items-center justify-center bg-[#061527]"
        >
          <div className="w-8 h-8 border-3 border-[#32A8D7] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <InscriptionForm />
    </Suspense>
  );
}
