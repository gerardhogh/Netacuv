import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { cookies } from "next/headers";

// Extension des types TypeScript de NextAuth pour inclure 'id' et 'role'
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isPremium?: boolean;
    };
  }
  interface User {
    id?: string;
    role?: string;
    isPremium?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    isPremium?: boolean;
  }
}

// Sécurité : Bloquer le démarrage si le secret est absent
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("⚠️ La variable d'environnement NEXTAUTH_SECRET est manquante dans .env");
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: process.env.NODE_ENV === "production" ? ".netacuv.com" : undefined,
      },
    },
  },
  providers: [
    // Authentification Google
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),

    // Authentification classique (Email + Mot de passe)
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { role: true },
        });

        if (!user || !user.passwordHash) {
          throw new Error("Utilisateur non trouvé ou compte incorrect");
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isValid) {
          throw new Error("Mot de passe incorrect");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role?.name || "TALENT",
        };
      },
    }),

  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Si une mise à jour manuelle de la session est déclenchée (update())
      if (trigger === "update" && session?.isPremium !== undefined) {
        token.isPremium = session.isPremium;
      }

      if (token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          include: { role: true },
        });
        
        if (!dbUser) {
          // L'utilisateur n'existe plus en DB, on force la déconnexion
          return { ...token, error: "DeletedAccount" };
        }

        if (dbUser.roleId) {
          // L'utilisateur a déjà un rôle en base → on l'utilise directement.
          // La vérification du cookie d'intention n'est faite qu'à la première connexion (user défini ci-dessous).
          token.role = dbUser.role?.name || "TALENT";
        } else if (user) {
          // Première connexion (user présent) : lire le cookie pour attribuer le bon rôle
          let intendedRole = "talent";
          try {
            const cookieStore = await cookies();
            intendedRole = cookieStore.get("netacuv_intended_role")?.value || "talent";
          } catch(e) {}
          
          const expectedRoleName = intendedRole.toUpperCase();

          // Nouvel utilisateur sans rôle (via Google par exemple)
          let role = await prisma.role.findUnique({ where: { name: expectedRoleName } });
          if (!role) {
            role = await prisma.role.create({
              data: {
                name: expectedRoleName,
                description: `Rôle par défaut pour les ${expectedRoleName.toLowerCase()}s`,
                permissions: "{}",
              },
            });
          }
          await prisma.user.update({
            where: { id: token.sub },
            data: { 
              roleId: role.id,
              talentProfile: expectedRoleName === "TALENT" ? { create: {} } : undefined,
              recruiterProfile: expectedRoleName === "RECRUTEUR" ? { create: {} } : undefined,
            }
          });
          token.role = expectedRoleName;
        } else {
          // Utilisateur sans rôle et pas de première connexion (cas inhabituel)
          token.role = "TALENT";
        }

        token.isPremium = dbUser.isPremium || false;
      } else if (user) {
        token.role = (user as any).role || "TALENT";
        token.isPremium = (user as any).isPremium || false;
      }
      return token;
    },
    async session({ session, token }) {
      if ((token as any).error === "DeletedAccount" || (token as any).error === "AccessDenied") {
        return {} as any; // Cela force la déconnexion en vidant la session
      }
      
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role || "TALENT";
        (session.user as any).isPremium = token.isPremium || false;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Permet les URLs relatives
      if (url.startsWith("/")) return new URL(url, baseUrl).toString();
      // Permet les URLs sur le même domaine
      if (new URL(url).origin === baseUrl) return url;
      // Permet expressément le localhost (y compris les sous-domaines) et tous les sous-domaines de netacuv.com
      if (
        url.match(/^http:\/\/(.*)?localhost:/i) || 
        url.startsWith("https://netacuv.com") || 
        url.startsWith("https://www.netacuv.com") || 
        url.match(/^https:\/\/[a-z0-9-]+\.netacuv\.com/i)
      ) {
        return url;
      }
      return baseUrl;
    },
  },
  pages: {
    signIn: "/connexion",
  },
  debug: process.env.NODE_ENV === "development",
};