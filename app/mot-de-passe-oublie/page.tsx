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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/mise-a-jour-mot-de-passe`,
    });

    if (error) {
      setError(error.message);
    } else {
      setIsSuccess(true);
    }
    setIsLoading(false);
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
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-slate-100 animate-fade-in-up">
          <h1 className="text-3xl font-extrabold text-center mb-2" style={{ color: "#32A8D7" }}>
            Mot de passe oublié ?
          </h1>

          {isSuccess ? (
            <div className="text-center mt-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">E-mail envoyé !</h3>
              <p className="text-slate-500 mb-6 text-sm">
                Un lien pour réinitialiser votre mot de passe a été envoyé à <strong>{email}</strong>. 
                Veuillez vérifier votre boîte de réception. Si vous ne le voyez pas, pensez à consulter vos <strong>dossiers de spams (courriers indésirables)</strong>.
              </p>
            </div>
          ) : (
            <>
              <p className="text-center text-sm mb-8 text-slate-500 px-4">
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
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Entrer l'e-mail"
                      className="w-full pl-10 pr-4 py-3 bg-[#F9FAFB] border-0 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#32A8D7] transition-all"
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
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft size={16} /> Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
