import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Netacuv – Plateforme intelligente de recrutement",
  description:
    "Netacuv vous connecte aux meilleurs talents vérifiés par IA. Déposez votre CV, passez un test vidéo et boostez votre profil avec des étoiles.",
  keywords: ["recrutement", "CV", "talents", "Afrique", "emploi", "IA"],
  openGraph: {
    title: "Netacuv",
    description: "Plateforme intelligente de mise en relation talents & recruteurs",
    siteName: "Netacuv",
  },
};

import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { headers } from 'next/headers';
import { Open_Sans } from 'next/font/google';
import { prisma } from "@/lib/prisma";
import Providers from "./components/Providers";
import NextTopLoader from 'nextjs-toploader';
import Image from "next/image";
import VisitorTracker from "./components/VisitorTracker";

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-open-sans',
});

// Cache en mémoire pour éviter d'interroger Prisma à CHAQUE requête de page (gain: ~200-400ms)
let cachedMaintenance: { value: boolean; timestamp: number } | null = null;
const MAINTENANCE_CACHE_TTL_MS = 60 * 1000;

async function checkMaintenanceMode(): Promise<boolean> {
  const now = Date.now();
  if (cachedMaintenance && now - cachedMaintenance.timestamp < MAINTENANCE_CACHE_TTL_MS) {
    return cachedMaintenance.value;
  }
  try {
    const maintenanceSetting = await prisma.systemSetting.findUnique({
      where: { key: "MAINTENANCE_MODE" },
    });
    const isMaintenance = maintenanceSetting?.value === "true";
    cachedMaintenance = { value: isMaintenance, timestamp: now };
    return isMaintenance;
  } catch {
    return false;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [locale, messages, isMaintenance, headersList] = await Promise.all([
    getLocale(),
    getMessages(),
    checkMaintenanceMode(),
    headers(),
  ]);

  const host = headersList.get("host") || "";
  const pathname = headersList.get("x-pathname") || "";
  const isAdminSubdomain = host.startsWith("admin.");
  const isAdminRoute = 
    pathname.startsWith("/admin") || 
    pathname.startsWith("/dashboard/admin") || 
    pathname.startsWith("/api/admin") || 
    pathname.startsWith("/api/auth");

  if (isMaintenance && !isAdminSubdomain && !isAdminRoute) {
    return (
      <html lang={locale} className={`${openSans.variable} bg-[#061527]`} style={{ backgroundColor: "#061527" }}>
        <head>
          <title>Site en maintenance - Netacuv</title>
        </head>
        <body 
          style={{ backgroundColor: "#061527", color: "#ffffff" }}
          className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#0b223d] via-[#061527] to-[#030b14] font-sans px-6 py-6 sm:px-10 sm:py-10 text-center overflow-hidden selection:bg-sky-400/30 text-white"
        >
          {/* Ambient Lighting & Glows bleu nuit teintés Netacuv */}
          <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 bg-[#32A8D7]/20 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute -bottom-40 -right-40 w-[30rem] h-[30rem] bg-[#1e8ae9]/20 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[45rem] h-[45rem] bg-[#0c3e70]/30 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute top-1/4 right-1/4 w-80 h-80 bg-[#f97316]/10 rounded-full blur-3xl" />

          {/* Netacuv "N" Symbol Watermarks in Background */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden select-none">
            {/* Main Central Stylized Watermark */}
            <div className="w-[580px] h-[580px] max-w-[90vw] max-h-[90vw] opacity-[0.06] transform -rotate-12 scale-110">
              <Image
                src="/Logo/SVG/Asset 14.svg"
                alt=""
                width={580}
                height={580}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            {/* Top-Right Secondary Floating Symbol */}
            <div className="absolute -top-16 -right-16 w-80 h-80 opacity-[0.04] transform rotate-12">
              <Image
                src="/Logo/SVG/Asset 14.svg"
                alt=""
                width={320}
                height={320}
                className="w-full h-full object-contain"
              />
            </div>
            {/* Bottom-Left Secondary Floating Symbol */}
            <div className="absolute -bottom-20 -left-20 w-80 h-80 opacity-[0.04] transform -rotate-6">
              <Image
                src="/Logo/SVG/Asset 14.svg"
                alt=""
                width={320}
                height={320}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Content Container */}
          <div className="relative z-10 flex flex-col items-center max-w-md sm:max-w-lg w-full px-1 sm:px-0">
            {/* Netacuv Logo (ajusté sur mobile pour une taille harmonieuse) */}
            <div className="mb-6 sm:mb-8 drop-shadow-[0_4px_16px_rgba(30,138,233,0.3)] transition-transform hover:scale-105 duration-300">
              <div className="relative w-36 sm:w-56 h-9 sm:h-14">
                <Image
                  src="/Logo/PNG/Asset 20.png"
                  alt="Netacuv Logo"
                  fill
                  className="object-contain"
                  priority
                  sizes="(max-width: 640px) 144px, 224px"
                />
              </div>
            </div>

            {/* Maintenance Card Modal (Cadre en bleu nuit dégradé avec bordure stylisée et marges latérales nettes) */}
            <div className="animated-gradient-stroke shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_35px_rgba(50,168,215,0.2)] w-full transition-all duration-300">
              <div className="relative z-10 bg-gradient-to-b from-[#0e2747] via-[#091b32] to-[#051323] p-6 sm:p-10 rounded-[14px] w-full border border-sky-400/20 backdrop-blur-xl">
                <h1 className="text-xl sm:text-3xl font-extrabold text-white mb-3 sm:mb-4 tracking-tight">
                  Site en maintenance
                </h1>
                <p className="text-slate-300 mb-5 sm:mb-6 leading-relaxed text-xs sm:text-base font-normal max-w-md mx-auto">
                  Nous effectuons actuellement une mise à jour de notre plateforme pour améliorer votre expérience. 
                  Veuillez patienter, nous serons de retour très bientôt !
                </p>
                <div className="w-16 sm:w-20 h-1 sm:h-1.5 bg-gradient-to-r from-[#32A8D7] via-[#1e8ae9] to-[#0071a2] mx-auto rounded-full animate-pulse shadow-[0_0_12px_rgba(50,168,215,0.6)]"></div>
              </div>
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang={locale} className={openSans.className}>
      <body>
        <NextTopLoader color="#f97316" showSpinner={false} />
        <VisitorTracker />
        <NextIntlClientProvider messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
