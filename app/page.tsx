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
      a: "Notre intelligence artificielle vous pose des questions adaptées à votre domaine. Elle analyse ensuite vos réponses, votre élocution, votre posture et votre pertinence pour certifier vos compétences. Tout se passe directement depuis votre navigateur ou mobile.",
    },
    {
      q: "Quelles sont les limites de l'offre gratuite ?",
      a: "Les talents peuvent postuler à 1 offre gratuitement (limite à vie). Pour postuler en illimité, le compte Premium est requis. Les recruteurs peuvent créer leur profil d'entreprise et publier 1 seule offre gratuitement, mais les informations de contact des talents restent masquées.",
    },
    {
      q: "Quels sont les avantages de l'offre Premium pour un recruteur ?",
      a: "Les recruteurs Premium bénéficient de publications d'offres illimitées, d'un accès complet aux profils (coordonnées, téléchargement de CV PDF, vidéos d'entretien IA), d'un accès prioritaire aux profils étoilés et de filtres de recherche avancés.",
    },
    {
      q: "Comment fonctionne le programme d'affiliation (Parrainage) ?",
      a: "Que vous soyez en offre Gratuite ou Premium, vous gagnez de l'argent en parrainant vos connaissances. Chaque fois qu'une personne s'inscrit via votre lien et souscrit à l'offre Premium, vous gagnez immédiatement une prime (ex: 2 500 CFA) !",
    },
    {
      q: "Comment les recruteurs contactent-ils les talents ?",
      a: "Avec l'abonnement Premium, les recruteurs ont un accès direct aux emails, numéros de téléphone et réseaux sociaux des candidats. Ils peuvent également télécharger le CV au format PDF pour les contacter facilement.",
    },
    {
      q: "Comment l'IA évalue-t-elle les compétences des candidats ?",
      a: "Notre IA analyse non seulement le contenu des réponses (pertinence, vocabulaire) mais aussi la communication non-verbale (posture, clarté, confiance) pour délivrer un score de performance et certifier les meilleurs profils avec des badges.",
    },
    {
      q: "Les paiements sont-ils sécurisés et quels sont les modes acceptés ?",
      a: "Oui, totalement sécurisés. Nous acceptons les paiements par Mobile Money (Orange Money, MTN, Moov) très populaires en Afrique, ainsi que les paiements classiques par Carte Bancaire via des passerelles reconnues.",
    },
    {
      q: "Quels sont les avantages de l'offre Premium pour un talent ?",
      a: "Les talents Premium peuvent postuler à un nombre illimité d'offres d'emploi, augmenter la visibilité de leur profil auprès des recruteurs (badge Premium) et accéder à l'intégralité des fonctionnalités pour maximiser leurs chances.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] selection:bg-[#2BAFE3]/30 selection:text-[#0F172A] font-sans">
      <Navbar variant="default" />

      {/* ── HERO SECTION ── */}
      <section
        id="accueil"
        className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-[#f4f9ff]"
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

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
            {/* Left Content */}
            <div className="flex-1 max-w-2xl animate-fade-in-up">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.15] mb-6">
                Le recrutement,<br />
                <span className="text-blue-600">au-delà du CV</span><br />
                classique.
              </h1>
              <p className="text-slate-600 text-lg sm:text-xl leading-relaxed mb-8 max-w-xl">
                Découvrez une plateforme conçue pour mettre en lumière vos véritables 
                compétences grâce à des entretiens vidéo certifiés et une mise en relation directe.
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <Link
                  href="https://talent.netacuv.com/register"
                  className="px-8 py-4 rounded-full font-bold text-base text-white bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/25 shadow-xl shadow-blue-500/25 active:scale-95 transition-all duration-300 ease-in-out inline-flex items-center gap-2"
                >
                  Je suis un Talent
                </Link>
                <Link
                  href="https://recruteur.netacuv.com/register"
                  className="px-8 py-4 rounded-full font-bold text-base text-blue-600 bg-white/80 hover:bg-white border border-blue-200 shadow-sm hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 ease-in-out"
                >
                  Je suis un Recruteur
                </Link>
              </div>
            </div>

            {/* Arrow — absolute, centered vertically between the two columns */}
            <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
              <Image
                src="/assets/Arrow.png"
                alt="Flèche indicative"
                width={130}
                height={95}
                className="object-contain opacity-75"
              />
            </div>

            {/* Right Card Mockup (image 1.png from Figma) */}
            <div className="flex-1 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md animate-fade-in">
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
              Comment ça marche ?
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
                Côté Candidats
              </button>
              <button
                onClick={() => setActiveHowTab("recruteurs")}
                className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
                  activeHowTab === "recruteurs"
                    ? "bg-[#F59E0B] text-white shadow-lg shadow-[#F59E0B]/30"
                    : "text-slate-500 hover:text-[#F59E0B] bg-transparent"
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
                        { num: "01", title: "Crée ton compte en 1 minute", desc: "Accède à la plateforme avec un petit abonnement de 700 FCFA/mois.", icon: LogIn, iconColor: "text-blue-600", iconBg: "bg-blue-100" },
                        { num: "02", title: "Téléverse ton CV", desc: "Ou remplis directement ton profil avec tes infos clés.", icon: Upload, iconColor: "text-amber-500", iconBg: "bg-amber-100" },
                        { num: "03", title: "Passe le test vidéo IA", desc: "Réponds à des questions métiers en vidéo, évalue-toi en 3 essais.", icon: Ticket, iconColor: "text-fuchsia-500", iconBg: "bg-fuchsia-100" },
                        { num: "04", title: "Obtiens ta certification", desc: "L'IA note ta prestation et t'attribue un badge et des étoiles visibles.", icon: Award, iconColor: "text-amber-500", iconBg: "bg-amber-100" },
                        { num: "05", title: "Sois visible par les recruteurs", desc: "Ton profil apparaît dans les recherches selon ton score, ton CV et ta vidéo.", icon: Ticket, iconColor: "text-fuchsia-500", iconBg: "bg-fuchsia-100" },
                        { num: "06", title: "Gagne avec l'affiliation", desc: "Partage ton code et reçois des bonus quand tes filleuls s'inscrivent.", icon: Gift, iconColor: "text-amber-500", iconBg: "bg-amber-100" },
                      ].map((step, idx) => (
                        <div key={idx} className={`flex items-center gap-4 ${idx % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                          <div className="w-20 flex-shrink-0 flex items-center justify-center">
                            <span className="text-6xl lg:text-7xl font-black leading-none select-none text-[#CBD5E1]">
                              {step.num}
                            </span>
                          </div>
                          <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] px-4 lg:px-6 py-4 flex items-center gap-4 transition-all">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${step.iconBg}`}>
                              <step.icon className={`w-5 h-5 ${step.iconColor}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-base leading-snug mb-0.5 text-[#0F172A]">
                                {step.title}
                              </h3>
                              <p className="text-sm text-slate-500 leading-relaxed">
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
                        { num: "01", title: "Créez un compte recruteur en quelques minutes", desc: "Inscrivez-vous rapidement sur la plateforme pour commencer à accéder aux talents.", icon: LogIn, iconColor: "text-blue-600", iconBg: "bg-blue-100" },
                        { num: "02", title: "Accédez à la base de talents avec profils certifiés", desc: "Explorez les profils des talents, tous certifiés avec des badges de confiance.", icon: Users, iconColor: "text-amber-500", iconBg: "bg-amber-100" },
                        { num: "03", title: "Consultez les CV, vidéos de présentation et badges", desc: "Visualisez les CV et les vidéos de présentation des talents, ainsi que leurs badges.", icon: Ticket, iconColor: "text-fuchsia-500", iconBg: "bg-fuchsia-100" },
                        { num: "04", title: "Contactez directement les talents ou publiez une offre", desc: "Entrez en contact avec les talents qui correspondent à vos critères.", icon: Share2, iconColor: "text-amber-500", iconBg: "bg-amber-100" },
                        { num: "05", title: "Gagnez avec l'affiliation", desc: "Partagez votre code et recevez des bonus quand vos filleuls s'inscrivent.", icon: Gift, iconColor: "text-fuchsia-500", iconBg: "bg-fuchsia-100" },
                      ].map((step, idx) => (
                        <div key={idx} className={`flex items-center gap-4 ${idx % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                          <div className="w-20 flex-shrink-0 flex items-center justify-center">
                            <span className="text-6xl lg:text-7xl font-black leading-none select-none text-[#CBD5E1]">
                              {step.num}
                            </span>
                          </div>
                          <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] px-4 lg:px-6 py-4 flex items-center gap-4 transition-all">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${step.iconBg}`}>
                              <step.icon className={`w-5 h-5 ${step.iconColor}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-base leading-snug mb-0.5 text-[#0F172A]">
                                {step.title}
                              </h3>
                              <p className="text-sm text-slate-500 leading-relaxed">
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
                <span className="whitespace-nowrap">L'attitude face caméra :</span> <br className="hidden md:block" />
                <span className="text-[#F59E0B]">Ce que les recruteurs attendent vraiment</span>
              </h2>
              <p className="text-blue-100 text-lg leading-relaxed mb-10">
                Sur Netacuv, le CV n'est que la première étape. L'entretien vidéo IA est votre véritable vitrine. Une bonne posture et une communication claire rassurent les recruteurs et décuplent vos chances d'embauche.
              </p>
              
              <ul className="space-y-8">
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 flex-shrink-0 rounded-full border-2 border-[#F59E0B] flex items-center justify-center mt-0.5">
                    <Check className="text-[#F59E0B]" size={16} strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2 text-white">Clarté et Confiance</h4>
                    <p className="text-blue-100/80 leading-relaxed">Regardez bien l'objectif de la caméra, parlez distinctement avec une voix assurée. C'est le premier indicateur de votre leadership naturel.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 flex-shrink-0 rounded-full border-2 border-[#F59E0B] flex items-center justify-center mt-0.5">
                    <Check className="text-[#F59E0B]" size={16} strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2 text-white">Authenticité absolue</h4>
                    <p className="text-blue-100/80 leading-relaxed">Les recruteurs recherchent des personnalités, pas des robots. Soyez vous-même et évitez de lire un texte préparé à l'avance.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 flex-shrink-0 rounded-full border-2 border-[#F59E0B] flex items-center justify-center mt-0.5">
                    <Check className="text-[#F59E0B]" size={16} strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2 text-white">Environnement professionnel</h4>
                    <p className="text-blue-100/80 leading-relaxed">Un arrière-plan soigné, un bon éclairage sur votre visage et l'absence de bruits parasites reflètent votre sérieux.</p>
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
                      <span className="text-white font-bold">Analyse IA d'Expression</span>
                      <span className="text-[#F59E0B] font-black text-lg">95%</span>
                    </div>
                    <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-[#F59E0B] w-[95%] rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                    </div>
                    <div className="flex justify-between text-xs text-blue-100/70 mt-2 font-medium">
                      <span>Posture: Excellente</span>
                      <span>Ton: Confiant</span>
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
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-[#0F172A] mb-4">
              La puissance de l'IA à votre service
            </h2>
            <p className="text-slate-600 text-lg">
              Des algorithmes de pointe pour sécuriser vos recrutements et valoriser les compétences réelles.
            </p>
          </div>

          {/* Full width premium image with blue overlay */}
          <div className="max-w-7xl mx-auto mb-16 rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200 relative group">
            {/* Blue Tint Overlay from the bottom card */}
            <div className="absolute inset-0 bg-[#2BAFE3]/40 mix-blend-color z-10 pointer-events-none transition-opacity duration-700 group-hover:opacity-20" />
            <div className="absolute inset-0 bg-[#2BAFE3]/20 z-10 pointer-events-none" />
            <Image
              src="/Images/african-american-woman-experiencing-vr-simulation.jpg"
              alt="Femme utilisant la technologie IA"
              width={1400}
              height={700}
              className="w-full h-auto object-cover aspect-video md:aspect-[21/9] group-hover:scale-105 transition-transform duration-700 brightness-[1.1]"
            />
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
                {activePricingTab === "talents" ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <li className="flex items-start gap-3"><Check className="text-[#2BAFE3] mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-600">Création de profil Entreprise</span></li>
                    <li className="flex items-start gap-3"><Check className="text-[#2BAFE3] mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-600">1 offre d'emploi gratuite</span></li>
                    <li className="flex items-start gap-3"><Check className="text-[#2BAFE3] mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-600">Affiliation <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full ml-1 border border-green-200">Gains par parrainage</span></span></li>
                    <li className="flex items-start gap-3 opacity-50"><X className="text-slate-400 mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-500 line-through decoration-slate-300">Publication d'offres illimitée</span></li>
                    <li className="flex items-start gap-3 opacity-50"><X className="text-slate-400 mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-500 line-through decoration-slate-300">Coordonnées complètes des Talents</span></li>
                    <li className="flex items-start gap-3 opacity-50"><X className="text-slate-400 mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-500 line-through decoration-slate-300">Téléchargement illimité des CV PDF</span></li>
                    <li className="flex items-start gap-3 opacity-50"><X className="text-slate-400 mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-500 line-through decoration-slate-300">Vidéos complètes des entretiens IA</span></li>
                    <li className="flex items-start gap-3 opacity-50"><X className="text-slate-400 mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-500 line-through decoration-slate-300">Priorité sur les profils étoilés et certifiés</span></li>
                    <li className="flex items-start gap-3 opacity-50"><X className="text-slate-400 mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-500 line-through decoration-slate-300">Filtres de recherche avancés</span></li>
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
                    <li className="flex items-start gap-3"><Check className="text-[#F59E0B] mt-0.5 flex-shrink-0" size={20} /> <span className="text-white font-semibold">Communauté WhatsApp exclusive</span></li>
                    <li className="flex items-start gap-3"><Check className="text-[#F59E0B] mt-0.5 flex-shrink-0" size={20} /> <span className="text-white font-semibold">Affiliation <span className="text-xs font-bold text-[#0F172A] bg-[#F59E0B] px-2 py-0.5 rounded-full ml-1">Gains par parrainage</span></span></li>
                    <li className="flex items-start gap-3"><Check className="text-blue-300 mt-0.5 flex-shrink-0" size={20} /> <span className="text-blue-50">Candidatures illimitées</span></li>
                    <li className="flex items-start gap-3"><Check className="text-blue-300 mt-0.5 flex-shrink-0" size={20} /> <span className="text-blue-50">Aperçu des profils recruteurs</span></li>
                    <li className="flex items-start gap-3"><Check className="text-blue-300 mt-0.5 flex-shrink-0" size={20} /> <span className="text-blue-50">Obtention de badge</span></li>
                    <li className="flex items-start gap-3"><Check className="text-blue-300 mt-0.5 flex-shrink-0" size={20} /> <span className="text-blue-50">Ajout de CV au format PDF</span></li>
                    <li className="flex items-start gap-3"><Check className="text-blue-300 mt-0.5 flex-shrink-0" size={20} /> <span className="text-blue-50">Entretien vidéo certifié par l'IA</span></li>
                    <li className="flex items-start gap-3"><Check className="text-blue-300 mt-0.5 flex-shrink-0" size={20} /> <span className="text-blue-50">Profil prioritaire auprès des recruteurs</span></li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start gap-3"><Check className="text-[#F59E0B] mt-0.5 flex-shrink-0" size={20} /> <span className="text-white font-semibold">Création de profil Entreprise</span></li>
                    <li className="flex items-start gap-3"><Check className="text-[#F59E0B] mt-0.5 flex-shrink-0" size={20} /> <span className="text-white font-semibold">Affiliation <span className="text-xs font-bold text-[#0F172A] bg-[#F59E0B] px-2 py-0.5 rounded-full ml-1">Gains par parrainage</span></span></li>
                    <li className="flex items-start gap-3"><Check className="text-blue-300 mt-0.5 flex-shrink-0" size={20} /> <span className="text-blue-50">Publication d'offres illimitée</span></li>
                    <li className="flex items-start gap-3"><Check className="text-blue-300 mt-0.5 flex-shrink-0" size={20} /> <span className="text-blue-50">Coordonnées complètes des Talents</span></li>
                    <li className="flex items-start gap-3"><Check className="text-blue-300 mt-0.5 flex-shrink-0" size={20} /> <span className="text-blue-50">Téléchargement illimité des CV PDF</span></li>
                    <li className="flex items-start gap-3"><Check className="text-blue-300 mt-0.5 flex-shrink-0" size={20} /> <span className="text-blue-50">Vidéos complètes des entretiens IA</span></li>
                    <li className="flex items-start gap-3"><Check className="text-blue-300 mt-0.5 flex-shrink-0" size={20} /> <span className="text-blue-50">Priorité sur les profils étoilés et certifiés</span></li>
                    <li className="flex items-start gap-3"><Check className="text-blue-300 mt-0.5 flex-shrink-0" size={20} /> <span className="text-blue-50">Filtres de recherche avancés</span></li>
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
