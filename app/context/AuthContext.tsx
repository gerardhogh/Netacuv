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
  const { data: session, status, update } = useSession();

  const user = session?.user
    ? {
        id: (session.user as any).id || "",
        name: session.user.name || "",
        email: session.user.email || "",
        role: ((session.user as any).role as UserRole) || "talent",
        avatar: session.user.image || "/assets/avatar_africain.jpg",
        isPremium: (session.user as any).isPremium || false,
      }
    : null;

  const logout = () => {
    if (typeof window !== "undefined") {
      const isAdmin = window.location.hostname.startsWith("admin.");
      const callbackUrl = isAdmin
        ? `${window.location.protocol}//${window.location.host}/admin`
        : `${window.location.protocol}//${window.location.host}/connexion`;
      signOut({ callbackUrl });
    } else {
      signOut({ callbackUrl: "/connexion" });
    }
  };

  // Si le compte a été supprimé en base, la callback session retourne {}
  // Donc session.user sera undefined, même si le token JWT (cookie) est techniquement encore valide.
  // Dans ce cas, on force la déconnexion côté client pour nettoyer le cookie stale.
  useEffect(() => {
    if (status === "unauthenticated" || (status === "authenticated" && !session?.user)) {
      const pathname = window.location.pathname;
      if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
        logout();
      }
    }

  }, [status, session]);

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
