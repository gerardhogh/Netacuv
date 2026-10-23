import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { cookies } from "next/headers";
import { checkLoginRateLimit, recordFailedLogin, resetLoginRateLimit } from "@/lib/loginRateLimit";

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
    maxAge: 4 * 60 * 60,   // 4 heures
    updateAge: 60,          // Rafraîchit le token toutes les 60s → isPremium toujours à jour
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
        
        const email = credentials.email.trim().toLowerCase();

        // Vérification de la limitation de tentatives (Rate Limit)
        const rateCheck = checkLoginRateLimit(email);
        if (!rateCheck.allowed) {
          const mins = Math.ceil((rateCheck.remainingSeconds || 60) / 60);
          throw new Error(`Trop de tentatives infructueuses. Par mesure de sécurité, veuillez patienter ${mins} minute(s) avant de réessayer.`);
        }

        const user = await prisma.user.findUnique({
          where: { email: email },
          include: { role: true },
        });

        if (!user) {
          throw new Error("Aucun compte n'est associé à cette adresse email. Vérifiez l'orthographe ou créez un compte.");
        }

        if (!user.passwordHash) {
          throw new Error("Ce compte a été créé via Google. Veuillez vous connecter en cliquant sur 'Continuer avec Google'.");
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isValid) {
          const failResult = recordFailedLogin(email);
          if (failResult.locked) {
            throw new Error("Trop de tentatives infructueuses (5/5). Votre accès est temporairement bloqué pendant 5 minutes.");
          }
          throw new Error(`Mot de passe incorrect. (${failResult.remainingAttempts} tentative(s) restante(s))`);
        }

        // Connexion réussie : réinitialisation du compteur et mise à jour de l'activité (conservation des données)
        resetLoginRateLimit(email);

        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { updatedAt: new Date() },
          });
        } catch (e) {}

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
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === "google") {
          let authAction = "login";
          try {
            const cookieStore = await cookies();
            authAction = cookieStore.get("netacuv_auth_action")?.value || "login";
          } catch(e) {}
          
          if (user.email) {
            const existingUser = await prisma.user.findUnique({
              where: { email: user.email }
            });

            // If they try to "login" but account doesn't exist, block it.
            if (authAction === "login" && !existingUser) {
              return "/connexion?error=Ce+compte+n'existe+pas.+Veuillez+vous+inscrire.";
            }

            if (existingUser) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: { updatedAt: new Date() },
              });
            }
          }
        } else if (user?.email) {
          try {
            await prisma.user.updateMany({
              where: { email: user.email },
              data: { updatedAt: new Date() },
            });
          } catch (e) {}
        }
        return true;
      } catch (err) {
        console.error("Erreur dans le callback signIn:", err);
        return true;
      }
    },
    async jwt({ token, user, trigger, session }) {
      try {
        // Si une mise à jour manuelle de la session est déclenchée (update())
        if (trigger === "update") {
          if (session?.isPremium !== undefined) token.isPremium = session.isPremium;
          if (session?.user?.image !== undefined) {
             if (typeof session.user.image === 'string' && session.user.image.startsWith('data:image')) {
               token.picture = `/api/users/${token.sub}/avatar?v=${Date.now()}`;
             } else {
               token.picture = session.user.image;
             }
          }
          if (session?.user?.name !== undefined) token.name = session.user.name;
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
            token.role = dbUser.role?.name || "TALENT";
          } else if (user) {
            // Première connexion (user présent) : lire les cookies pour attribuer le bon rôle
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
                  isSystem: true,
                },
              });
            }
            try {
              await prisma.user.update({
                where: { id: token.sub },
                data: { 
                  roleId: role.id,
                  talentProfile: expectedRoleName === "TALENT" ? { upsert: { create: {}, update: {} } } : undefined,
                  recruiterProfile: expectedRoleName === "RECRUTEUR" ? { upsert: { create: {}, update: {} } } : undefined,
                }
              });
            } catch (updateError) {
              console.error("Failed to update user or create profile in JWT callback:", updateError);
            }
            token.role = expectedRoleName;
          } else {
            token.role = "TALENT";
          }

          token.isPremium = dbUser.isPremium || false;
          
          if (dbUser.image && !dbUser.image.startsWith('data:image')) {
            token.picture = dbUser.image;
          } else if (dbUser.image && dbUser.image.startsWith('data:image')) {
            if (token.picture && typeof token.picture === 'string' && token.picture.startsWith(`/api/users/${dbUser.id}/avatar`)) {
              token.picture = token.picture;
            } else {
              token.picture = `/api/users/${dbUser.id}/avatar?v=${Date.now()}`; 
            }
          } else {
            token.picture = token.picture;
          }
          
          token.name = dbUser.name || token.name;
        } else if (user) {
          token.role = (user as any).role || "TALENT";
          token.isPremium = (user as any).isPremium || false;
        }
        return token;
      } catch (jwtErr) {
        console.error("Erreur dans jwt callback:", jwtErr);
        return token;
      }
    },
    async session({ session, token }) {
      if ((token as any).error === "DeletedAccount" || (token as any).error === "AccessDenied") {
        return {} as any; // Cela force la déconnexion en vidant la session
      }
      
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role || "TALENT";
        (session.user as any).isPremium = token.isPremium || false;
        if (token.picture) {
          session.user.image = token.picture;
        }
        if (token.name) {
          session.user.name = token.name;
        }
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