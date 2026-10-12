"use client";

import React, { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

interface NewsletterFormProps {
  className?: string;
  variant?: "footer" | "standalone";
}

export default function NewsletterForm({
  className = "",
  variant = "footer",
}: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setStatus("error");
      setFeedbackMessage("Veuillez renseigner une adresse e-mail valide.");
      return;
    }

    setStatus("loading");
    setFeedbackMessage("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setFeedbackMessage(data.message || "Inscription réussie à la newsletter !");
        setEmail("");
      } else {
        setStatus("error");
        setFeedbackMessage(data.error || "Une erreur est survenue lors de l'inscription.");
      }
    } catch {
      setStatus("error");
      setFeedbackMessage("Erreur de connexion avec le serveur. Veuillez réessayer.");
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <form onSubmit={handleSubmit} className="flex gap-2 relative">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status !== "idle" && status !== "loading") {
              setStatus("idle");
              setFeedbackMessage("");
            }
          }}
          disabled={status === "loading" || status === "success"}
          placeholder="Adresse e-mail"
          required
          aria-label="Adresse e-mail pour la newsletter"
          className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-70 transition-all shadow-xs"
        />

        <button
          type="submit"
          disabled={status === "loading" || status === "success"}
          className="w-11 h-11 rounded-xl flex items-center justify-center text-white bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-70 transition-all shadow-md flex-shrink-0 cursor-pointer disabled:cursor-not-allowed"
          aria-label="S'abonner"
        >
          {status === "loading" ? (
            <Loader2 size={18} className="animate-spin text-white" />
          ) : status === "success" ? (
            <CheckCircle2 size={18} className="text-white" />
          ) : (
            <ArrowRight size={18} />
          )}
        </button>
      </form>

      {/* Feedback Messages */}
      {status === "success" && (
        <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-300 font-medium animate-fade-in">
          <CheckCircle2 size={14} className="flex-shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center gap-1.5 mt-2 text-xs text-rose-300 font-medium animate-fade-in">
          <AlertCircle size={14} className="flex-shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Mention RGPD obligatoire */}
      <p className="text-[11px] text-blue-100/60 mt-2.5 leading-relaxed">
        En vous inscrivant, vous acceptez de recevoir les actualités de Netacuv. Désabonnement en 1 clic.
      </p>
    </div>
  );
}
