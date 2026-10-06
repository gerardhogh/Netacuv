"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/mise-a-jour-mot-de-passe`,
      });

      if (resetError) {
        setError(resetError.message || "Une erreur est survenue lors de l'envoi de l'e-mail.");
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
    <div className="h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#0A192F] pt-20 pb-4 px-4">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#1E3A8A] blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#32A8D7] blur-[120px]"></div>
      </div>

      {/* Navbar overlay */}
      <div className="absolute top-0 w-full z-20">
        <Navbar variant="auth" />
      </div>

      <div className="z-10 w-full max-w-md animate-fade-in-up mt-6 md:mt-12">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-6 md:p-8 max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar">
          <h1 className="text-3xl font-extrabold text-center mb-2 text-white">
            Mot de passe oublié ?
          </h1>

          {isSuccess ? (
            <div className="text-center mt-6">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
                <CheckCircle2 size={32} className="text-[#32A8D7]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">E-mail envoyé !</h3>
              <p className="text-slate-300 mb-6 text-sm">
                Un lien pour réinitialiser votre mot de passe a été envoyé à <strong className="text-white">{email}</strong>. 
                Veuillez vérifier votre boîte de réception. Si vous ne le voyez pas, pensez à consulter vos <strong className="text-white">dossiers de spams (courriers indésirables)</strong>.
              </p>
            </div>
          ) : (
            <>
              <p className="text-center text-sm mb-8 text-slate-300 px-4">
                Entrer votre adresse e-mail pour recevoir le lien de réinitialisation
              </p>

              {error && (
                <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-600">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-1.5">
                    Email professionnel ou personnel
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Entrer l'e-mail"
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#32A8D7] transition-all [&:-webkit-autofill]:shadow-[0_0_0_1000px_#0A192F_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-[#32A8D7] hover:bg-[#2a95c2] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 text-sm mt-4"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Envoi...
                    </>
                  ) : (
                    "Envoyer le lien"
                  )}
                </button>
              </form>
            </>
          )}

          <div className="mt-6 flex justify-center">
            <Link
              href="/connexion"
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} /> Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
