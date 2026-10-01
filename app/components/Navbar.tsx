"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import LogoutButton from "./LogoutButton";
import {
  Menu,
  X,
  Users,
  Briefcase,
  HelpCircle,
  Home,
  Star,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

export default function Navbar({
  variant = "default",
}: {
  variant?: "default" | "transparent" | "auth";
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  const getDashboardHref = () => {
    if (!user) return "/dashboard/talent";
    if (user.role === "admin") return "/dashboard/admin";
    if (user.role === "recruteur") return "/dashboard/recruteur";
    return "/dashboard/talent";
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        variant === "transparent" || variant === "auth"
          ? "max-w-[1200px] w-[95%] mx-auto mt-6 rounded-full border shadow-sm"
          : ""
      } ${
        variant === "auth" ? "border-white/10" : variant === "transparent" ? "border-white/40" : ""
      }`}
      style={
        variant === "auth"
          ? {
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(16px)",
            }
          : variant === "transparent"
          ? {
              background: "rgba(255,255,255,0.6)",
              backdropFilter: "blur(16px)",
            }
          : {
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(16px)",
              borderBottom: "1px solid rgba(226,232,240,0.8)",
            }
      }
    >
      <nav className={`mx-auto px-6 flex items-center justify-between ${(variant === "transparent" || variant === "auth") ? "h-16" : "max-w-7xl h-20"}`}>
        {/* Logo with official Figma asset */}
        <Link href="/" className="flex items-center gap-2 group transition-opacity hover:opacity-90">
          <div className="relative h-8 w-28 sm:w-36 flex items-center">
            <Image
              src={variant === "auth" ? "/Logo/PNG/Asset 20.png" : "/Logo/PNG/Logo.png"}
              alt="Netacuv Logo"
              fill
              priority
              className="object-contain object-left"
            />
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1.5">
          {[
            { href: "/", label: "Accueil", icon: Home },
            { href: "/#pourquoi", label: "Pourquoi ?", icon: Star },
            { href: "/#comment", label: "Comment ça marche ?", icon: HelpCircle },
            { href: "/talents", label: "Talents", icon: Users },
            { href: "/recruteurs", label: "Recruteurs", icon: Briefcase },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                variant === "auth" 
                  ? "text-blue-100 hover:text-white hover:bg-white/10" 
                  : "text-slate-600 hover:text-blue-600 hover:bg-blue-50/60"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* CTA / Auth Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href={getDashboardHref()}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:border-blue-500 hover:bg-blue-50/30 transition-all shadow-sm group"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden relative border border-slate-200">
                  <Image
                    src={user.avatar || "/assets/avatar_africain.jpg"}
                    alt={user.name}
                    width={32}
                    height={32}
                    className="object-cover w-full h-full object-center"
                  />
                </div>
                <div className="text-left pr-1">
                  <p className="text-xs font-bold text-slate-800 group-hover:text-blue-600 leading-tight">
                    {user.name.split(" ")[0]}
                  </p>
                  <p className="text-[10px] text-slate-400 capitalize leading-tight">
                    {user.role}
                  </p>
                </div>
              </Link>

              <Link
                href={getDashboardHref()}
                className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5"
              >
                <LayoutDashboard size={14} />
                Dashboard
              </Link>

              <button
                onClick={logout}
                title="Se déconnecter"
                className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/connexion"
                className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all ${
                  variant === "auth" 
                    ? "text-white border-white/30 hover:bg-white/10"
                    : "text-blue-600 border-blue-500 hover:bg-blue-50/50"
                }`}
              >
                Connexion
              </Link>
              <Link
                href="/inscription"
                className={`text-sm py-2 px-5 !rounded-full transition-all shadow-sm ${
                  variant === "auth"
                    ? "bg-[#32A8D7] text-white hover:bg-[#2891bb]"
                    : "btn-primary"
                }`}
              >
                S'inscrire
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className={`md:hidden p-2 rounded-lg transition-colors ${
            variant === "auth" ? "text-white hover:bg-white/10" : "text-slate-600 hover:bg-slate-100"
          }`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div 
          className={`md:hidden absolute top-[110%] left-0 right-0 px-4 py-4 flex flex-col gap-1 animate-fade-in shadow-2xl rounded-2xl ${
            variant === "auth"
              ? "bg-[#0A192F]/95 backdrop-blur-3xl border border-white/20"
              : "bg-white border border-slate-100"
          }`}
        >
          {[
            { href: "/", label: "Accueil" },
            { href: "/#pourquoi", label: "Pourquoi ?" },
            { href: "/#comment", label: "Comment ça marche ?" },
            { href: "/talents", label: "Talents" },
            { href: "/recruteurs", label: "Recruteurs" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                variant === "auth"
                  ? "text-blue-100 hover:bg-white/10 hover:text-white"
                  : "text-slate-600 hover:bg-blue-50/60 hover:text-blue-600"
              }`}
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </Link>
          ))}

          <div className={`flex gap-3 mt-3 pt-3 border-t ${variant === "auth" ? "border-white/10" : "border-slate-100"}`}>
            {user ? (
              <div className="w-full flex items-center justify-between gap-2">
                <Link
                  href={getDashboardHref()}
                  onClick={() => setMobileOpen(false)}
                  className={`flex-1 justify-center py-2 text-center rounded-full text-sm font-bold shadow-sm transition-all ${
                    variant === "auth"
                      ? "bg-[#32A8D7] text-white hover:bg-[#2891bb]"
                      : "btn-primary"
                  }`}
                >
                  Mon Espace ({user.role})
                </Link>
                <LogoutButton
                  onClick={() => setMobileOpen(false)}
                  className="p-2.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
                  title="Déconnexion"
                >
                  <LogOut size={18} />
                </LogoutButton>
              </div>
            ) : (
              <>
                <Link
                  href="/connexion"
                  onClick={() => setMobileOpen(false)}
                  className={`flex-1 flex justify-center items-center text-center text-sm h-[42px] !rounded-full transition-all ${
                    variant === "auth"
                      ? "font-semibold border text-white border-white/30 hover:bg-white/10"
                      : "btn-outline"
                  }`}
                >
                  Connexion
                </Link>
                <Link
                  href="/inscription"
                  onClick={() => setMobileOpen(false)}
                  className={`flex-1 flex justify-center items-center text-center text-sm h-[42px] !rounded-full transition-all shadow-sm ${
                    variant === "auth"
                      ? "font-semibold bg-[#32A8D7] text-white hover:bg-[#2891bb]"
                      : "btn-primary"
                  }`}
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
