"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Lock, Mail, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: email.trim(),
        password,
      });

      if (res?.error) {
        setError(`Erreur: ${res.error}`);
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      setError("Une erreur est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#002B49] px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#32A8D7] blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#32A8D7] blur-[120px]"></div>
      </div>

      <div className="z-10 w-full max-w-md animate-fade-in-up">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative h-14 w-48">
            <Image
              src="/Logo/PNG/Asset 20.png"
              alt="Netacuv Admin"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Administration</h1>
            <p className="text-sm text-blue-100/80">Connectez-vous pour accéder au panel de gestion.</p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/20 border border-red-500/50 flex items-center gap-3 text-sm text-red-100">
              <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-blue-100 mb-1.5">
                Adresse e-mail
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-300" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@netacuv.com"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-[#32A8D7] focus:border-transparent transition-all"
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
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-[#32A8D7] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full py-3.5 px-6 mt-2 rounded-xl font-bold text-white bg-[#32A8D7] hover:bg-[#2891bb] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>
        </div>
        
        <p className="text-center text-xs text-blue-200/60 mt-8">
          &copy; {new Date().getFullYear()} Netacuv. Accès restreint.
        </p>
      </div>
    </div>
  );
}
