import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import crypto from "crypto";

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
        if (dbUser) {
          token.role = dbUser.role?.name || "TALENT";
          token.isPremium = dbUser.isPremium || false;
        }
      } else if (user) {
        token.role = (user as any).role || "TALENT";
        token.isPremium = (user as any).isPremium || false;
      }
      return token;
    },
    async session({ session, token }) {
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
      // Permet expressément le localhost (pour le dev) et le domaine de prod
      if (url.startsWith("http://localhost:") || url.startsWith("https://netacuv.com") || url.startsWith("https://www.netacuv.com")) {
        return url;
      }
      return baseUrl;
    },
  },
  pages: {
    signIn: "/connexion",
  },
  debug: true,
};