"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import {
  Menu, Bell, ChevronDown, X, LogOut, Globe,
  Home, Users, Briefcase, Settings, History, Shield, AlertTriangle, Gift
} from "lucide-react";
import LogoutButton from "../../../components/LogoutButton";
import { useTranslations, useLocale } from "next-intl";
import LanguageSwitcher, { LOCALES, Locale } from "@/app/components/LanguageSwitcher";
import MaintenanceToggle from "./MaintenanceToggle";

const getSidebarItems = (role: string = "") => {
  const upperRole = role.toUpperCase();
  const isSuperAdmin = upperRole === "SUPER ADMIN" || upperRole === "ADMIN";

  return [
    { href: "/dashboard/admin", icon: Home, label: "Tableau de bord", matchExact: true, show: true },
    { href: "/dashboard/admin/talents", icon: Users, label: "Talents", show: isSuperAdmin || upperRole.includes("RH") || upperRole.includes("SUPPORT") },
    { href: "/dashboard/admin/recruteurs", icon: Briefcase, label: "Recruteurs", show: isSuperAdmin || upperRole.includes("RH") || upperRole.includes("SUPPORT") },
    { href: "/dashboard/admin/emplois", icon: Briefcase, label: "Offres d'emploi", show: isSuperAdmin || upperRole.includes("RH") },
    { href: "/dashboard/admin/transactions", icon: History, label: "Transactions", show: isSuperAdmin || upperRole.includes("FINANCIER") },
    { href: "/dashboard/admin/affiliation", icon: Gift, label: "Gestion de l'affiliation", show: isSuperAdmin || upperRole.includes("FINANCIER") },
    { href: "/dashboard/admin/permissions", icon: Shield, label: "Permissions & Rôles", show: isSuperAdmin },
    { href: "/dashboard/admin/trafic", icon: Globe, label: "Trafic & Visites", show: isSuperAdmin },
    { href: "/dashboard/admin/parametres", icon: Settings, label: "Paramètres", show: isSuperAdmin },
    { href: "/dashboard/admin/suppressions", icon: AlertTriangle, label: "Suppression de compte", show: isSuperAdmin || upperRole.includes("RH") || upperRole.includes("SUPPORT") },
  ].filter(item => item.show);
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();

  return (
    <div className="flex min-h-screen" style={{ background: "#edeeef" }}>
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-[50] md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 z-[60]
          w-64 h-screen overflow-hidden bg-white border-r border-slate-200
          flex flex-col justify-between transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
            <Link href="/" className="block">
              <div className="relative h-7 w-28">
                <Image
                  src="/Logo/PNG/Logo.png"
                  alt="Netacuv Logo"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400">
              <X size={18} />
            </button>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {getSidebarItems(user?.role).map(({ href, icon: Icon, label, matchExact }) => {
              const active = matchExact ? pathname === href : pathname.startsWith(href);
              return (
                <Link key={href} href={href} className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${active ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "text-slate-600 hover:bg-[#F97316] hover:text-white"}`}>
                  <Icon size={18} /> {label}
                </Link>
              );
            })}
            
            <div className="mt-4 pt-4 border-t border-slate-100 px-2">
              <LanguageSwitcher />
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 px-2">
              <MaintenanceToggle />
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-[40] bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="text-slate-500 hover:text-slate-700 p-1 md:hidden" aria-label="Menu">
              <Menu size={22} />
            </button>
            <h1 className="text-xl font-normal text-slate-700">
              Dashboard <span className="font-extrabold text-slate-900">Admin</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button onClick={() => { setNotifMenuOpen(!notifMenuOpen); setProfileMenuOpen(false); }} className="relative text-slate-500 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors" aria-label="Notifications">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              {notifMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 z-30 animate-fade-in">
                  <div className="px-4 pb-2 border-b border-slate-100 mb-2">
                    <h3 className="font-bold text-slate-800">Notifications</h3>
                  </div>
                  <div className="px-4 py-2 hover:bg-slate-50 cursor-pointer">
                    <p className="text-sm font-semibold text-slate-800">Nouveau Talent inscrit</p>
                    <p className="text-xs text-slate-500">Un nouveau talent vient de s'inscrire sur la plateforme.</p>
                  </div>
                  <div className="px-4 py-2 hover:bg-slate-50 cursor-pointer">
                    <p className="text-sm font-semibold text-slate-800">Nouvelle Offre d'emploi</p>
                    <p className="text-xs text-slate-500">Grand-G Corp a publié une nouvelle offre.</p>
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => { setProfileMenuOpen(!profileMenuOpen); setNotifMenuOpen(false); }}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors"
              >
                <div className="w-9 h-9 rounded-full overflow-hidden relative border border-slate-200">
                  <Image
                    src={user?.avatar || "/assets/avatar_africain.jpg"}
                    alt="Avatar"
                    width={36}
                    height={36}
                    className="object-cover w-full h-full object-center"
                  />
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-30 animate-fade-in">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-800 truncate">{user?.name || "Admin"}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email || "admin@check.cv"}</p>
                  </div>
                  <Link href="/dashboard/admin/profil" className="block px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 font-medium">
                    Mon profil
                  </Link>
                  <Link href="/dashboard/admin/parametres" className="block px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 font-medium">
                    Paramètres
                  </Link>
                  <LogoutButton 
                    onCancelClick={() => setProfileMenuOpen(false)}
                    className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-semibold border-t border-slate-100 mt-1 flex items-center gap-2"
                  >
                    <LogOut size={14} /> Déconnexion
                  </LogoutButton>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-5 space-y-5">
          {children}
        </main>
      </div>
    </div>
  );
}
