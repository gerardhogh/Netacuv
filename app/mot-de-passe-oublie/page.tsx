"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import Navbar from "../components/Navbar";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Une erreur est survenue lors de l'envoi de l'e-mail.");
      } else {
        setIsSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || "Erreur de connexion.");
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
              Mot de passe oublié ?
            </h1>

            {isSuccess ? (
              <div className="text-center mt-5">
                <div className="w-16 h-16 bg-[#32A8D7]/15 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#32A8D7]/30 shadow-[0_0_20px_rgba(50,168,215,0.25)]">
                  <CheckCircle2 size={32} className="text-[#32A8D7]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">E-mail envoyé !</h3>
                <p className="text-slate-300 mb-6 text-sm leading-relaxed">
                  Un lien pour réinitialiser votre mot de passe a été envoyé à{" "}
                  <strong className="text-white">{email}</strong>. Veuillez vérifier votre boîte de réception ou vos dossiers de courriers indésirables.
                </p>
                <Link
                  href="/connexion"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl font-bold text-white bg-[#32A8D7] hover:bg-[#2891bb] transition-all shadow-md text-sm"
                >
                  <ArrowLeft size={16} /> Retour à la connexion
                </Link>
              </div>
            ) : (
              <>
                <p className="text-center text-sm mb-6 text-slate-300 leading-relaxed">
                  Entrez votre adresse e-mail pour recevoir les instructions de réinitialisation.
                </p>

                {error && (
                  <div className="mb-5 p-3 rounded-xl bg-red-500/15 border border-red-500/40 flex items-center gap-2.5 text-xs text-red-200">
                    <AlertCircle size={16} className="flex-shrink-0 text-red-400" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Adresse e-mail
                    </label>
                    <div className="relative">
                      <Mail
                        size={17}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nom@exemple.com"
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#32A8D7] focus:ring-1 focus:ring-[#32A8D7] transition-all [&:-webkit-autofill]:shadow-[0_0_0_1000px_#091b32_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !email}
                    className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-[#32A8D7] hover:bg-[#2891bb] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] transition-all shadow-lg flex items-center justify-center gap-2 text-sm mt-3"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Envoi en cours...
                      </>
                    ) : (
                      "Envoyer le lien"
                    )}
                  </button>
                </form>

                <div className="mt-6 flex justify-center pt-2 border-t border-white/10">
                  <Link
                    href="/connexion"
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                  >
                    <ArrowLeft size={14} /> Retour à la connexion
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
