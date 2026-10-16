"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import NewsletterForm from "@/components/NewsletterForm";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer
      style={{
        background: "linear-gradient(180deg, #0076a8 0%, #005a82 100%)",
        color: "white",
      }}
      className="pt-16 pb-8 w-full overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/15">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <div className="relative h-8 w-36">
                <Image
                  src="/Logo/PNG/Logo%20white.png"
                  alt="Netacuv Logo"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </Link>
            <p className="text-blue-100/80 text-sm leading-relaxed mb-6">
              {t("tagline")}
            </p>
            <div className="flex gap-3">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:opacity-90 relative overflow-hidden bg-white/10"
              >
                <Image
                  src="/assets/Linkedin.png"
                  alt="LinkedIn"
                  width={22}
                  height={22}
                  className="object-contain"
                />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:opacity-90 relative overflow-hidden bg-white/10"
              >
                <Image
                  src="/assets/Facebook.png"
                  alt="Facebook"
                  width={22}
                  height={22}
                  className="object-contain"
                />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:opacity-90 relative overflow-hidden bg-white/10"
              >
                <Image
                  src="/assets/Twitter.png"
                  alt="Twitter"
                  width={22}
                  height={22}
                  className="object-contain"
                />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm tracking-wide">
              {t("navTitle")}
            </h4>
            <ul className="space-y-3">
              {[
                { href: "/", label: t("whyNetacuv") === "Why Netacuv?" ? "Home" : "Accueil" },
                { href: "/#pourquoi", label: t("whyNetacuv") },
                { href: "/#comment", label: t("howItWorks") },
                { href: "/talents", label: t("forTalents") },
                { href: "/recruteurs", label: t("forRecruiters") },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-blue-100/70 hover:text-white text-sm transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm tracking-wide">
              {t("supportTitle")}
            </h4>
            <ul className="space-y-3">
              {[
                { href: "/a-propos", label: t("about") },
                { href: "/faq", label: t("faq") },
                { href: "/support", label: t("support") },
                { href: "/contact", label: t("contact") },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-blue-100/70 hover:text-white text-sm transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter / S'abonner */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm tracking-wide">
              {t("subscribeTitle")}
            </h4>
            <p className="text-blue-100/70 text-sm mb-4">
              {t("subscribeDesc")}
            </p>
            <NewsletterForm />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 text-xs text-blue-100/70 w-full">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 sm:gap-x-4 gap-y-2 text-center">
            <Link href="/terms" className="hover:text-white transition-colors">
              {t("terms")}
            </Link>
            <span className="text-blue-200/40 select-none">•</span>
            <Link href="/privacy" className="hover:text-white transition-colors">
              {t("privacy")}
            </Link>
            <span className="text-blue-200/40 select-none">•</span>
            <Link href="/cookies" className="hover:text-white transition-colors">
              {t("cookies")}
            </Link>
          </div>
          <p className="text-center md:text-right">
            © 2025 <span className="text-white font-semibold">Netacuv</span>. {t("allRightsReserved")}
          </p>
        </div>
      </div>
    </footer>
  );
}
