"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, XCircle, Check, X } from "lucide-react";

export default function TalentsPage() {
  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-500 selection:text-white">
      <Navbar />

      <main
        className="pt-16 pb-24 px-6 relative overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse at center top, rgba(200,235,255,0.8) 0%, rgba(240,248,255,0.9) 100%)",
        }}
      >
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-black leading-tight mb-4 text-blue-600">
            Mets toutes les chances de ton<br className="hidden md:block" />
            côté pour décrocher un emploi
          </h1>
          <p className="text-slate-600 text-lg md:text-xl">
            Valorise ton profil, teste tes compétences et sois visible des meilleurs recruteurs.
          </p>
        </div>

        {/* Hero Image */}
        <div className="max-w-3xl mx-auto flex justify-center mb-16 relative">
          <Image
            src="/assets/Frame 1000004830.png"
            alt="Talents"
            width={700}
            height={500}
            className="w-full max-w-2xl h-auto object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/assets/Group 2611.png";
            }}
          />
        </div>

        {/* 4 Features Grid */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          {[
            {
              title: "Visibilité accrue",
              desc: "Soyez vu par des recruteurs sérieux à la recherche de votre profil.",
            },
            {
              title: "Certifiez votre profil en vidéo",
              desc: "Répondez à des questions d'entretien en vidéo pour vous démarquer.",
            },
            {
              title: "Notation intelligente",
              desc: "Une IA analyse votre profil et attribue une note de confiance.",
            },
            {
              title: "Accès à 700 FCFA/mois",
              desc: "Un petit investissement pour une grande visibilité.",
            },
          ].map((feat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="M12 5l7 7-7 7"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800 mb-1">{feat.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl md:text-3xl font-black text-center text-slate-800 mb-10">
            Devenez Talent Premium sur Netacuv
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col h-full">
              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-500 mb-2">Option Gratuite</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-[#0F172A]">0</span>
                  <span className="text-slate-500 font-semibold">FCFA / mois</span>
                </div>
                <p className="text-sm text-slate-500 mt-2">Pour découvrir la plateforme</p>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3"><Check className="text-[#2BAFE3] mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-600">Communauté WhatsApp exclusive</span></li>
                <li className="flex items-start gap-3"><Check className="text-[#2BAFE3] mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-600">Affiliation <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full ml-1 border border-green-200">Gains par parrainage</span></span></li>
                <li className="flex items-start gap-3"><Check className="text-[#2BAFE3] mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-600">Création de profil basique</span></li>
                <li className="flex items-start gap-3"><Check className="text-[#2BAFE3] mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-600">1 candidature gratuite</span></li>
                <li className="flex items-start gap-3 opacity-50"><X className="text-slate-400 mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-500 line-through decoration-slate-300">Candidatures illimitées</span></li>
                <li className="flex items-start gap-3 opacity-50"><X className="text-slate-400 mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-500 line-through decoration-slate-300">Aperçu des profils recruteurs</span></li>
                <li className="flex items-start gap-3 opacity-50"><X className="text-slate-400 mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-500 line-through decoration-slate-300">Obtention de badge</span></li>
                <li className="flex items-start gap-3 opacity-50"><X className="text-slate-400 mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-500 line-through decoration-slate-300">Ajout de CV au format PDF</span></li>
                <li className="flex items-start gap-3 opacity-50"><X className="text-slate-400 mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-500 line-through decoration-slate-300">Entretien vidéo certifié par l'IA</span></li>
                <li className="flex items-start gap-3 opacity-50"><X className="text-slate-400 mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-500 line-through decoration-slate-300">Profil prioritaire auprès des recruteurs</span></li>
              </ul>
              <Link
                href="https://talent.netacuv.com/register"
                className="w-full py-4 rounded-full font-bold text-[#0F172A] bg-slate-100 hover:bg-slate-200 transition-colors text-center"
              >
                Commencer gratuitement
              </Link>
            </div>

            {/* Premium Tier */}
            <div 
              className="rounded-[2rem] p-8 shadow-2xl relative flex flex-col h-full text-white border border-[#0076a8]/30"
              style={{ background: "linear-gradient(180deg, #0076a8 0%, #005a82 100%)" }}
            >
              <div className="absolute top-0 right-6 -translate-y-1/2 bg-[#F59E0B] text-[#0F172A] font-bold text-xs uppercase tracking-wider py-1.5 px-4 rounded-full shadow-lg">
                Recommandé
              </div>
              <div className="mb-8">
                <h3 className="text-xl font-bold text-blue-300 mb-2">Option Premium</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-white">700</span>
                  <span className="text-slate-400 font-semibold">FCFA / mois</span>
                </div>
                <p className="text-sm text-slate-400 mt-2">Accès illimité sans engagement</p>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3"><Check className="text-[#F59E0B] mt-0.5 flex-shrink-0" size={20} /> <span className="text-white font-semibold">Communauté WhatsApp exclusive</span></li>
                <li className="flex items-start gap-3"><Check className="text-[#F59E0B] mt-0.5 flex-shrink-0" size={20} /> <span className="text-white font-semibold">Affiliation <span className="text-xs font-bold text-[#0F172A] bg-[#F59E0B] px-2 py-0.5 rounded-full ml-1">Gains par parrainage</span></span></li>
                <li className="flex items-start gap-3"><Check className="text-blue-300 mt-0.5 flex-shrink-0" size={20} /> <span className="text-blue-50">Candidatures illimitées</span></li>
                <li className="flex items-start gap-3"><Check className="text-blue-300 mt-0.5 flex-shrink-0" size={20} /> <span className="text-blue-50">Aperçu des profils recruteurs</span></li>
                <li className="flex items-start gap-3"><Check className="text-blue-300 mt-0.5 flex-shrink-0" size={20} /> <span className="text-blue-50">Obtention de badge</span></li>
                <li className="flex items-start gap-3"><Check className="text-blue-300 mt-0.5 flex-shrink-0" size={20} /> <span className="text-blue-50">Ajout de CV au format PDF</span></li>
                <li className="flex items-start gap-3"><Check className="text-blue-300 mt-0.5 flex-shrink-0" size={20} /> <span className="text-blue-50">Entretien vidéo certifié par l'IA</span></li>
                <li className="flex items-start gap-3"><Check className="text-blue-300 mt-0.5 flex-shrink-0" size={20} /> <span className="text-blue-50">Profil prioritaire auprès des recruteurs</span></li>
              </ul>
              <Link
                href="https://talent.netacuv.com/register"
                className="w-full py-4 rounded-full font-bold text-white bg-[#2BAFE3] hover:bg-[#1E8CB8] transition-colors text-center shadow-lg shadow-[#2BAFE3]/20"
              >
                Passer en Premium
              </Link>
            </div>
          </div>
          
          <p className="text-center text-sm text-slate-500 mt-6">
            Paiement sécurisé via mobile money. Aucun engagement, résiliable à tout moment.
          </p>
        </div>

        {/* Bottom CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/inscription?type=talent"
            className="px-8 py-3 rounded-full font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg"
          >
            Créer mon compte maintenant
          </Link>
          <Link
            href="/connexion"
            className="px-8 py-3 rounded-full font-bold text-sm text-blue-600 bg-white border border-blue-200 hover:bg-blue-50 transition-colors"
          >
            Se connecter
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
