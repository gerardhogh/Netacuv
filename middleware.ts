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

  const path = req.nextUrl.pathname;
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

  // -- 1. RATE LIMITING --
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

  const currentHost = req.headers.get("host") || "";
  const isAdminSubdomain = currentHost.startsWith("admin.");
  const isLocalhost = currentHost.includes("localhost");
  const protocol = isLocalhost ? "http" : "https";
  const baseDomain = isLocalhost ? currentHost.replace(/^admin\./, "") : "netacuv.com";
  const adminUrl = `${protocol}://admin.${baseDomain}`;

  const isApiRoute = path.startsWith("/api");
  const isAuthRoute = path === "/connexion" || path === "/inscription";
  const isAdminLoginRoute = path === "/admin";
  const isPublicRoute = isApiRoute || isAuthRoute || path.startsWith("/_next") || path.startsWith("/assets") || isAdminLoginRoute;
  const isDashboardRoute = path.startsWith("/dashboard");

  // Si on est sur une route protégée sans token
  const isProtectedRoute = isDashboardRoute || (isAdminSubdomain && !isPublicRoute);
  if (isProtectedRoute && !token) {
    const loginPath = isAdminSubdomain ? "/admin" : "/connexion";
    const url = new URL(loginPath, req.url);
    url.searchParams.set("callbackUrl", encodeURI(req.url));
    return NextResponse.redirect(url);
  }

  // Comportement pour les utilisateurs connectés
  if (token) {
    const role = (token.role as string)?.toUpperCase();
    
    // Logique pour l'Administrateur
    if (role === "ADMIN") {
      // Forcer le sous-domaine admin
      if (!isAdminSubdomain) {
        return NextResponse.redirect(new URL(adminUrl, req.url));
      }
      
      // Empêcher l'accès aux dashboards talent/recruteur
      if (path.startsWith("/dashboard/talent") || path.startsWith("/dashboard/recruteur")) {
        return NextResponse.redirect(new URL(adminUrl, req.url));
      }

      // Si l'admin est déjà connecté et visite la page de connexion, le rediriger vers l'accueil (qui affiche le dashboard)
      if (path === "/admin") {
        return NextResponse.redirect(new URL(adminUrl, req.url));
      }
    } 
    // Logique pour les Utilisateurs Classiques (Talent / Recruteur)
    else {
      // Interdire l'accès au sous-domaine admin
      if (isAdminSubdomain) {
        return NextResponse.redirect(new URL(`${protocol}://${baseDomain}/dashboard`, req.url));
      }

      let defaultDashboardPath = "/dashboard/talent";
      if (role === "RECRUTEUR" || role === "RECRUITER") {
        defaultDashboardPath = "/dashboard/recruteur";
      }

      // Rediriger l'accueil ou les pages de connexion vers le dashboard par défaut
      const isAccountDeleted = req.nextUrl.searchParams.get("account_deleted") === "true";
      if (!isAccountDeleted && (path === "/" || path === "/dashboard" || isAuthRoute)) {
        return NextResponse.redirect(new URL(defaultDashboardPath, req.url));
      }

      // RBAC : Empêcher l'accès aux dashboards des autres rôles
      if (path.startsWith("/dashboard/talent") && role !== "TALENT") {
        return NextResponse.redirect(new URL(defaultDashboardPath, req.url));
      }
      if (path.startsWith("/dashboard/recruteur") && role !== "RECRUTEUR" && role !== "RECRUITER") {
        return NextResponse.redirect(new URL(defaultDashboardPath, req.url));
      }
    }
  }

  // REWRITE : Masquer /dashboard/admin dans l'URL pour le sous-domaine admin
  if (isAdminSubdomain && !isPublicRoute && !path.startsWith("/dashboard")) {
    return NextResponse.rewrite(new URL(`/dashboard/admin${path === "/" ? "" : path}`, req.url));
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