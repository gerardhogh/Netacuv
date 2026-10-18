"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, XCircle, Check, X } from "lucide-react";
import { useTranslations } from "next-intl";

export default function RecruteursPage() {
  const t = useTranslations("recruiterLanding");

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-500 selection:text-white">
      <Navbar />

      <main
        className="pt-16 pb-24 px-6 relative overflow-hidden bg-white"
      >
        <div className="max-w-4xl mx-auto text-center mb-8">
          <h1 className="text-3xl md:text-5xl font-black leading-tight mb-4 text-blue-600">
            {t("heroTitle1")}<br className="hidden md:block" />
            {" "}{t("heroTitle2")}
          </h1>
          <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto">
            {t("heroSubtitle")}
          </p>
        </div>

        {/* Hero Image */}
        <div className="max-w-4xl mx-auto flex justify-center mb-12 relative">
          <Image
            src="/assets/Frame 10000048306.png"
            alt="Recruteurs"
            width={800}
            height={500}
            className="w-full max-w-3xl h-auto object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/assets/Group 3.png";
            }}
          />
        </div>

        {/* 6 Features Grid */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {[
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
            {
              title: t("features.feat5Title"),
              desc: t("features.feat5Desc"),
            },
            {
              title: t("features.feat6Title"),
              desc: t("features.feat6Desc"),
            },
          ].map((feat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-start gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800 mb-2">{feat.title}</h3>
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
                <li className="flex items-start gap-3"><Check className="text-[#2BAFE3] mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-600">{t("pricing.companyProfile")}</span></li>
                <li className="flex items-start gap-3"><Check className="text-[#2BAFE3] mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-600">{t("pricing.oneFreeJob")}</span></li>
                <li className="flex items-start gap-3"><Check className="text-[#2BAFE3] mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-600">{t("pricing.affiliation")} <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full ml-1 border border-green-200">{t("pricing.referralGains")}</span></span></li>
                <li className="flex items-start gap-3 opacity-50"><X className="text-slate-400 mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-500 line-through decoration-slate-300">{t("pricing.unlimitedJobs")}</span></li>
                <li className="flex items-start gap-3 opacity-50"><X className="text-slate-400 mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-500 line-through decoration-slate-300">{t("pricing.fullContacts")}</span></li>
                <li className="flex items-start gap-3 opacity-50"><X className="text-slate-400 mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-500 line-through decoration-slate-300">{t("pricing.unlimitedCv")}</span></li>
                <li className="flex items-start gap-3 opacity-50"><X className="text-slate-400 mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-500 line-through decoration-slate-300">{t("pricing.fullAiVideos")}</span></li>
                <li className="flex items-start gap-3 opacity-50"><X className="text-slate-400 mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-500 line-through decoration-slate-300">{t("pricing.priorityProfiles")}</span></li>
                <li className="flex items-start gap-3 opacity-50"><X className="text-slate-400 mt-0.5 flex-shrink-0" size={20} /> <span className="text-slate-500 line-through decoration-slate-300">{t("pricing.advancedFilters")}</span></li>
              </ul>
              <Link
                href="/inscription?type=recruteur"
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
                <li className="flex items-start gap-3"><Check className="text-[#F59E0B] mt-0.5 flex-shrink-0" size={20} /> <span className="text-white font-semibold">{t("pricing.companyProfile")}</span></li>
                <li className="flex items-start gap-3"><Check className="text-[#F59E0B] mt-0.5 flex-shrink-0" size={20} /> <span className="text-white font-semibold">{t("pricing.affiliation")} <span className="text-xs font-bold text-[#0F172A] bg-[#F59E0B] px-2 py-0.5 rounded-full ml-1">{t("pricing.referralGains")}</span></span></li>
                <li className="flex items-start gap-3"><Check className="text-blue-300 mt-0.5 flex-shrink-0" size={20} /> <span className="text-blue-50">{t("pricing.unlimitedJobs")}</span></li>
                <li className="flex items-start gap-3"><Check className="text-blue-300 mt-0.5 flex-shrink-0" size={20} /> <span className="text-blue-50">{t("pricing.fullContacts")}</span></li>
                <li className="flex items-start gap-3"><Check className="text-blue-300 mt-0.5 flex-shrink-0" size={20} /> <span className="text-blue-50">{t("pricing.unlimitedCv")}</span></li>
                <li className="flex items-start gap-3"><Check className="text-blue-300 mt-0.5 flex-shrink-0" size={20} /> <span className="text-blue-50">{t("pricing.fullAiVideos")}</span></li>
                <li className="flex items-start gap-3"><Check className="text-blue-300 mt-0.5 flex-shrink-0" size={20} /> <span className="text-blue-50">{t("pricing.priorityProfiles")}</span></li>
                <li className="flex items-start gap-3"><Check className="text-blue-300 mt-0.5 flex-shrink-0" size={20} /> <span className="text-blue-50">{t("pricing.advancedFilters")}</span></li>
              </ul>
              <Link
                href="/inscription?type=recruteur"
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
            href="/inscription?type=recruteur"
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
