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
import { prisma } from "@/lib/prisma";
import Providers from "./components/Providers";
import NextTopLoader from 'nextjs-toploader';
import Image from "next/image";
import VisitorTracker from "./components/VisitorTracker";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  // Check Maintenance Mode (safe fallback if table not yet migrated)
  let isMaintenance = false;
  try {
    const maintenanceSetting = await prisma.systemSetting.findUnique({
      where: { key: "MAINTENANCE_MODE" },
    });
    isMaintenance = maintenanceSetting?.value === "true";
  } catch {
    // Table may not exist yet in production — ignore and continue
    isMaintenance = false;
  }

  const headersList = await headers();
  const host = headersList.get("host") || "";
  const isAdminSubdomain = host.startsWith("admin.");

  if (isMaintenance && !isAdminSubdomain) {
    return (
      <html lang={locale}>
        <head>
          <title>Site en maintenance - Netacuv</title>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700;800&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="flex flex-col items-center justify-center min-h-screen bg-slate-50 font-sans p-4 text-center">
          <div className="mb-8">
            <Image src="/Logo/PNG/Logo.png" alt="Netacuv Logo" width={200} height={50} className="object-contain" />
          </div>
          <div className="bg-white p-10 rounded-2xl shadow-xl max-w-lg w-full border border-slate-100">
            <h1 className="text-2xl font-bold text-slate-800 mb-4">Site en maintenance</h1>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Nous effectuons actuellement une mise à jour de notre plateforme pour améliorer votre expérience. 
              Veuillez patienter, nous serons de retour très bientôt !
            </p>
            <div className="w-16 h-1 bg-blue-600 mx-auto rounded-full animate-pulse"></div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
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
