import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Basic in-memory rate limiting (Note: resets on serverless cold starts)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30; // 30 reqs / min

export async function middleware(req: NextRequest) {
  // Use getToken directly. It automatically handles secure cookies on production/HTTPS.
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const hostname = req.headers.get("host") || "";
  const path = req.nextUrl.pathname;
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

  // -- 1. RATE LIMITING (Point 11) --
  if (path.startsWith("/api/")) {
    const now = Date.now();
    const rateLimitData = rateLimitMap.get(ip) || { count: 0, lastReset: now };

    if (now - rateLimitData.lastReset > RATE_LIMIT_WINDOW_MS) {
      rateLimitData.count = 1;
      rateLimitData.lastReset = now;
    } else {
      rateLimitData.count += 1;
    }
    
    rateLimitMap.set(ip, rateLimitData);

    if (rateLimitData.count > MAX_REQUESTS_PER_WINDOW) {
      return new NextResponse(
        JSON.stringify({ error: "Too many requests, please try again later." }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // 2. MULTI-SUBDOMAIN ROUTING & RBAC
  const currentHost = req.headers.get("host") || "";
  let subdomain = "";
  if (currentHost.startsWith("talent.")) subdomain = "talent";
  else if (currentHost.startsWith("recruteur.")) subdomain = "recruteur";
  else if (currentHost.startsWith("admin.")) subdomain = "admin";

  const isLocalhost = currentHost.includes("localhost");
  const baseDomain = isLocalhost ? currentHost.replace(/^(talent\.|recruteur\.|admin\.)/, "") : "netacuv.com";
  const protocol = isLocalhost ? "http" : "https";

  const getSubdomainUrl = (sub: string) => `${protocol}://${sub}.${baseDomain}`;

  const isApiRoute = path.startsWith("/api");
  const isAuthRoute = path === "/connexion" || path === "/inscription";
  const isPublicRoute = isApiRoute || isAuthRoute || path.startsWith("/_next") || path.startsWith("/assets");

  // Redirection post-login ou page d'accueil
  if (!isPublicRoute && (path === "/" || path === "/dashboard")) {
    if (!token) {
      // Rediriger l'accueil du sous-domaine vers la connexion si non connecté
      if (subdomain) {
        return NextResponse.redirect(new URL("/connexion", req.url));
      }
      return NextResponse.next();
    }
    
    const role = (token.role as string)?.toUpperCase();
    
    // Si connecté, rediriger vers le bon sous-domaine selon le rôle
    if (role === "ADMIN") {
      if (subdomain !== "admin") return NextResponse.redirect(new URL(getSubdomainUrl("admin"), req.url));
      return NextResponse.rewrite(new URL("/dashboard/admin", req.url));
    } else if (role === "RECRUTEUR" || role === "RECRUITER") {
      if (subdomain !== "recruteur") return NextResponse.redirect(new URL(getSubdomainUrl("recruteur"), req.url));
      return NextResponse.rewrite(new URL("/dashboard/recruteur", req.url));
    } else {
      if (subdomain !== "talent") return NextResponse.redirect(new URL(getSubdomainUrl("talent"), req.url));
      return NextResponse.rewrite(new URL("/dashboard/talent", req.url));
    }
  }

  // RBAC & Subdomain Enforcement (only for logged in users on non-public routes)
  if (token && !isPublicRoute) {
    const role = (token.role as string)?.toUpperCase();
    
    // Si un talent essaie d'accéder au sous-domaine recruteur ou admin
    if (role === "TALENT" && (subdomain === "recruteur" || subdomain === "admin")) {
      return NextResponse.redirect(new URL(getSubdomainUrl("talent"), req.url));
    }
    
    // Si un recruteur essaie d'accéder au sous-domaine talent ou admin
    if ((role === "RECRUTEUR" || role === "RECRUITER") && (subdomain === "talent" || subdomain === "admin")) {
      return NextResponse.redirect(new URL(getSubdomainUrl("recruteur"), req.url));
    }

    // L'Admin peut théoriquement tout voir, mais on le garde sur admin pour son dashboard
    if (role === "ADMIN" && (subdomain === "talent" || subdomain === "recruteur")) {
      if (path === "/" || path.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL(`${getSubdomainUrl("admin")}/dashboard/admin`, req.url));
      }
    }
  }

  // Redirection des routes classiques /dashboard/... vers les sous-domaines
  if (path.startsWith("/dashboard/talent") && subdomain !== "talent") {
    return NextResponse.redirect(new URL(`${getSubdomainUrl("talent")}${path.replace("/dashboard/talent", "")}`, req.url));
  }
  if (path.startsWith("/dashboard/recruteur") && subdomain !== "recruteur") {
    return NextResponse.redirect(new URL(`${getSubdomainUrl("recruteur")}${path.replace("/dashboard/recruteur", "")}`, req.url));
  }
  if (path.startsWith("/dashboard/admin") && subdomain !== "admin") {
    return NextResponse.redirect(new URL(`${getSubdomainUrl("admin")}${path.replace("/dashboard/admin", "")}`, req.url));
  }

  // REWRITES : Masquer le dossier /dashboard/... dans l'URL pour les sous-domaines
  if (subdomain === "talent" && !isPublicRoute && !path.startsWith("/dashboard")) {
    return NextResponse.rewrite(new URL(`/dashboard/talent${path === "/" ? "" : path}`, req.url));
  }
  if (subdomain === "recruteur" && !isPublicRoute && !path.startsWith("/dashboard")) {
    return NextResponse.rewrite(new URL(`/dashboard/recruteur${path === "/" ? "" : path}`, req.url));
  }
  if (subdomain === "admin" && !isPublicRoute && !path.startsWith("/dashboard")) {
    return NextResponse.rewrite(new URL(`/dashboard/admin${path === "/" ? "" : path}`, req.url));
  }

  // Si on est sur une route protégée sans token
  const isProtectedRoute = path.startsWith("/dashboard") || (subdomain && !isPublicRoute);
  if (isProtectedRoute && !token) {
    const url = new URL("/connexion", req.url);
    url.searchParams.set("callbackUrl", encodeURI(req.url));
    return NextResponse.redirect(url);
  }

  // Rediriger les utilisateurs connectés qui tentent d'accéder aux pages d'auth
  const isAccountDeleted = req.nextUrl.searchParams.get("account_deleted") === "true";
  if (token && !isAccountDeleted && isAuthRoute) {
    const role = (token.role as string)?.toUpperCase();
    if (role === "ADMIN") return NextResponse.redirect(new URL(getSubdomainUrl("admin"), req.url));
    if (role === "RECRUTEUR" || role === "RECRUITER") return NextResponse.redirect(new URL(getSubdomainUrl("recruteur"), req.url));
    return NextResponse.redirect(new URL(getSubdomainUrl("talent"), req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, assets, Logo
     * 
     * API routes ARE included so rate-limiting runs.
     */
    "/((?!_next/static|_next/image|favicon.ico|assets|Logo|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};