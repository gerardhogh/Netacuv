"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";
import Image from "next/image";
import { Check, X } from "lucide-react";
import { useTranslations } from "next-intl";

export default function TalentsPage() {
  const t = useTranslations("talentLanding");

  const features = [
    {
      title: t("features.feat1Title"),
      desc: t("features.feat1Desc"),
    },
    {
      title: t("features.feat2Title"),
      desc: t("features.feat2Desc"),
    },
    {
      title: t("features.feat3Title"),
      desc: t("features.feat3Desc"),
    },
    {
      title: t("features.feat4Title"),
      desc: t("features.feat4Desc"),
    },
  ];

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
            {t("heroTitle1")}<br className="hidden md:block" />{" "}
            {t("heroTitle2")}
          </h1>
          <p className="text-slate-600 text-lg md:text-xl">
            {t("heroSubtitle")}
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
          {features.map((feat, i) => (
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
            {t("pricing.title")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col h-full">
              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-500 mb-2">{t("pricing.freeOption")}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-[#0F172A]">{t("pricing.freePrice")}</span>
                  <span className="text-slate-500 font-semibold">{t("pricing.perMonth")}</span>
                </div>
                <p className="text-sm text-slate-500 mt-2">{t("pricing.freeDesc")}</p>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3"><Check className="text-[#2BAFE3] mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-600">{t("pricing.whatsapp")}</span></li>
                <li className="flex items-start gap-3"><Check className="text-[#2BAFE3] mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-600">{t("pricing.affiliation")} <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full ml-1 border border-green-200">{t("pricing.referralGains")}</span></span></li>
                <li className="flex items-start gap-3"><Check className="text-[#2BAFE3] mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-600">{t("pricing.basicProfile")}</span></li>
                <li className="flex items-start gap-3"><Check className="text-[#2BAFE3] mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-600">{t("pricing.oneFreeApp")}</span></li>
                <li className="flex items-start gap-3 opacity-50"><X className="text-slate-400 mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-500 line-through decoration-slate-300">{t("pricing.unlimitedApps")}</span></li>
                <li className="flex items-start gap-3 opacity-50"><X className="text-slate-400 mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-500 line-through decoration-slate-300">{t("pricing.recruiterPreview")}</span></li>
                <li className="flex items-start gap-3 opacity-50"><X className="text-slate-400 mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-500 line-through decoration-slate-300">{t("pricing.badge")}</span></li>
                <li className="flex items-start gap-3 opacity-50"><X className="text-slate-400 mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-500 line-through decoration-slate-300">{t("pricing.pdfCv")}</span></li>
                <li className="flex items-start gap-3 opacity-50"><X className="text-slate-400 mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-500 line-through decoration-slate-300">{t("pricing.aiVideo")}</span></li>
                <li className="flex items-start gap-3 opacity-50"><X className="text-slate-400 mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-500 line-through decoration-slate-300">{t("pricing.priorityProfile")}</span></li>
              </ul>
              <Link
                href="/inscription?type=talent"
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
                  <span className="text-5xl font-black text-white">{t("pricing.premiumPrice")}</span>
                  <span className="text-slate-400 font-semibold">{t("pricing.perMonth")}</span>
                </div>
                <p className="text-sm text-slate-400 mt-2">{t("pricing.premiumDesc")}</p>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3"><Check className="text-[#F59E0B] mt-0.5 flex-shrink-0" size={20} /> <span className="text-white font-semibold">{t("pricing.whatsapp")}</span></li>
                <li className="flex items-start gap-3"><Check className="text-[#F59E0B] mt-0.5 flex-shrink-0" size={20} /> <span className="text-white font-semibold">{t("pricing.affiliation")} <span className="text-xs font-bold text-[#0F172A] bg-[#F59E0B] px-2 py-0.5 rounded-full ml-1">{t("pricing.referralGains")}</span></span></li>
                <li className="flex items-start gap-3"><Check className="text-blue-300 mt-0.5 flex-shrink-0" size={20} /> <span className="text-blue-50">{t("pricing.unlimitedApps")}</span></li>
                <li className="flex items-start gap-3"><Check className="text-blue-300 mt-0.5 flex-shrink-0" size={20} /> <span className="text-blue-50">{t("pricing.recruiterPreview")}</span></li>
                <li className="flex items-start gap-3"><Check className="text-blue-300 mt-0.5 flex-shrink-0" size={20} /> <span className="text-blue-50">{t("pricing.badge")}</span></li>
                <li className="flex items-start gap-3"><Check className="text-blue-300 mt-0.5 flex-shrink-0" size={20} /> <span className="text-blue-50">{t("pricing.pdfCv")}</span></li>
                <li className="flex items-start gap-3"><Check className="text-blue-300 mt-0.5 flex-shrink-0" size={20} /> <span className="text-blue-50">{t("pricing.aiVideo")}</span></li>
                <li className="flex items-start gap-3"><Check className="text-blue-300 mt-0.5 flex-shrink-0" size={20} /> <span className="text-blue-50">{t("pricing.priorityProfile")}</span></li>
              </ul>
              <Link
                href="/inscription?type=talent"
                className="w-full py-4 rounded-full font-bold text-white bg-[#2BAFE3] hover:bg-[#1E8CB8] transition-colors text-center shadow-lg shadow-[#2BAFE3]/20"
              >
                {t("pricing.upgradePremium")}
              </Link>
            </div>
          </div>
          
          <p className="text-center text-sm text-slate-500 mt-6">
            {t("pricing.securityNotice")}
          </p>
        </div>

        {/* Bottom CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/inscription?type=talent"
            className="px-8 py-3 rounded-full font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg"
          >
            {t("createAccount")}
          </Link>
          <Link
            href="/connexion"
            className="px-8 py-3 rounded-full font-bold text-sm text-blue-600 bg-white border border-blue-200 hover:bg-blue-50 transition-colors"
          >
            {t("login")}
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
