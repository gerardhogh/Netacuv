"use client";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { 
  Plus, 
  Minus, 
  CheckCircle2, 
  Zap, 
  Video, 
  BrainCircuit, 
  ShieldCheck, 
  PlayCircle, 
  Star, 
  Check, 
  Search,
  Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function HomePage() {
  const [activeHowTab, setActiveHowTab] = useState<"talents" | "recruteurs">("talents");
  const [activePricingTab, setActivePricingTab] = useState<"talents" | "recruteurs">("talents");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [showDeletedModal, setShowDeletedModal] = useState(false);

  // Check URL for account_deleted
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("account_deleted") === "true") {
        setShowDeletedModal(true);
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("account_deleted");
        window.history.replaceState({}, "", newUrl.toString());
      }
    }
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqs = [
    {
      q: "Comment fonctionne l'entretien vidéo IA ?",
      a: "Notre intelligence artificielle vous pose des questions adaptées à votre domaine. Elle analyse ensuite vos réponses, votre élocution et votre pertinence pour certifier vos compétences. Tout se passe directement depuis votre navigateur ou mobile.",
    },
    {
      q: "Est-ce que je peux tester gratuitement ?",
      a: "Absolument ! Les talents bénéficient d'une candidature gratuite chaque mois avec l'option de base. Les recruteurs peuvent consulter les profils et publier des annonces gratuitement (les coordonnées des candidats sont floutées en version gratuite).",
    },
    {
      q: "Comment les recruteurs contactent-ils les talents ?",
      a: "Avec l'abonnement Premium, les recruteurs ont accès direct aux emails et numéros de téléphone des candidats. Ils peuvent télécharger le CV au format PDF ou les contacter via le chat intégré.",
    },
    {
      q: "Quels sont les modes de paiement acceptés ?",
      a: "Nous acceptons les paiements via Mobile Money (Orange Money, MTN, Moov) ainsi que les paiements classiques par Carte Bancaire pour une accessibilité maximale sur tout le continent.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] selection:bg-[#2BAFE3]/30 selection:text-[#0F172A] font-sans">
      <Navbar variant="default" />

      {/* ── HERO SECTION ── */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden bg-white">
        {/* Background Decorative Gradients */}
        <div className="absolute top-0 inset-x-0 h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-[#2BAFE3]/10 blur-[100px]" />
          <div className="absolute bottom-[20%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#F59E0B]/10 blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
            
            {/* Left Content */}
            <div className="flex-1 max-w-3xl animate-fade-in-up text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2BAFE3]/10 text-[#2BAFE3] font-semibold text-sm mb-6 shadow-sm border border-[#2BAFE3]/20">
                <Zap size={16} className="fill-current" />
                <span>Le Recrutement Digital Nouvelle Génération par IA</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0F172A] leading-[1.15] mb-6 tracking-tight">
                Fini les CVs ignorés.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2BAFE3] to-[#1E8CB8]">
                  Prouvez votre valeur
                </span> en vidéo.
              </h1>
              
              <p className="text-slate-600 text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl mx-auto lg:mx-0">
                Netacuv transforme vos expériences en <strong className="text-[#0F172A]">Profil Certifié IA</strong>. 
                Les candidats montrent leurs vraies compétences, et les recruteurs accèdent instantanément aux meilleurs profils.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link
                  href="https://talent.netacuv.com/register"
                  className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-white bg-[#2BAFE3] hover:bg-[#1E8CB8] shadow-lg shadow-[#2BAFE3]/30 hover:shadow-[#2BAFE3]/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Je décroche un job en vidéo 🚀
                </Link>
                <Link
                  href="https://recruteur.netacuv.com/register"
                  className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-[#0F172A] bg-white border-2 border-slate-200 hover:border-[#2BAFE3] hover:bg-[#2BAFE3]/5 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Je cherche des talents certifiés 👔
                </Link>
              </div>
            </div>

            {/* Right Mockup/Animation */}
            <div className="flex-1 w-full flex justify-center lg:justify-end relative">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative w-full max-w-[480px]"
              >
                {/* Simulated UI Mockup */}
                <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative z-10">
                  <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="bg-white px-3 py-1 rounded-md text-xs font-semibold text-slate-500 shadow-sm border border-slate-200 flex items-center gap-1">
                      <ShieldCheck size={14} className="text-[#2BAFE3]" />
                      Profil Vérifié
                    </div>
                  </div>
                  <div className="p-6 relative">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2BAFE3] to-[#F59E0B] p-[2px]">
                        <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-[#2BAFE3] font-bold text-xl">
                          AK
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold text-[#0F172A] text-lg">Amadou K.</h3>
                        <p className="text-slate-500 text-sm">Développeur Frontend</p>
                        <div className="flex items-center gap-1 mt-1 text-[#F59E0B]">
                          <Star size={14} className="fill-current" />
                          <Star size={14} className="fill-current" />
                          <Star size={14} className="fill-current" />
                          <Star size={14} className="fill-current" />
                          <Star size={14} className="fill-current" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Simulated Video Player */}
                    <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video group cursor-pointer shadow-inner">
                      <div className="absolute inset-0 bg-slate-800/80 flex items-center justify-center group-hover:bg-slate-800/60 transition-all">
                        <motion.div 
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        >
                          <PlayCircle size={64} className="text-[#2BAFE3] bg-white/10 rounded-full" />
                        </motion.div>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                         <div className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-semibold">
                            Évaluation IA : 94/100
                         </div>
                         <div className="w-8 h-8 rounded-full bg-[#2BAFE3] flex items-center justify-center shadow-lg">
                           <Zap size={16} className="text-white fill-white" />
                         </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative floating badges */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="absolute -right-6 top-1/4 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 z-20 flex flex-col items-center gap-2"
                >
                  <div className="w-10 h-10 rounded-full bg-[#F59E0B]/10 flex items-center justify-center">
                    <CheckCircle2 size={24} className="text-[#F59E0B]" />
                  </div>
                  <span className="text-xs font-bold text-slate-700">Top 5%</span>
                </motion.div>

              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BANDEAU DE PREUVE SOCIALE ── */}
      <section className="border-y border-slate-200 bg-[#F8FAFC] py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x divide-slate-200">
            <div className="px-4">
              <h4 className="text-3xl font-black text-[#2BAFE3] mb-1">+90%</h4>
              <p className="text-sm font-semibold text-slate-600">Visibilité des certifiés</p>
            </div>
            <div className="px-4">
              <h4 className="text-3xl font-black text-[#2BAFE3] mb-1">x3</h4>
              <p className="text-sm font-semibold text-slate-600">Plus rapide pour recruter</p>
            </div>
            <div className="px-4">
              <h4 className="text-3xl font-black text-[#2BAFE3] mb-1">100%</h4>
              <p className="text-sm font-semibold text-slate-600">Profils vérifiés par IA</p>
            </div>
            <div className="px-4">
              <h4 className="text-3xl font-black text-[#2BAFE3] mb-1">24/7</h4>
              <p className="text-sm font-semibold text-slate-600">Disponibilité du vivier</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ? ── */}
      <section className="py-24 bg-[#0F172A] text-white relative">
        <div className="absolute inset-0 bg-[#2BAFE3]/5" style={{ backgroundImage: 'radial-gradient(#2BAFE3 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.1 }}></div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-8 text-white">
              Comment ça marche ?
            </h2>
            
            {/* Tabs */}
            <div className="inline-flex p-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
              <button
                onClick={() => setActiveHowTab("talents")}
                className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${
                  activeHowTab === "talents"
                    ? "bg-white text-[#0F172A] shadow-md"
                    : "text-blue-100 hover:text-white"
                }`}
              >
                Côté Candidats
              </button>
              <button
                onClick={() => setActiveHowTab("recruteurs")}
                className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${
                  activeHowTab === "recruteurs"
                    ? "bg-white text-[#0F172A] shadow-md"
                    : "text-blue-100 hover:text-white"
                }`}
              >
                Côté Recruteurs
              </button>
            </div>
          </div>

          <div className="relative">
            <AnimatePresence mode="wait">
              {activeHowTab === "talents" ? (
                <motion.div 
                  key="talents"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex flex-col gap-12">
                    {/* Images Top Section */}
                    <div className="flex justify-center mb-4">
                      <Image 
                        src="/assets/ImageTalents.png" // Using a generic source, or placeholder if needed. Since we don't have the exact Figma export, I'll use a placeholder that falls back gracefully or use standard layout 
                        alt="Talents" 
                        width={600} 
                        height={400} 
                        className="object-contain" 
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    {/* Steps list */}
                    <div className="flex flex-col gap-6">
                      {[
                        { num: "01", title: "Crée ton compte en 1 minute", desc: "Accède à la plateforme avec un petit abonnement de 700 FCFA/mois.", align: "right" },
                        { num: "02", title: "Téléverse ton CV", desc: "Ou remplis directement ton profil avec tes infos clés.", align: "left" },
                        { num: "03", title: "Passe le test vidéo IA", desc: "Réponds à des questions métiers en vidéo, évalue-toi en 3 essais.", align: "right" },
                        { num: "04", title: "Obtiens ta certification", desc: "L'IA note ta prestation et t'attribue un badge et des étoiles visibles.", align: "left" },
                        { num: "05", title: "Sois visible par les recruteurs", desc: "Ton profil apparaît dans les recherches selon ton score, ton CV et ta vidéo.", align: "right" },
                        { num: "06", title: "Gagne avec l'affiliation", desc: "Partage ton code et reçois des bonus quand tes filleuls s'inscrivent.", align: "left" },
                      ].map((step, idx) => (
                        <div key={idx} className={`flex items-center gap-4 ${step.align === "left" ? "flex-row-reverse" : "flex-row"}`}>
                          <div className="w-20 flex-shrink-0 flex items-center justify-center">
                            <span className="text-7xl font-black leading-none select-none text-slate-700/50">
                              {step.num}
                            </span>
                          </div>
                          <div className="flex-1 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 px-6 py-5 flex items-start gap-4 hover:bg-white/10 transition-colors">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-extrabold text-base leading-snug mb-1.5 text-white">
                                {step.title}
                              </h3>
                              <p className="text-sm text-slate-300 leading-relaxed">
                                {step.desc}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="recruteurs"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex flex-col gap-12">
                    {/* Images Top Section */}
                    <div className="flex justify-center mb-4">
                      <Image 
                        src="/assets/ImageRecruteurs.png" 
                        alt="Recruteurs" 
                        width={600} 
                        height={400} 
                        className="object-contain" 
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="flex flex-col gap-6">
                      {[
                        { num: "01", title: "Créez un compte recruteur en quelques minutes", desc: "Inscrivez-vous rapidement sur la plateforme pour commencer à accéder aux talents.", align: "right" },
                        { num: "02", title: "Accédez à la base de talents avec profils certifiés", desc: "Explorez les profils des talents, tous certifiés avec des badges de confiance.", align: "left" },
                        { num: "03", title: "Consultez les CV, vidéos de présentation et badges", desc: "Visualisez les CV et les vidéos de présentation des talents, ainsi que leurs badges.", align: "right" },
                        { num: "04", title: "Contactez directement les talents ou publiez une offre", desc: "Entrez en contact avec les talents qui correspondent à vos critères.", align: "left" },
                        { num: "05", title: "Gagnez avec l'affiliation", desc: "Partagez votre code et recevez des bonus quand vos filleuls s'inscrivent.", align: "right" },
                      ].map((step, idx) => (
                        <div key={idx} className={`flex items-center gap-4 ${step.align === "left" ? "flex-row-reverse" : "flex-row"}`}>
                          <div className="w-20 flex-shrink-0 flex items-center justify-center">
                            <span className="text-7xl font-black leading-none select-none text-slate-700/50">
                              {step.num}
                            </span>
                          </div>
                          <div className="flex-1 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 px-6 py-5 flex items-start gap-4 hover:bg-white/10 transition-colors">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-extrabold text-base leading-snug mb-1.5 text-white">
                                {step.title}
                              </h3>
                              <p className="text-sm text-slate-300 leading-relaxed">
                                {step.desc}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ── LES FONCTIONNALITÉS CLÉS (IA) ── */}
      <section className="py-24 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-[#0F172A] mb-4">
              La puissance de l'IA à votre service
            </h2>
            <p className="text-slate-600 text-lg">
              Des algorithmes de pointe pour sécuriser vos recrutements et valoriser les compétences réelles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1 */}
            <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-lg shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row items-center gap-8 hover:-translate-y-1 hover:shadow-xl transition-all">
              <div className="w-24 h-24 flex-shrink-0 bg-blue-50 rounded-full flex items-center justify-center">
                <BrainCircuit className="text-[#2BAFE3]" size={48} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#0F172A] mb-3">Certification Vidéo IA</h3>
                <p className="text-slate-600 leading-relaxed">
                  L'IA analyse le ton, l'expression orale et la pertinence des réponses pour fournir une note globale objective.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-lg shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row items-center gap-8 hover:-translate-y-1 hover:shadow-xl transition-all">
              <div className="w-24 h-24 flex-shrink-0 bg-amber-50 rounded-full flex items-center justify-center">
                <Search className="text-[#F59E0B]" size={48} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#0F172A] mb-3">Scoring Automatique</h3>
                <p className="text-slate-600 leading-relaxed">
                  Notre système analyse votre CV et le classe automatiquement pour recommander les profils à fort potentiel aux entreprises.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-lg shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row items-center gap-8 hover:-translate-y-1 hover:shadow-xl transition-all">
              <div className="w-24 h-24 flex-shrink-0 bg-green-50 rounded-full flex items-center justify-center">
                <ShieldCheck className="text-green-500" size={48} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#0F172A] mb-3">Badges de Confiance</h3>
                <p className="text-slate-600 leading-relaxed">
                  Garantit aux recruteurs la fiabilité des compétences et limite fortement les fausses déclarations sur les CVs.
                </p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-[#2BAFE3] rounded-[2rem] p-8 md:p-10 shadow-lg shadow-[#2BAFE3]/30 text-white flex flex-col md:flex-row items-center gap-8 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#2BAFE3]/40 transition-all">
              <div className="w-24 h-24 flex-shrink-0 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                <Zap className="text-white fill-white" size={48} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Ultra-Accessible</h3>
                <p className="text-blue-50 leading-relaxed">
                  Des tarifs transparents, simples et sans engagement (700 FCFA pour les Talents, 1 000 FCFA pour les Recruteurs).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING & OFFRES ── */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-[#0F172A] mb-6">
              Transparence Totale. Sans engagement.
            </h2>
            
            {/* Toggle Pricing Tabs */}
            <div className="inline-flex p-1.5 rounded-full bg-slate-100 border border-slate-200 shadow-inner">
              <button
                onClick={() => setActivePricingTab("talents")}
                className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${
                  activePricingTab === "talents"
                    ? "bg-[#2BAFE3] text-white shadow-md"
                    : "text-slate-600 hover:text-[#0F172A]"
                }`}
              >
                Offres Talents
              </button>
              <button
                onClick={() => setActivePricingTab("recruteurs")}
                className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${
                  activePricingTab === "recruteurs"
                    ? "bg-[#2BAFE3] text-white shadow-md"
                    : "text-slate-600 hover:text-[#0F172A]"
                }`}
              >
                Offres Recruteurs
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col">
              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-500 mb-2">Option Gratuite</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-[#0F172A]">0</span>
                  <span className="text-slate-500 font-semibold">FCFA / mois</span>
                </div>
                <p className="text-sm text-slate-500 mt-2">Pour découvrir la plateforme</p>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {activePricingTab === "talents" ? (
                  <>
                    <li className="flex items-start gap-3"><Check className="text-slate-400 mt-0.5" size={20} /> <span className="text-slate-600">Création de profil CV</span></li>
                    <li className="flex items-start gap-3"><Check className="text-slate-400 mt-0.5" size={20} /> <span className="text-slate-600">Passage de l'entretien vidéo IA</span></li>
                    <li className="flex items-start gap-3"><Check className="text-[#2BAFE3] mt-0.5" size={20} /> <span className="text-[#0F172A] font-semibold">1 candidature gratuite / mois</span></li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start gap-3"><Check className="text-slate-400 mt-0.5" size={20} /> <span className="text-slate-600">Création de profil Entreprise</span></li>
                    <li className="flex items-start gap-3"><Check className="text-slate-400 mt-0.5" size={20} /> <span className="text-slate-600">Consultation des profils IA</span></li>
                    <li className="flex items-start gap-3"><Check className="text-[#2BAFE3] mt-0.5" size={20} /> <span className="text-[#0F172A] font-semibold">Coordonnées / CV masqués</span></li>
                  </>
                )}
              </ul>
              <Link
                href={activePricingTab === "talents" ? "https://talent.netacuv.com/register" : "https://recruteur.netacuv.com/register"}
                className="w-full py-4 rounded-full font-bold text-[#0F172A] bg-slate-100 hover:bg-slate-200 transition-colors text-center"
              >
                Commencer gratuitement
              </Link>
            </div>

            {/* Premium Tier */}
            <div className="bg-[#0F172A] rounded-3xl p-8 border border-slate-700 shadow-2xl relative flex flex-col transform md:-translate-y-4">
              <div className="absolute top-0 right-6 -translate-y-1/2 bg-[#F59E0B] text-[#0F172A] font-bold text-xs uppercase tracking-wider py-1.5 px-4 rounded-full shadow-lg">
                Recommandé
              </div>
              <div className="mb-8">
                <h3 className="text-xl font-bold text-blue-300 mb-2">Option Premium</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-white">
                    {activePricingTab === "talents" ? "700" : "1 000"}
                  </span>
                  <span className="text-slate-400 font-semibold">FCFA / mois</span>
                </div>
                <p className="text-sm text-slate-400 mt-2">Accès illimité sans engagement</p>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {activePricingTab === "talents" ? (
                  <>
                    <li className="flex items-start gap-3"><Check className="text-[#2BAFE3] mt-0.5" size={20} /> <span className="text-slate-200">Tout l'abonnement gratuit</span></li>
                    <li className="flex items-start gap-3"><Check className="text-[#2BAFE3] mt-0.5" size={20} /> <span className="text-white font-semibold">Candidatures illimitées</span></li>
                    <li className="flex items-start gap-3"><Check className="text-[#2BAFE3] mt-0.5" size={20} /> <span className="text-slate-200">Profil recommandé en tête de liste</span></li>
                    <li className="flex items-start gap-3"><Check className="text-[#2BAFE3] mt-0.5" size={20} /> <span className="text-slate-200">Badge Certifié prioritaire</span></li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start gap-3"><Check className="text-[#2BAFE3] mt-0.5" size={20} /> <span className="text-slate-200">Tout l'abonnement gratuit</span></li>
                    <li className="flex items-start gap-3"><Check className="text-[#2BAFE3] mt-0.5" size={20} /> <span className="text-white font-semibold">Accès direct emails & téléphones</span></li>
                    <li className="flex items-start gap-3"><Check className="text-[#2BAFE3] mt-0.5" size={20} /> <span className="text-slate-200">Téléchargement CV PDF illimité</span></li>
                    <li className="flex items-start gap-3"><Check className="text-[#2BAFE3] mt-0.5" size={20} /> <span className="text-slate-200">Publication d'offres illimitée</span></li>
                  </>
                )}
              </ul>
              <Link
                href={activePricingTab === "talents" ? "https://talent.netacuv.com/register" : "https://recruteur.netacuv.com/register"}
                className="w-full py-4 rounded-full font-bold text-white bg-[#2BAFE3] hover:bg-[#1E8CB8] transition-colors text-center shadow-lg shadow-[#2BAFE3]/20"
              >
                Passer en Premium
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ (Accordion UI with Deep Blue Background) ── */}
      <section 
        className="py-24 text-white relative"
        style={{ background: "linear-gradient(180deg, #0076a8 0%, #005a82 100%)" }}
      >
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-black text-center mb-12 text-white">
            Questions fréquentes
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm overflow-hidden transition-all shadow-sm"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-base md:text-lg text-white hover:bg-white/5 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${isOpen ? 'bg-white text-blue-700' : 'bg-white/10 text-white'}`}>
                      {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                    </span>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 text-blue-100 leading-relaxed border-t border-white/10 pt-4">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-32 bg-[#0F172A] relative overflow-hidden">
        {/* Background Image with opacity */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/assets/african_talent_banner.jpg" 
            alt="Rejoindre Netacuv" 
            fill 
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/80 to-[#0F172A]/40"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
            Prêt à transformer votre carrière ou vos recrutements ?
          </h2>
          <p className="text-slate-300 text-lg mb-12 max-w-2xl mx-auto">
            Rejoignez des milliers de talents et de recruteurs qui utilisent déjà l'IA pour révolutionner leur quotidien.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="https://talent.netacuv.com/register"
              className="px-8 py-4 rounded-full font-bold text-[#0F172A] bg-[#F59E0B] hover:bg-amber-400 shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              Je suis un Talent
            </Link>
            <Link
              href="https://recruteur.netacuv.com/register"
              className="px-8 py-4 rounded-full font-bold text-white bg-[#2BAFE3] hover:bg-[#1E8CB8] shadow-xl shadow-[#2BAFE3]/20 hover:-translate-y-1 transition-all duration-300"
            >
              Je suis un Recruteur
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      {/* ── MODAL SUPPRESSION COMPTE (Preserved from old code) ── */}
      {showDeletedModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 text-center shadow-2xl relative overflow-hidden">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
              <span className="text-4xl">👋</span>
            </div>
            
            <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">
              C'est un au revoir !
            </h3>
            
            <p className="text-slate-500 text-sm leading-relaxed mb-8 px-2 font-medium">
              Votre compte a bien été supprimé définitivement. Nous sommes désolés de vous voir partir, mais la porte de Netacuv vous sera toujours grande ouverte. N'hésitez pas à créer un nouveau compte si vous changez d'avis !
            </p>
            
            <div className="flex flex-col gap-3">
              <Link
                href="https://talent.netacuv.com/register"
                onClick={() => setShowDeletedModal(false)}
                className="w-full py-3.5 bg-[#2BAFE3] hover:bg-[#1E8CB8] text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98]"
              >
                Créer un nouveau compte
              </Link>
              <button
                onClick={() => setShowDeletedModal(false)}
                className="w-full py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl transition-all active:scale-[0.98]"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
