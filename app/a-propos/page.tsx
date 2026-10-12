"use client";

import Link from "next/link";
import Image from "next/image";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  ShieldCheck,
  HandHeart,
  Cpu,
  Lock,
  Users,
  Building2,
  ScanSearch,
  HeartHandshake,
  ArrowRight,
  Sparkles,
} from "lucide-react";



const values = [
  {
    icon: ShieldCheck,
    title: "Équité & Méritocratie",
    desc: "Chaque talent mérite de briller au-delà des diplômes. L'évaluation vidéo IA remet les compétences orales et le savoir-être au cœur de la sélection.",
    color: "from-blue-50 to-sky-50",
    iconColor: "text-blue-600",
    border: "border-blue-100 hover:border-blue-300",
  },
  {
    icon: HandHeart,
    title: "Accessibilité Pour Tous",
    desc: "Un tarif symbolique de 700 FCFA/mois pour garantir un service premium accessible à tous les candidats, sans barrière financière.",
    color: "from-emerald-50 to-teal-50",
    iconColor: "text-emerald-600",
    border: "border-emerald-100 hover:border-emerald-300",
  },
  {
    icon: Cpu,
    title: "Innovation Utile",
    desc: "L'IA n'est pas là pour remplacer l'humain, mais pour accélérer la prise de décision et qualifier chaque profil avec précision.",
    color: "from-violet-50 to-indigo-50",
    iconColor: "text-violet-600",
    border: "border-violet-100 hover:border-violet-300",
  },
  {
    icon: Lock,
    title: "Confiance & Sécurité",
    desc: "Des profils vérifiés et des données personnelles rigoureusement protégées pour assurer des échanges sereins entre talents et recruteurs.",
    color: "from-orange-50 to-amber-50",
    iconColor: "text-orange-600",
    border: "border-orange-100 hover:border-orange-300",
  },
];

const metrics = [
  { icon: Users, value: "+5 000", label: "Talents inscrits" },
  { icon: Building2, value: "+500", label: "Recruteurs & Entreprises" },
  { icon: ScanSearch, value: "+10 000", label: "CV analysés par notre IA" },
  { icon: HeartHandshake, value: "24h/24", label: "Support et accompagnement" },
];

export default function AProposPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1">

        {/* ═══ HERO SPLIT — image left / content right ═══ */}
        <section className="relative overflow-hidden bg-white border-b border-slate-100 min-h-[calc(100vh-80px)] flex flex-col justify-center">
          <div className="flex flex-col md:flex-row flex-1 self-stretch min-h-[calc(100vh-80px)]">

            {/* LEFT — photo panel : pleine hauteur, touche le bord gauche et va jusqu'en bas sans espace blanc */}
            <div className="relative w-full md:w-[360px] lg:w-[440px] xl:w-[480px] flex-shrink-0 self-stretch overflow-hidden min-h-[340px] md:min-h-full bg-[#1da1e2]">
              <Image
                src="/Images/join-us-netacuv.jpg"
                alt="À propos de Netacuv"
                fill
                className="object-cover object-center"
                priority
              />
            </div>

            {/* RIGHT — headline + text + CTAs */}
            <div className="flex-1 flex items-center px-8 md:px-14 lg:px-20 py-12 md:py-20 max-w-3xl">
              <div className="max-w-2xl">
                <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-4">
                  Notre Histoire &amp; Engagement
                </p>
                <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-black text-slate-900 leading-tight mb-6">
                  Réinventer l&apos;évaluation et{" "}
                  <span className="text-blue-600">le recrutement</span>{" "}
                  en Afrique
                </h1>
                <p className="text-slate-600 text-lg leading-relaxed mb-10 max-w-xl">
                  Nous transformons des CV passifs en preuves vivantes de compétences
                  grâce à l&apos;Intelligence Artificielle — pour rendre chaque talent
                  visible et chaque recrutement plus juste.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/inscription?type=talent"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-3.5 rounded-full text-sm transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-600/30"
                  >
                    Rejoindre en tant que Talent
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/recruteurs"
                    className="inline-flex items-center gap-2 border-2 border-slate-300 hover:border-blue-500 text-slate-700 hover:text-blue-600 font-bold px-7 py-3.5 rounded-full text-sm transition-all hover:scale-[1.02] bg-white"
                  >
                    Espace Recruteur
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ HISTOIRE ET VISION ═══ */}
        <section className="py-24 px-6 bg-slate-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
                Notre Raison d&apos;Être
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
                Un double problème. Une seule solution.
              </h2>
              <p className="text-slate-500 max-w-xl mx-auto text-base">
                Le marché de l&apos;emploi africain souffre d&apos;un déséquilibre structurel que nous avons choisi de corriger.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  emoji: "⚡",
                  bg: "bg-red-50",
                  title: "Le Constat",
                  text: "Des candidats talentueux restent invisibles derrière des CV mal structurés, pendant que des recruteurs perdent un temps précieux à trier sans garanties de compétences réelles.",
                },
                {
                  emoji: "🎯",
                  bg: "bg-blue-50",
                  title: "Notre Mission",
                  text: "Démocratiser l'accès aux opportunités professionnelles en offrant aux chercheurs d'emploi un label de crédibilité certifié et une vitrine vidéo dynamique.",
                  featured: true,
                },
                {
                  emoji: "🌍",
                  bg: "bg-violet-50",
                  title: "Notre Vision",
                  text: "Devenir le standard de référence pour l'évaluation et la vérification des talents en Afrique francophone, en favorisant le mérite, la transparence et la rapidité de recrutement.",
                },
              ].map(({ emoji, bg, title, text, featured }) => (
                <div
                  key={title}
                  className={`bg-white rounded-3xl p-8 border ${featured ? "border-blue-200 ring-1 ring-blue-100" : "border-slate-100"} shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-300`}
                >
                  <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center mb-5 text-2xl`}>
                    {emoji}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">{title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ 4 PILIERS ═══ */}
        <section className="py-24 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
                Nos Valeurs
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900">
                Les 4 Piliers de Netacuv
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map(({ icon: Icon, title, desc, color, iconColor, border }) => (
                <div
                  key={title}
                  className={`group bg-gradient-to-br ${color} rounded-3xl p-7 border ${border} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-default`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                    <Icon size={22} className={iconColor} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-3 leading-snug">{title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ MÉTRIQUES IMPACT ═══ */}
        <section
          className="py-20 px-6 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #003f6b 0%, #005a82 50%, #0076a8 100%)" }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-14">
              <span className="inline-block bg-white/10 text-blue-200 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
                Notre Impact
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-white">
                Des chiffres qui parlent d&apos;eux-mêmes
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {metrics.map(({ icon: Icon, value, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center text-center bg-white/10 backdrop-blur rounded-3xl p-8 border border-white/15 hover:bg-white/15 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
                    <Icon size={22} className="text-blue-200" />
                  </div>
                  <span className="text-3xl md:text-4xl font-black text-white mb-2">{value}</span>
                  <span className="text-blue-200/80 text-sm leading-snug">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ CTA FINAL ═══ */}
        <section className="py-24 px-6 bg-gradient-to-br from-[#e8f4fd] via-white to-[#f0f8ff]">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
              <Sparkles size={13} />
              Passez à l&apos;Action
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-5 leading-tight">
              Prêt à transformer votre carrière<br className="hidden md:block" /> ou vos recrutements ?
            </h2>
            <p className="text-slate-500 text-lg mb-10 max-w-xl mx-auto">
              Rejoignez des milliers de talents et recruteurs qui font confiance à Netacuv pour des échanges certifiés et efficaces.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/inscription?type=talent"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-full text-sm transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-600/30"
              >
                Rejoindre en tant que Talent
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/recruteurs"
                className="inline-flex items-center justify-center gap-2 border-2 border-blue-300 hover:border-blue-600 text-blue-700 hover:text-blue-800 font-bold px-8 py-4 rounded-full text-sm transition-all hover:scale-[1.02] bg-white"
              >
                Espace Recruteur
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
