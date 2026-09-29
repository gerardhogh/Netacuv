"use client";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Plus, Minus } from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  const [activeFaqTab, setActiveFaqTab] = useState<"talents" | "recruteurs">("talents");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [activeHowTab, setActiveHowTab] = useState<"talents" | "recruteurs">("talents");
  const [showDeletedModal, setShowDeletedModal] = useState(false);

  // Check URL for account_deleted
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("account_deleted") === "true") {
        setShowDeletedModal(true);
        // Remove query param without reloading
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("account_deleted");
        window.history.replaceState({}, "", newUrl.toString());
      }
    }
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const talentFaqs = [
    {
      q: "1. Est-ce que la plateforme est gratuite ?",
      a: "L&apos;accès aux fonctionnalités clés nécessite un petit abonnement de 700 FCFA/mois pour les talents afin de garantir la qualité des profils certifiés.",
    },
    {
      q: "2. Comment mon CV est-il évalué ?",
      a: "Notre IA analyse votre CV selon plusieurs critères précis : structure, compétences clés, pertinence des expériences et clarté.",
    },
    {
      q: "3. Que sont les étoiles et badges ?",
      a: "Les étoiles valorisent votre profil auprès des entreprises : score IA du CV, entretien vidéo réussi et complétion totale.",
    },
    {
      q: "4. Le test vidéo est-il obligatoire ?",
      a: "Il n&apos;est pas obligatoire mais vivement recommandé car les profils avec vidéo certifiée sont 3 fois plus consultés par les recruteurs.",
    },
    {
      q: "5. Puis-je refaire le test vidéo ?",
      a: "Oui, vous disposez de 3 essais pour enregistrer et valider votre meilleure prestation.",
    },
    {
      q: "6. Est-ce que mes informations sont visibles publiquement ?",
      a: "Non, seules les entreprises et recruteurs vérifiés ont accès à vos informations selon vos paramètres de confidentialité.",
    },
  ];

  const recruteurFaqs = [
    {
      q: "7. Comment accéder aux profils des talents ?",
      a: "Après création de votre compte recruteur, accédez instantanément à notre vivier de talents avec filtres multicritères.",
    },
    {
      q: "8. Puis-je poster des offres d&apos;emploi ?",
      a: "Oui, vous pouvez publier vos offres d&apos;emploi gratuitement et recevoir des candidatures qualifiées directement sur votre tableau de bord.",
    },
    {
      q: "9. Comment est vérifiée la qualité des profils ?",
      a: "Chaque talent passe une vérification automatisée de CV et un entretien vidéo avec scoring IA transparent.",
    },
    {
      q: "10. Est-ce qu&apos;il y a un coût pour les recruteurs ?",
      a: "Netacuv propose une version gratuite pour démarrer, et un plan mensuel à 1 000 FCFA/mois pour des recherches et téléchargements illimités.",
    },
  ];

  return (
    <div 
      className="min-h-screen bg-slate-50 selection:bg-blue-500 selection:text-white"
      style={{
        backgroundImage: "url('/assets/Fond.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }}
    >
      <Navbar />

      {/* ── HERO SECTION ── */}
      <section
        id="accueil"
        className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse at 80% 20%, rgba(254,235,226,0.6) 0%, rgba(230,243,254,0.7) 40%, rgba(240,248,255,0.9) 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
            {/* Left Content */}
            <div className="flex-1 max-w-2xl animate-fade-in-up">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.15] mb-6">
                Dépose ton CV,<br />
                <span className="text-blue-600">brille auprès des</span><br />
                recruteurs
              </h1>
              <p className="text-slate-600 text-lg sm:text-xl leading-relaxed mb-8 max-w-xl">
                Rejoins une plateforme intelligente pour améliorer ta visibilité,
                passer un test vidéo, et booster ton profil avec des étoiles.
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <Link
                  href="/inscription?type=talent"
                  className="px-8 py-4 rounded-full font-bold text-base text-white bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/25 shadow-xl shadow-blue-500/25 active:scale-95 transition-all duration-300 ease-in-out inline-flex items-center gap-2"
                >
                  Je crée mon compte
                </Link>
                <Link
                  href="/recruteurs"
                  className="px-8 py-4 rounded-full font-bold text-base text-blue-600 bg-white/80 hover:bg-white border border-blue-200 shadow-sm hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 ease-in-out"
                >
                  Je recrute
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

      {/* ── POURQUOI CHOISIR NETACUV ── */}
      <section id="pourquoi" className="py-24 bg-white relative">
        <motion.div 
          className="max-w-7xl mx-auto px-6"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
              Pourquoi choisir <span className="text-blue-600">NETACUV</span>
            </h2>
            <p className="text-slate-500 text-base sm:text-lg leading-relaxed">
              Débloquez votre plein potentiel et accédez à des opportunités
              concrètes alignées avec vos ambitions.
            </p>
          </div>

          {/* 5 Cards Layout with large center card matching Figma */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center max-w-6xl mx-auto">
            {/* Left 2 Cards */}
            <div className="space-y-6 flex flex-col justify-center">
              {/* Card 1: Affiliation */}
              <div className="p-7 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ease-in-out relative">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                  <Image
                    src="/assets/Icon01.png"
                    alt="Affiliation"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <h3 className="font-extrabold text-lg text-slate-900 mb-2">
                  Affiliation récompensée
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-4">
                  Partage ton code et gagne des récompenses pour chaque filleul.
                </p>
                <Link
                  href="/inscription?type=talent"
                  className="inline-block px-4 py-1.5 rounded-full text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Gagne plus !
                </Link>
              </div>

              {/* Card 2: Test vidéo */}
              <div className="p-7 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ease-in-out">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                  <Image
                    src="/assets/Icon03.png"
                    alt="Test vidéo"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <h3 className="font-extrabold text-lg text-slate-900 mb-2">
                  Test vidéo automatisé
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                  Réponds aux questions métiers avec vidéo, notation IA et badge
                  de performance.
                </p>
              </div>
            </div>

            {/* Center Big Featured Card: Profil certifié & étoiles */}
            <div className="rounded-3xl p-8 sm:p-10 text-white text-center shadow-2xl relative overflow-hidden flex flex-col items-center justify-between min-h-[440px] bg-gradient-to-b from-[#0080b7] to-[#005f88] transform lg:-translate-y-2 hover:-translate-y-3 hover:shadow-xl transition-all duration-300 ease-in-out">
              <div className="w-24 h-24 mb-6 relative flex items-center justify-center">
                <Image
                  src="/assets/Certif.png"
                  alt="Certification"
                  width={96}
                  height={96}
                  className="object-contain drop-shadow-md"
                />
              </div>

              <div className="my-auto">
                <h3 className="text-2xl sm:text-3xl font-black mb-3 text-white">
                  Profil certifié<br />& étoiles
                </h3>
                <p className="text-blue-100 text-sm leading-relaxed max-w-xs mx-auto mb-8">
                  Optimise ton CV, passe un test vidéo, et gagne des badges de
                  confiance auprès des entreprises.
                </p>
              </div>

              <Link
                href="/inscription?type=talent"
                className="w-full py-4 rounded-full font-bold text-sm bg-blue-500 hover:bg-blue-400 text-white shadow-lg hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 ease-in-out active:scale-95"
              >
                Commencer maintenant
              </Link>
            </div>

            {/* Right 2 Cards */}
            <div className="space-y-6 flex flex-col justify-center">
              {/* Card 3: Recruteurs sérieux */}
              <div className="p-7 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ease-in-out">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                  <Image
                    src="/assets/Icon02.png"
                    alt="Recruteurs sérieux"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <h3 className="font-extrabold text-lg text-slate-900 mb-2">
                  Recruteurs sérieux
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                  Des entreprises vérifiées et des outils de recherche
                  puissants.
                </p>
              </div>

              {/* Card 4: Paiement accessible */}
              <div className="p-7 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ease-in-out">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                  <Image
                    src="/assets/Icon04.png"
                    alt="Paiement accessible"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <h3 className="font-extrabold text-lg text-slate-900 mb-2">
                  Paiement accessible
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-4">
                  Abonnement mensuel à seulement 700 FCFA, accessible à tous.
                </p>
                <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200">
                  Sécurité fiable
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── STATS SECTION ── */}
      <section
        className="py-20 px-6 relative"
        style={{
          background:
            "linear-gradient(135deg, #cde6f9 0%, #e8f4fc 50%, #eee8f8 100%)",
        }}
      >
        <motion.div 
          className="max-w-5xl mx-auto text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
            Déjà plus de 5 000 talents inscrits !
          </h2>
          <p className="text-slate-600 text-base sm:text-lg max-w-3xl mx-auto mb-12 leading-relaxed">
            Vous connecter aux meilleures opportunités, valoriser votre parcours
            professionnel, améliorer votre carrière et décrocher encore plus
            d&apos;opportunités.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl py-8 px-6 shadow-xl border border-white/80">
              <p className="text-4xl font-black text-blue-600 mb-2">+500</p>
              <p className="text-sm font-semibold text-slate-600">
                Recruteurs actifs
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-md rounded-3xl py-8 px-6 shadow-xl border border-white/80">
              <p className="text-4xl font-black text-blue-600 mb-2">+10 000</p>
              <p className="text-sm font-semibold text-slate-600">
                CV analysés par l&apos;IA
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-md rounded-3xl py-8 px-6 shadow-xl border border-white/80">
              <p className="text-4xl font-black text-blue-600 mb-2">24h/24</p>
              <p className="text-sm font-semibold text-slate-600">
                Support et assistance
              </p>
            </div>
          </div>

          <div className="max-w-5xl mx-auto rounded-[2.5rem] overflow-hidden shadow-2xl relative h-64 md:h-96 border-4 border-white/50">
            <Image
              src="/assets/african_talent_banner.jpg"
              alt="Talents africains au travail"
              fill
              className="object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
        </motion.div>
      </section>

      {/* ── COMMENT ÇA MARCHE ? ── */}
      <section id="comment" className="py-28 bg-white relative">
        <motion.div 
          className="max-w-4xl mx-auto px-6"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-8">
              Comment ça marche ?
            </h2>

            {/* Toggle tabs */}
            <div className="inline-flex p-1.5 rounded-full bg-slate-100 border border-slate-200">
              <button
                onClick={() => setActiveHowTab("talents")}
                className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${
                  activeHowTab === "talents"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Pour les Talents
              </button>
              <button
                onClick={() => setActiveHowTab("recruteurs")}
                className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${
                  activeHowTab === "recruteurs"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Pour les Recruteurs
              </button>
            </div>
          </div>

          {/* Steps — identical layout and spacing for both tabs */}
          <div className="flex flex-col gap-6">
            {(activeHowTab === "talents"
              ? [
                  {
                    num: "01",
                    iconBg: "bg-blue-100",
                    iconColor: "#4F8EF7",
                    title: "Crée ton compte en 1 minute",
                    desc: "Accède à la plateforme avec un petit abonnement de 600 FCFA/mois.",
                    align: "right",
                  },
                  {
                    num: "02",
                    iconBg: "bg-amber-100",
                    iconColor: "#F59E0B",
                    title: "Téléverse ton CV",
                    desc: "Ou remplis directement ton profil avec tes infos clés.",
                    align: "left",
                  },
                  {
                    num: "03",
                    iconBg: "bg-purple-100",
                    iconColor: "#A855F7",
                    title: "Passe le test vidéo IA",
                    desc: "Réponds à des questions métiers en vidéo, évalue-toi en 3 essais.",
                    align: "right",
                  },
                  {
                    num: "04",
                    iconBg: "bg-amber-100",
                    iconColor: "#F59E0B",
                    title: "Obtiens ta certification",
                    desc: "L&apos;IA note ta prestation et t&apos;attribue un badge et des étoiles visibles.",
                    align: "left",
                  },
                  {
                    num: "05",
                    iconBg: "bg-purple-100",
                    iconColor: "#A855F7",
                    title: "Sois visible par les recruteurs",
                    desc: "Ton profil apparaît dans les recherches selon ton score, ton CV et ta vidéo.",
                    align: "right",
                  },
                  {
                    num: "06",
                    iconBg: "bg-amber-100",
                    iconColor: "#F59E0B",
                    title: "Gagne avec l&apos;affiliation",
                    desc: "Partage ton code et reçois des bonus quand tes filleuls s&apos;inscrivent.",
                    align: "left",
                  },
                ]
              : [
                  {
                    num: "01",
                    iconBg: "bg-blue-100",
                    iconColor: "#4F8EF7",
                    title: "Créez un compte recruteur en quelques minutes",
                    desc: "Inscrivez-vous rapidement sur la plateforme pour commencer à accéder aux talents.",
                    align: "right",
                  },
                  {
                    num: "02",
                    iconBg: "bg-amber-100",
                    iconColor: "#F59E0B",
                    title: "Accédez à la base de talents avec profils certifiés",
                    desc: "Explorez les profils des talents, tous certifiés avec des badges de confiance et utilisez des filtres pour affiner votre recherche (domaine, score, étoiles, etc.).",
                    align: "left",
                  },
                  {
                    num: "03",
                    iconBg: "bg-purple-100",
                    iconColor: "#A855F7",
                    title: "Consultez les CV, vidéos de présentation et badges",
                    desc: "Visualisez les CV et les vidéos de présentation des talents, ainsi que leurs badges de performance.",
                    align: "right",
                  },
                  {
                    num: "04",
                    iconBg: "bg-amber-100",
                    iconColor: "#F59E0B",
                    title: "Contactez directement les talents ou publiez une offre",
                    desc: "Entrez en contact avec les talents qui correspondent à vos critères ou publiez une nouvelle offre d&apos;emploi.",
                    align: "left",
                  },
                  {
                    num: "05",
                    iconBg: "bg-purple-100",
                    iconColor: "#A855F7",
                    title: "Gagnez avec l&apos;affiliation",
                    desc: "Partagez votre code et recevez des bonus quand vos filleuls s&apos;inscrivent.",
                    align: "right",
                  },
                ]
            ).map((step, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-4 ${
                  step.align === "left" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Big number */}
                <div className="w-20 flex-shrink-0 flex items-center justify-center">
                  <span
                    className="text-7xl font-black leading-none select-none"
                    style={{ color: "#CBD5E1", fontFamily: "inherit" }}
                  >
                    {step.num}
                  </span>
                </div>

                {/* Card */}
                <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-md px-6 py-5 flex items-start gap-4">
                  {/* Icon circle */}
                  <div
                    className={`w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center ${step.iconBg}`}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"
                        fill={step.iconColor}
                      />
                    </svg>
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-extrabold text-base leading-snug mb-1.5"
                      style={{ color: "#1E2D4E" }}
                    >
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
        </motion.div>
      </section>



      {/* ── FAQ (ACCORDION FULL WIDTH DEEP BLUE MATCHING FIGMA) ── */}
      <section
        id="faq"
        className="py-24 px-6 text-white"
        style={{
          background: "linear-gradient(180deg, #0076a8 0%, #005a82 100%)",
        }}
      >
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-3xl md:text-5xl font-black text-center mb-12 text-white">
            Questions fréquentes
          </h2>

          {/* FAQ Tabs */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex p-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
              <button
                onClick={() => setActiveFaqTab("talents")}
                className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all ${
                  activeFaqTab === "talents"
                    ? "bg-white text-blue-700 shadow-lg"
                    : "text-blue-100 hover:text-white"
                }`}
              >
                Pour les Talents
              </button>
              <button
                onClick={() => setActiveFaqTab("recruteurs")}
                className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all ${
                  activeFaqTab === "recruteurs"
                    ? "bg-white text-blue-700 shadow-lg"
                    : "text-blue-100 hover:text-white"
                }`}
              >
                Pour les Recruteurs
              </button>
            </div>
          </div>

          {/* Accordion Questions */}
          <div className="space-y-4">
            {(activeFaqTab === "talents" ? talentFaqs : recruteurFaqs).map(
              (faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={index}
                    className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base hover:bg-white/5 transition-colors"
                    >
                      <span>{faq.q}</span>
                      <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                        {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-blue-100 leading-relaxed border-t border-white/10">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>
        </motion.div>
      </section>

      {/* ── CTA: REJOIGNEZ LA RÉVOLUTION DU RECRUTEMENT ── */}
      <section className="py-20 px-6 bg-slate-50">
        <motion.div 
          className="max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div
            className="rounded-3xl p-10 md:p-14 text-center shadow-2xl border border-blue-100 relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, #d8edf9 0%, #eef6fd 50%, #f3ebf9 100%)",
            }}
          >
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
              Rejoignez la révolution du recrutement
            </h2>
            <p className="text-slate-600 text-base sm:text-lg mb-8 max-w-2xl mx-auto">
              Que vous soyez à la recherche d&apos;un emploi ou d&apos;un profil qualifié,
              Netacuv est la solution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/inscription?type=talent"
                className="px-8 py-4 rounded-full font-bold text-base text-white bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/25 shadow-xl shadow-blue-500/25 active:scale-95 transition-all duration-300 ease-in-out"
              >
                Je suis un talentueux
              </Link>
              <Link
                href="/inscription?type=recruteur"
                className="px-8 py-4 rounded-full font-bold text-base text-blue-600 bg-white hover:bg-blue-50 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/25 border border-blue-200 shadow-sm active:scale-95 transition-all duration-300 ease-in-out"
              >
                Je suis un recruteur
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />

      {/* ── MODAL SUPPRESSION COMPTE ── */}
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
                href="/inscription"
                onClick={() => setShowDeletedModal(false)}
                className="w-full py-3.5 bg-[#32A8D7] hover:bg-[#2896c2] text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98]"
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
