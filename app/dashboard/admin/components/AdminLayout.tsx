"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import {
  Menu, Bell, ChevronDown, X, LogOut, Globe,
  Home, Users, Briefcase, Settings, History, Shield, AlertTriangle, Gift, Zap, Mail, Flag, Bookmark
} from "lucide-react";
import LogoutButton from "../../../components/LogoutButton";
import { useTranslations, useLocale } from "next-intl";
import LanguageSwitcher, { LOCALES, Locale } from "@/app/components/LanguageSwitcher";
import MaintenanceToggle from "./MaintenanceToggle";
import NotificationBell from "@/app/components/NotificationBell";

const getSidebarItems = (role: string = "", t: any) => {
  const upperRole = role.toUpperCase();
  const isSuperAdmin = upperRole === "SUPER ADMIN" || upperRole === "ADMIN";

  return [
    { href: "/dashboard/admin", icon: Home, label: t("admin.sidebar.dashboard"), matchExact: true, show: true },
    { href: "/dashboard/admin/talents", icon: Users, label: t("admin.sidebar.talents"), show: isSuperAdmin || upperRole.includes("RH") || upperRole.includes("SUPPORT") },
    { href: "/dashboard/admin/recruteurs", icon: Briefcase, label: t("admin.sidebar.recruiters"), show: isSuperAdmin || upperRole.includes("RH") || upperRole.includes("SUPPORT") },
    { href: "/dashboard/admin/emplois", icon: Briefcase, label: t("admin.sidebar.jobOffers"), show: isSuperAdmin || upperRole.includes("RH") },
    { href: "/dashboard/admin/favoris", icon: Bookmark, label: t("admin.sidebar.favorites"), show: true },
    { href: "/dashboard/admin/signalements", icon: Flag, label: t("admin.sidebar.reports"), show: isSuperAdmin || upperRole.includes("RH") || upperRole.includes("SUPPORT") },
    { href: "/dashboard/admin/transactions", icon: History, label: t("admin.sidebar.transactions"), show: isSuperAdmin || upperRole.includes("FINANCIER") },
    { href: "/dashboard/admin/newsletter", icon: Mail, label: t("admin.sidebar.newsletter"), show: isSuperAdmin },
    { href: "/dashboard/admin/permissions", icon: Shield, label: t("admin.sidebar.permissions"), show: isSuperAdmin },
    { href: "/dashboard/admin/trafic", icon: Globe, label: t("admin.sidebar.traffic"), show: isSuperAdmin },
    { href: "/dashboard/admin/activation", icon: Zap, label: t("admin.sidebar.activation"), show: isSuperAdmin },
    { href: "/dashboard/admin/parametres", icon: Settings, label: t("admin.sidebar.settings"), show: isSuperAdmin },
    { href: "/dashboard/admin/suppressions", icon: AlertTriangle, label: t("admin.sidebar.deletions"), show: isSuperAdmin || upperRole.includes("RH") || upperRole.includes("SUPPORT") },
  ].filter(item => item.show);
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [adminProfile, setAdminProfile] = useState<{
    name: string;
    email: string;
    avatar: string;
  } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();

  // Load fresh profile from API to ensure instant updates without waiting for NextAuth cookie refresh
  useEffect(() => {
    let isMounted = true;
    const fetchAdminProfile = async () => {
      try {
        const res = await fetch(`/api/admin/me?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setAdminProfile({
              name: data.name || "",
              email: data.email || "",
              avatar: data.avatar || ""
            });
          }
        }
      } catch (e) {
        console.error("Failed to load admin profile in navbar", e);
      }
    };

    fetchAdminProfile();

    const handleProfileUpdate = () => {
      fetchAdminProfile();
    };

    window.addEventListener("admin_profile_updated", handleProfileUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener("admin_profile_updated", handleProfileUpdate);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    if (profileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileMenuOpen]);

  return (
    <div className="flex min-h-screen bg-[#fafbfc] text-slate-800">
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
              <div className="relative h-7 w-28 flex items-center">
                <img
                  src="/Logo/PNG/Logo.png"
                  alt="Netacuv Logo"
                  className="h-7 w-auto object-contain object-left"
                />
              </div>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400">
              <X size={18} />
            </button>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {getSidebarItems(user?.role, t).map(({ href, icon: Icon, label, matchExact }) => {
              const active = matchExact ? pathname === href : pathname.startsWith(href);
              return (
                <Link key={href} href={href} className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${active ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "text-slate-600 hover:bg-[#F97316] hover:text-white"}`}>
                  <Icon size={18} /> {label}
                </Link>
              );
            })}
            
            {/* Mobile drawer uniquement : nom du pays à côté du drapeau */}
            <div className="mt-4 pt-4 border-t border-slate-100 px-2 md:hidden">
              <LanguageSwitcher variant="mobile" showLabel={true} onSelect={() => setSidebarOpen(false)} />
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
              {t("admin.dashboard")} <span className="font-extrabold text-slate-900">{t("admin.admin")}</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Desktop Language Switcher (Drapeau + flèche uniquement) */}
            <div className="hidden md:flex items-center">
              <LanguageSwitcher variant="desktop" showLabel={false} align="right" />
            </div>

            {/* Notification Bell temps réel */}
            <NotificationBell align="right" />
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => { setProfileMenuOpen(!profileMenuOpen); setNotifMenuOpen(false); }}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors"
                title={t("admin.menuAdmin")}
              >
                <div className="w-9 h-9 rounded-full overflow-hidden relative border border-slate-200 bg-slate-100 flex items-center justify-center">
                  <img
                    src={adminProfile?.avatar || user?.avatar || "/assets/avatar_africain.jpg"}
                    alt="Avatar"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/assets/avatar_africain.jpg";
                    }}
                    className="object-cover w-full h-full object-center"
                  />
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-30 animate-fade-in">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {adminProfile?.name || user?.name || "Admin"}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {adminProfile?.email || user?.email || "admin@netacuv.com"}
                    </p>
                  </div>
                  <Link
                    href="/dashboard/admin/profil"
                    onClick={() => setProfileMenuOpen(false)}
                    className="block px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 font-medium"
                  >
                    {t("admin.myProfile")}
                  </Link>
                  <Link
                    href="/dashboard/admin/parametres"
                    onClick={() => setProfileMenuOpen(false)}
                    className="block px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 font-medium"
                  >
                    {t("admin.settings")}
                  </Link>
                  <LogoutButton 
                    onCancelClick={() => setProfileMenuOpen(false)}
                    className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-semibold border-t border-slate-100 mt-1 flex items-center gap-2"
                  >
                    <LogOut size={14} /> {t("admin.logout")}
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
