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
  Check, 
  Search,
  LogIn,
  Upload,
  Ticket,
  Award,
  Users,
  Gift,
  Share2,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Caveat } from "next/font/google";
import { useTranslations } from "next-intl";

const scriptFont = Caveat({
  subsets: ["latin"],
  weight: ["500"],
  display: "swap",
});

export default function HomePage() {
  const t = useTranslations("landing");
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

  const rawFaqs = t.raw("faq.items");
  const faqs: { q: string; a: string }[] = Array.isArray(rawFaqs) ? rawFaqs : [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] selection:bg-[#2BAFE3]/30 selection:text-[#0F172A] font-sans">
      <Navbar variant="default" />

      {/* ── HERO SECTION ── */}
      <section
        id="accueil"
        className="relative min-h-[calc(100vh-80px)] flex flex-col justify-center pt-8 pb-16 md:py-20 overflow-hidden bg-[#f4f9ff]"
      >
        {/* Background Decorative Gradients */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Tache rose à gauche */}
          <div className="absolute top-[15%] -left-[15%] w-[40%] h-[60%] rounded-full bg-[#f9d8e6] opacity-80 blur-[120px]" />
          {/* Tache rose en haut à droite */}
          <div className="absolute -top-[10%] -right-[10%] w-[45%] h-[50%] rounded-full bg-[#f9d8e6] opacity-80 blur-[120px]" />
          {/* Tache bleue au centre / bas */}
          <div className="absolute bottom-[-10%] left-[10%] w-[80%] h-[70%] rounded-full bg-[#d0eefd] opacity-90 blur-[140px]" />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-6 xl:gap-8">
            {/* Left Content */}
            <div className="w-full lg:w-auto lg:max-w-[500px] xl:max-w-[540px] animate-fade-in-up shrink-0">
              <h1 className="leading-[1.08] tracking-tight mb-4 sm:mb-6">
                <span className={`${scriptFont.className} block text-5xl sm:text-6xl lg:text-[62px] xl:text-[68px] font-medium text-slate-800 leading-tight mb-1`}>
                  {t("heroScript")}
                </span>
                <span className="block text-4xl sm:text-5xl lg:text-[48px] xl:text-[54px] font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-[#1e8ae9] to-[#32A8D7] tracking-tight leading-[1.08]">
                  {t("heroTitle1")}
                </span>
                <span className="block text-4xl sm:text-5xl lg:text-[48px] xl:text-[54px] font-black text-[#F59E0B] tracking-tight leading-[1.08]">
                  {t("heroTitle2")}
                </span>
              </h1>
              <p className="text-slate-600 text-base sm:text-lg lg:text-xl leading-relaxed mb-4 sm:mb-6 lg:mb-8 max-w-[460px] font-normal">
                {t("heroDesc")}
              </p>
              {/* Desktop CTA Buttons (visibles uniquement sur grand écran) */}
              <div className="hidden lg:flex items-center gap-4 flex-wrap">
                <Link
                  href="/talents"
                  className="px-8 py-4 rounded-full font-bold text-base text-white bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/25 shadow-xl shadow-blue-500/25 active:scale-95 transition-all duration-300 ease-in-out inline-flex items-center gap-2"
                >
                  {t("ctaTalent")}
                </Link>
                <Link
                  href="/recruteurs"
                  className="px-8 py-4 rounded-full font-bold text-base text-blue-600 bg-white/80 hover:bg-white border border-blue-200 shadow-sm hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 ease-in-out"
                >
                  {t("ctaRecruiter")}
                </Link>
              </div>
            </div>

            {/* Arrow — nicely placed in between, harmoniously close to text and card */}
            <div className="hidden lg:flex flex-col items-center justify-center shrink-0 px-1 select-none pointer-events-none">
              <Image
                src="/assets/Arrow.png"
                alt="Flèche indicative"
                width={110}
                height={78}
                className="object-contain opacity-85"
              />
            </div>

            {/* Right Card Mockup (rapprochée) & Mobile CTA Buttons */}
            <div className="w-full lg:w-auto flex flex-col items-center justify-center shrink-0">
              <div className="relative w-full max-w-[380px] sm:max-w-[410px] xl:max-w-[430px] animate-fade-in mb-4 sm:mb-5 lg:mb-0">
                {/* Floating graphic from Figma */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl transition-transform hover:scale-[1.01]">
                  <Image
                    src="/assets/image 1.png"
                    alt="Dépose ton CV - Netacuv"
                    width={460}
                    height={590}
                    priority
                    className="w-full h-auto object-contain rounded-3xl bg-white/60 backdrop-blur-md"
                  />
                </div>
              </div>

              {/* Boutons CTA sur Mobile : ramenés après l'image de dépôt de dossier */}
              <div className="flex lg:hidden items-center gap-3 w-full max-w-md mt-2">
                <Link
                  href="/talents"
                  className="flex-1 flex justify-center items-center text-center text-xs sm:text-sm font-semibold h-[42px] px-2 sm:px-4 !rounded-full btn-primary shadow-sm transition-all whitespace-nowrap"
                >
                  {t("ctaTalent")}
                </Link>
                <Link
                  href="/recruteurs"
                  className="flex-1 flex justify-center items-center text-center text-xs sm:text-sm font-semibold h-[42px] px-2 sm:px-4 !rounded-full btn-outline bg-white/90 shadow-xs transition-all whitespace-nowrap"
                >
                  {t("ctaRecruiter")}
                </Link>
              </div>
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
              <p className="text-sm font-semibold text-slate-600">{t("stats.certifiedVisibility")}</p>
            </div>
            <div className="px-4">
              <h4 className="text-3xl font-black text-[#2BAFE3] mb-1">x3</h4>
              <p className="text-sm font-semibold text-slate-600">{t("stats.fasterHiring")}</p>
            </div>
            <div className="px-4">
              <h4 className="text-3xl font-black text-[#2BAFE3] mb-1">100%</h4>
              <p className="text-sm font-semibold text-slate-600">{t("stats.aiVerified")}</p>
            </div>
            <div className="px-4">
              <h4 className="text-3xl font-black text-[#2BAFE3] mb-1">24/7</h4>
              <p className="text-sm font-semibold text-slate-600">{t("stats.poolAvailability")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ? ── */}
      <section id="comment" className="py-24 relative overflow-hidden bg-[#f4f9ff]">
        {/* Background Decorative Gradients (Same as Hero) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[15%] -left-[15%] w-[40%] h-[60%] rounded-full bg-[#f9d8e6] opacity-80 blur-[120px]" />
          <div className="absolute -top-[10%] -right-[10%] w-[45%] h-[50%] rounded-full bg-[#f9d8e6] opacity-80 blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[10%] w-[80%] h-[70%] rounded-full bg-[#d0eefd] opacity-90 blur-[140px]" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-8 text-[#0F172A]">
              {t("how.title")}
            </h2>
            
            {/* Tabs */}
            <div className="inline-flex p-1.5 rounded-full bg-white/80 backdrop-blur-md border border-slate-200 shadow-sm">
              <button
                onClick={() => setActiveHowTab("talents")}
                className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
                  activeHowTab === "talents"
                    ? "bg-[#2BAFE3] text-white shadow-lg shadow-[#2BAFE3]/30"
                    : "text-slate-500 hover:text-[#2BAFE3] bg-transparent"
                }`}
              >
                {t("how.tabTalents")}
              </button>
              <button
                onClick={() => setActiveHowTab("recruteurs")}
                className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
                  activeHowTab === "recruteurs"
                    ? "bg-[#F59E0B] text-white shadow-lg shadow-[#F59E0B]/30"
                    : "text-slate-500 hover:text-[#F59E0B] bg-transparent"
                }`}
              >
                {t("how.tabRecruiters")}
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
                  <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                    {/* Image Left Section */}
                    <div className="flex-1 w-full flex justify-center lg:justify-end">
                      <Image 
                        src="/Figma capture/Frame 1000004830.png" 
                        alt="Talents" 
                        width={600} 
                        height={800} 
                        className="object-contain max-h-[800px] w-auto" 
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    {/* Steps list */}
                    <div className="flex-1 w-full flex flex-col gap-6">
                      {[
                        { icon: LogIn, iconColor: "text-blue-600", iconBg: "bg-blue-100" },
                        { icon: Upload, iconColor: "text-amber-500", iconBg: "bg-amber-100" },
                        { icon: Ticket, iconColor: "text-fuchsia-500", iconBg: "bg-fuchsia-100" },
                        { icon: Award, iconColor: "text-amber-500", iconBg: "bg-amber-100" },
                        { icon: Ticket, iconColor: "text-fuchsia-500", iconBg: "bg-fuchsia-100" },
                      ].map((stepConfig, idx) => {
                        const stepData = t.raw(`how.candidateSteps.${idx}`);
                        return (
                          <div key={idx} className={`flex items-center gap-4 ${idx % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                            <div className="w-20 flex-shrink-0 flex items-center justify-center">
                              <span className="text-6xl lg:text-7xl font-black leading-none select-none text-[#CBD5E1]">
                                {stepData.num}
                              </span>
                            </div>
                            <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] px-4 lg:px-6 py-4 flex items-center gap-4 transition-all">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${stepConfig.iconBg}`}>
                                <stepConfig.icon className={`w-5 h-5 ${stepConfig.iconColor}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-base leading-snug mb-0.5 text-[#0F172A]">
                                  {stepData.title}
                                </h3>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                  {stepData.desc}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
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
                  <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                    {/* Image Left Section */}
                    <div className="flex-1 w-full flex justify-center lg:justify-end">
                      <Image 
                        src="/Figma capture/Frame 1000004830-1.png" 
                        alt="Recruteurs" 
                        width={600} 
                        height={800} 
                        className="object-contain max-h-[800px] w-auto" 
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="flex-1 w-full flex flex-col gap-6">
                      {[
                        { icon: LogIn, iconColor: "text-blue-600", iconBg: "bg-blue-100" },
                        { icon: Users, iconColor: "text-amber-500", iconBg: "bg-amber-100" },
                        { icon: Ticket, iconColor: "text-fuchsia-500", iconBg: "bg-fuchsia-100" },
                        { icon: Share2, iconColor: "text-amber-500", iconBg: "bg-amber-100" },
                      ].map((stepConfig, idx) => {
                        const stepData = t.raw(`how.recruiterSteps.${idx}`);
                        return (
                          <div key={idx} className={`flex items-center gap-4 ${idx % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                            <div className="w-20 flex-shrink-0 flex items-center justify-center">
                              <span className="text-6xl lg:text-7xl font-black leading-none select-none text-[#CBD5E1]">
                                {stepData.num}
                              </span>
                            </div>
                            <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] px-4 lg:px-6 py-4 flex items-center gap-4 transition-all">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${stepConfig.iconBg}`}>
                                <stepConfig.icon className={`w-5 h-5 ${stepConfig.iconColor}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-base leading-snug mb-0.5 text-[#0F172A]">
                                  {stepData.title}
                                </h3>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                  {stepData.desc}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
      {/* ── CE QUE LES RECRUTEURS RECHERCHENT (POSTURE) ── */}
      <section
        className="py-24 relative overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #0076a8 0%, #005a82 100%)",
        }}
      >
        {/* Decorative orange elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F59E0B] rounded-full mix-blend-multiply filter blur-[120px] opacity-40"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#F59E0B] rounded-full mix-blend-multiply filter blur-[120px] opacity-40"></div>
        
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 text-white">
              <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight">
                <span className="whitespace-nowrap">{t("posture.title1")}</span> <br className="hidden md:block" />
                <span className="text-[#F59E0B]">{t("posture.title2")}</span>
              </h2>
              <p className="text-blue-100 text-lg leading-relaxed mb-10">
                {t("posture.desc")}
              </p>
              
              <ul className="space-y-8">
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 flex-shrink-0 rounded-full border-2 border-[#F59E0B] flex items-center justify-center mt-0.5">
                    <Check className="text-[#F59E0B]" size={16} strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2 text-white">{t("posture.point1Title")}</h4>
                    <p className="text-blue-100/80 leading-relaxed">{t("posture.point1Desc")}</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 flex-shrink-0 rounded-full border-2 border-[#F59E0B] flex items-center justify-center mt-0.5">
                    <Check className="text-[#F59E0B]" size={16} strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2 text-white">{t("posture.point2Title")}</h4>
                    <p className="text-blue-100/80 leading-relaxed">{t("posture.point2Desc")}</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 flex-shrink-0 rounded-full border-2 border-[#F59E0B] flex items-center justify-center mt-0.5">
                    <Check className="text-[#F59E0B]" size={16} strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2 text-white">{t("posture.point3Title")}</h4>
                    <p className="text-blue-100/80 leading-relaxed">{t("posture.point3Desc")}</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="flex-1 w-full relative">
              <div className="relative rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-4 border-white/10 group">
                <div className="absolute inset-0 bg-gradient-to-t from-[#005a82]/80 via-transparent to-transparent opacity-80 z-10 transition-opacity duration-500 group-hover:opacity-60"></div>
                
                {/* Simulated Video Frame elements */}
                <div className="absolute top-6 right-6 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="text-white text-xs font-bold tracking-wider">REC</span>
                </div>
                
                <Image
                  src="/Images/african_video_interview.jpg" 
                  alt="Talent en entretien vidéo"
                  width={600}
                  height={800}
                  className="w-full h-auto object-cover aspect-[4/5] filter contrast-[1.1] transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/assets/image 1.png";
                  }}
                />
                
                <div className="absolute bottom-8 left-8 right-8 z-20 bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-xl transform transition-transform duration-500 group-hover:translate-y-[-5px]">
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-white font-bold">{t("posture.aiExpressionAnalysis")}</span>
                      <span className="text-[#F59E0B] font-black text-lg">95%</span>
                    </div>
                    <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-[#F59E0B] w-[95%] rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                    </div>
                    <div className="flex justify-between text-xs text-blue-100/70 mt-2 font-medium">
                      <span>{t("posture.postureStatus")}</span>
                      <span>{t("posture.toneStatus")}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ── LES FONCTIONNALITÉS CLÉS (IA) ── */}
      <section id="pourquoi" className="py-24 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1 */}
            <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-lg shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row items-center gap-8 hover:-translate-y-1 hover:shadow-xl transition-all">
              <div className="w-24 h-24 flex-shrink-0 bg-blue-50 rounded-full flex items-center justify-center">
                <BrainCircuit className="text-[#2BAFE3]" size={48} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#0F172A] mb-3">{t("features.card1Title")}</h3>
                <p className="text-slate-600 leading-relaxed">
                  {t("features.card1Desc")}
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-lg shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row items-center gap-8 hover:-translate-y-1 hover:shadow-xl transition-all">
              <div className="w-24 h-24 flex-shrink-0 bg-amber-50 rounded-full flex items-center justify-center">
                <Search className="text-[#F59E0B]" size={48} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#0F172A] mb-3">{t("features.card2Title")}</h3>
                <p className="text-slate-600 leading-relaxed">
                  {t("features.card2Desc")}
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-lg shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row items-center gap-8 hover:-translate-y-1 hover:shadow-xl transition-all">
              <div className="w-24 h-24 flex-shrink-0 bg-green-50 rounded-full flex items-center justify-center">
                <ShieldCheck className="text-green-500" size={48} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#0F172A] mb-3">{t("features.card3Title")}</h3>
                <p className="text-slate-600 leading-relaxed">
                  {t("features.card3Desc")}
                </p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-[#2BAFE3] rounded-[2rem] p-8 md:p-10 shadow-lg shadow-[#2BAFE3]/30 text-white flex flex-col md:flex-row items-center gap-8 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#2BAFE3]/40 transition-all">
              <div className="w-24 h-24 flex-shrink-0 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                <Zap className="text-white fill-white" size={48} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">{t("features.card4Title")}</h3>
                <p className="text-blue-50 leading-relaxed">
                  {t("features.card4Desc")}
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
              {t("pricing.title")}
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
                {t("pricing.tabTalents")}
              </button>
              <button
                onClick={() => setActivePricingTab("recruteurs")}
                className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${
                  activePricingTab === "recruteurs"
                    ? "bg-[#2BAFE3] text-white shadow-md"
                    : "text-slate-600 hover:text-[#0F172A]"
                }`}
              >
                {t("pricing.tabRecruiters")}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col h-full">
              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-500 mb-2">{t("pricing.freeOption")}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-[#0F172A]">0</span>
                  <span className="text-slate-500 font-semibold">{t("pricing.perMonth")}</span>
                </div>
                <p className="text-sm text-slate-500 mt-2">{activePricingTab === "talents" ? t("pricing.freeTalentsDesc") : t("pricing.freeRecruitersDesc")}</p>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {activePricingTab === "talents" ? (
                  <>
                    <li className="flex items-start gap-3"><Check className="text-[#2BAFE3] mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-600">{t("pricing.features.whatsapp")}</span></li>
                    <li className="flex items-start gap-3"><Check className="text-[#2BAFE3] mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-600">{t("pricing.features.talentBasicProfile")}</span></li>
                    <li className="flex items-start gap-3"><Check className="text-[#2BAFE3] mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-600">{t("pricing.features.talent1FreeApp")}</span></li>
                    <li className="flex items-start gap-3 opacity-50"><X className="text-slate-400 mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-500 line-through decoration-slate-300">{t("pricing.features.talentUnlimitedApps")}</span></li>
                    <li className="flex items-start gap-3 opacity-50"><X className="text-slate-400 mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-500 line-through decoration-slate-300">{t("pricing.features.talentRecruiterPreview")}</span></li>
                    <li className="flex items-start gap-3 opacity-50"><X className="text-slate-400 mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-500 line-through decoration-slate-300">{t("pricing.features.talentBadge")}</span></li>
                    <li className="flex items-start gap-3 opacity-50"><X className="text-slate-400 mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-500 line-through decoration-slate-300">{t("pricing.features.talentPdfCv")}</span></li>
                    <li className="flex items-start gap-3 opacity-50"><X className="text-slate-400 mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-500 line-through decoration-slate-300">{t("pricing.features.talentAiVideo")}</span></li>
                    <li className="flex items-start gap-3 opacity-50"><X className="text-slate-400 mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-500 line-through decoration-slate-300">{t("pricing.features.talentPriority")}</span></li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start gap-3"><Check className="text-[#2BAFE3] mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-600">{t("pricing.features.recruiterCompanyProfile")}</span></li>
                    <li className="flex items-start gap-3"><Check className="text-[#2BAFE3] mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-600">{t("pricing.features.recruiter1FreeJob")}</span></li>
                    <li className="flex items-start gap-3 opacity-50"><X className="text-slate-400 mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-500 line-through decoration-slate-300">{t("pricing.features.recruiterUnlimitedJobs")}</span></li>
                    <li className="flex items-start gap-3 opacity-50"><X className="text-slate-400 mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-500 line-through decoration-slate-300">{t("pricing.features.recruiterFullContacts")}</span></li>
                    <li className="flex items-start gap-3 opacity-50"><X className="text-slate-400 mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-500 line-through decoration-slate-300">{t("pricing.features.recruiterUnlimitedCv")}</span></li>
                    <li className="flex items-start gap-3 opacity-50"><X className="text-slate-400 mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-500 line-through decoration-slate-300">{t("pricing.features.recruiterFullVideos")}</span></li>
                    <li className="flex items-start gap-3 opacity-50"><X className="text-slate-400 mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-500 line-through decoration-slate-300">{t("pricing.features.recruiterPriority")}</span></li>
                    <li className="flex items-start gap-3 opacity-50"><X className="text-slate-400 mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-500 line-through decoration-slate-300">{t("pricing.features.recruiterAdvancedFilters")}</span></li>
                  </>
                )}
              </ul>
              <Link
                href={activePricingTab === "talents" ? "/inscription?type=talent" : "/inscription?type=recruteur"}
                className="w-full py-4 rounded-full font-bold text-[#0F172A] bg-slate-100 hover:bg-slate-200 transition-colors text-center"
              >
                {t("pricing.startFree")}
              </Link>
            </div>

            {/* Premium Tier */}
            <div 
              className="rounded-[2rem] p-8 shadow-2xl relative flex flex-col h-full text-white border border-[#0076a8]/30"
              style={{ background: "linear-gradient(180deg, #0076a8 0%, #005a82 100%)" }}
            >
              <div className="absolute top-0 right-6 -translate-y-1/2 bg-[#F59E0B] text-[#0F172A] font-bold text-xs uppercase tracking-wider py-1.5 px-4 rounded-full shadow-lg">
                {t("pricing.recommended")}
              </div>
              <div className="mb-8">
                <h3 className="text-xl font-bold text-blue-300 mb-2">{t("pricing.premiumOption")}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-white">
                    {activePricingTab === "talents" ? "700" : "1 000"}
                  </span>
                  <span className="text-slate-400 font-semibold">{t("pricing.perMonth")}</span>
                </div>
                <p className="text-sm text-slate-400 mt-2">{t("pricing.unlimitedAccess")}</p>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {activePricingTab === "talents" ? (
                  <>
                    <li className="flex items-start gap-3"><Check className="text-[#F59E0B] mt-0.5 flex-shrink-0" size={20} /> <span className="text-white font-semibold">{t("pricing.features.whatsapp")}</span></li>
                    <li className="flex items-start gap-3"><Check className="text-blue-300 mt-0.5 flex-shrink-0" size={20} /> <span className="text-blue-50">{t("pricing.features.talentUnlimitedApps")}</span></li>
                    <li className="flex items-start gap-3"><Check className="text-blue-300 mt-0.5 flex-shrink-0" size={20} /> <span className="text-blue-50">{t("pricing.features.talentRecruiterPreview")}</span></li>
                    <li className="flex items-start gap-3"><Check className="text-blue-300 mt-0.5 flex-shrink-0" size={20} /> <span className="text-blue-50">{t("pricing.features.talentBadge")}</span></li>
                    <li className="flex items-start gap-3"><Check className="text-blue-300 mt-0.5 flex-shrink-0" size={20} /> <span className="text-blue-50">{t("pricing.features.talentPdfCv")}</span></li>
                    <li className="flex items-start gap-3"><Check className="text-blue-300 mt-0.5 flex-shrink-0" size={20} /> <span className="text-blue-50">{t("pricing.features.talentAiVideo")}</span></li>
                    <li className="flex items-start gap-3"><Check className="text-blue-300 mt-0.5 flex-shrink-0" size={20} /> <span className="text-blue-50">{t("pricing.features.talentPriority")}</span></li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start gap-3"><Check className="text-[#F59E0B] mt-0.5 flex-shrink-0" size={20} /> <span className="text-white font-semibold">{t("pricing.features.recruiterCompanyProfile")}</span></li>
                    <li className="flex items-start gap-3"><Check className="text-blue-300 mt-0.5 flex-shrink-0" size={20} /> <span className="text-blue-50">{t("pricing.features.recruiterUnlimitedJobs")}</span></li>
                    <li className="flex items-start gap-3"><Check className="text-blue-300 mt-0.5 flex-shrink-0" size={20} /> <span className="text-blue-50">{t("pricing.features.recruiterFullContacts")}</span></li>
                    <li className="flex items-start gap-3"><Check className="text-blue-300 mt-0.5 flex-shrink-0" size={20} /> <span className="text-blue-50">{t("pricing.features.recruiterUnlimitedCv")}</span></li>
                    <li className="flex items-start gap-3"><Check className="text-blue-300 mt-0.5 flex-shrink-0" size={20} /> <span className="text-blue-50">{t("pricing.features.recruiterFullVideos")}</span></li>
                    <li className="flex items-start gap-3"><Check className="text-blue-300 mt-0.5 flex-shrink-0" size={20} /> <span className="text-blue-50">{t("pricing.features.recruiterPriority")}</span></li>
                    <li className="flex items-start gap-3"><Check className="text-blue-300 mt-0.5 flex-shrink-0" size={20} /> <span className="text-blue-50">{t("pricing.features.recruiterAdvancedFilters")}</span></li>
                  </>
                )}
              </ul>
              <Link
                href={activePricingTab === "talents" ? "/inscription?type=talent" : "/inscription?type=recruteur"}
                className="w-full py-4 rounded-full font-bold text-white bg-[#2BAFE3] hover:bg-[#1E8CB8] transition-colors text-center shadow-lg shadow-[#2BAFE3]/20"
              >
                {t("pricing.upgradePremium")}
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
            {t("faq.title")}
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
      <section className="py-32 bg-[#0A1222] relative overflow-hidden">
        {/* Ambient Orange & Netacuv Blue Highlights */}
        <div className="pointer-events-none absolute -top-20 -left-20 w-[32rem] h-[32rem] bg-[#F59E0B]/20 rounded-full blur-[120px] z-0" />
        <div className="pointer-events-none absolute bottom-0 left-1/4 w-[28rem] h-[28rem] bg-orange-600/15 rounded-full blur-[130px] z-0" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 w-[30rem] h-[30rem] bg-[#2BAFE3]/15 rounded-full blur-[120px] z-0" />

        {/* Background Image with opacity & warm gradient overlay */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/assets/african_talent_banner.jpg" 
            alt="Rejoindre Netacuv" 
            fill 
            className="object-cover opacity-20 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1222] via-[#0A1222]/85 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-amber-950/25 via-transparent to-sky-950/20"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
            {t("finalCta.title")}
          </h2>
          <p className="text-slate-300 text-lg mb-12 max-w-2xl mx-auto">
            {t("finalCta.desc")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/talents"
              className="px-8 py-4 rounded-full font-bold text-[#0F172A] bg-[#F59E0B] hover:bg-amber-400 shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {t("finalCta.talent")}
            </Link>
            <Link
              href="/recruteurs"
              className="px-8 py-4 rounded-full font-bold text-white bg-[#2BAFE3] hover:bg-[#1E8CB8] shadow-xl shadow-[#2BAFE3]/20 hover:-translate-y-1 transition-all duration-300"
            >
              {t("finalCta.recruiter")}
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
              {t("deletedModal.title")}
            </h3>
            
            <p className="text-slate-500 text-sm leading-relaxed mb-8 px-2 font-medium">
              {t("deletedModal.desc")}
            </p>
            
            <div className="flex flex-col gap-3">
              <Link
                href="/inscription"
                onClick={() => setShowDeletedModal(false)}
                className="w-full py-3.5 bg-[#2BAFE3] hover:bg-[#1E8CB8] text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98]"
              >
                {t("deletedModal.createNew")}
              </Link>
              <button
                onClick={() => setShowDeletedModal(false)}
                className="w-full py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl transition-all active:scale-[0.98]"
              >
                {t("deletedModal.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
