"use client";

import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export type UserRole = "talent" | "recruteur" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  company?: string;
  isPremium?: boolean;
}

// Fonction utilitaire pour migrer en douceur toutes les utilisations de useAuth
export function useAuth() {
  const router = useRouter();
  const { data: session, status, update } = useSession();

  const rawRole = (session?.user as any)?.role?.toString()?.toUpperCase() || "";
  const normalizedRole: UserRole = 
    ["SUPER ADMIN", "ADMIN", "ADMINISTRATEUR", "ADMIN RH / MODÉRATEUR", "MANAGER IA & CERTIFICATION", "GESTIONNAIRE FINANCIER", "SUPPORT CLIENT"].includes(rawRole)
      ? "admin"
      : ["RECRUTEUR", "RECRUITER"].includes(rawRole)
      ? "recruteur"
      : "talent";

  const user = session?.user
    ? {
        id: (session.user as any).id || "",
        name: session.user.name || "",
        email: session.user.email || "",
        role: normalizedRole,
        avatar: session.user.image || "/assets/avatar_africain.jpg",
        isPremium: (session.user as any).isPremium || false,
      }
    : null;

  const logout = () => {
    if (typeof window !== "undefined") {
      // Clear all cached states in localStorage
      localStorage.removeItem("check_cv_name");
      localStorage.removeItem("check_cv_date");
      localStorage.removeItem("check_cv_has_pdf");
      localStorage.removeItem("confetti_shown");
      if (user?.id) {
        localStorage.removeItem(`interview_recorded_${user.id}`);
      }
      
      const isAdminHost = window.location.hostname.startsWith("admin.");
      const isAdminPath = window.location.pathname.startsWith("/dashboard/admin") || window.location.pathname.startsWith("/admin");
      const isAdminUser = user?.role === "admin";
      const isAdmin = isAdminHost || isAdminPath || isAdminUser;

      const callbackUrl = isAdmin
        ? `${window.location.protocol}//${window.location.host}/admin`
        : `${window.location.protocol}//${window.location.host}/connexion`;
      signOut({ callbackUrl });
    } else {
      signOut({ callbackUrl: "/connexion" });
    }
  };

  // Si le compte a été supprimé en base, la callback session retourne {} ou error: "DeletedAccount"
  // Donc session.user sera undefined, même si le token JWT (cookie) est techniquement encore valide.
  // Dans ce cas précis, on force la déconnexion côté client pour nettoyer le cookie stale.
  useEffect(() => {
    const isDeletedAccount = status === "authenticated" && (!session?.user || (session as any)?.error === "DeletedAccount");
    if (isDeletedAccount) {
      logout();
      return;
    }

    // Si l'utilisateur n'est pas connecté et se trouve sur une page protégée du dashboard (/dashboard/*)
    // Note: on n'intervient JAMAIS sur les pages publiques d'authentification (/admin, /connexion, etc.)
    if (status === "unauthenticated") {
      const pathname = typeof window !== "undefined" ? window.location.pathname : "";
      if (pathname.startsWith("/dashboard")) {
        const isAdminHost = typeof window !== "undefined" && window.location.hostname.startsWith("admin.");
        const isAdminDashboard = pathname.startsWith("/dashboard/admin");
        const targetLogin = (isAdminHost || isAdminDashboard) ? "/admin" : "/connexion";
        router.push(targetLogin);
      }
    }
  }, [status, session, router]);

  return {
    user,
    loading: status === "loading",
    logout,
    // Méthodes de compatibilité (non utilisées maintenant que /api/register gère ça)
    login: async () => false,
    loginWithGoogle: async (role?: string, data?: any) => false,
    register: async () => false,
    updateUser: update,
  };
}

// Dummy provider pour éviter les erreurs d'import s'il reste des références
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
