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

import Providers from "./components/Providers";
import { LangProvider } from "./context/LangContext";
import NextTopLoader from 'nextjs-toploader';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // lang is kept as "fr" initially; LangContext updates it client-side via document.documentElement.lang
    <html lang="fr">
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
        <LangProvider>
          <Providers>{children}</Providers>
        </LangProvider>
      </body>
    </html>
  );
}
