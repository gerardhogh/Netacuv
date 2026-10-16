import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Basic in-memory rate limiting (Note: resets on serverless cold starts)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 300; // 300 reqs / min

export const SUPPORTED_LOCALES = ["fr", "en"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

async function handleMiddleware(req: NextRequest) {
  const currentHost = req.headers.get("host") || "";
  const isAdminSubdomain = currentHost.startsWith("admin.");
  const isLocalhost = currentHost.includes("localhost") || currentHost.includes("127.0.0.1");
  const protocol = isLocalhost ? "http" : "https";
  const fullPath = req.nextUrl.pathname;

  // Détection du préfixe de langue dans l'URL (/fr/... ou /en/...)
  const localeMatch = fullPath.match(/^\/(fr|en)(\/.*)?$/);
  const urlLocale: SupportedLocale | null = localeMatch ? (localeMatch[1] as SupportedLocale) : null;
  const path = localeMatch ? (localeMatch[2] || "/") : fullPath;

  // -- 1. RATE LIMITING (Désactivé en local, exclu pour /api/auth et les avatars) --
  if (
    !isLocalhost &&
    process.env.NODE_ENV === "production" &&
    path.startsWith("/api/") &&
    !path.startsWith("/api/auth") &&
    !path.includes("/avatar")
  ) {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
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

  // Use getToken directly. It automatically handles secure cookies on production/HTTPS.
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const baseDomain = isLocalhost ? currentHost.replace(/^admin\./, "") : "netacuv.com";
  // En local sans sous-domaine admin., on redirige directement vers /dashboard/admin au lieu de forcer admin.localhost
  const adminUrl = isLocalhost && !isAdminSubdomain
    ? `${protocol}://${currentHost}/dashboard/admin`
    : `${protocol}://admin.${baseDomain}`;

  const isApiRoute = path.startsWith("/api");
  const isAuthRoute = path === "/connexion" || path === "/inscription";
  const isAdminLoginRoute = path === "/admin";
  const isPublicRoute = isApiRoute || isAuthRoute || path.startsWith("/_next") || path.startsWith("/assets") || isAdminLoginRoute;
  const isDashboardRoute = path.startsWith("/dashboard");

  // Si on est sur une route protégée sans token
  const isProtectedRoute = isDashboardRoute || (isAdminSubdomain && !isPublicRoute);
  if (isProtectedRoute && !token) {
    const loginBase = isAdminSubdomain ? "/admin" : "/connexion";
    const loginPath = urlLocale ? `/${urlLocale}${loginBase}` : loginBase;
    const url = new URL(loginPath, req.url);
    url.searchParams.set("callbackUrl", encodeURI(req.url));
    return NextResponse.redirect(url);
  }

  // Comportement pour les utilisateurs connectés
  if (token) {
    const role = (token.role as string)?.toUpperCase() || "";
    
    // Logique pour l'Administrateur
    const isAdmin = role === "SUPER ADMIN" || 
                    role === "ADMIN RH / MODÉRATEUR" || 
                    role === "MANAGER IA & CERTIFICATION" || 
                    role === "GESTIONNAIRE FINANCIER" || 
                    role === "SUPPORT CLIENT" ||
                    role === "ADMIN" ||
                    role === "ADMINISTRATEUR";

    if (isAdmin) {
      // En production uniquement, forcer le sous-domaine admin pour les routes du dashboard
      if (!isAdminSubdomain && !isLocalhost && path.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL(adminUrl, req.url));
      }
      
      // Empêcher l'accès aux dashboards talent/recruteur
      if (path.startsWith("/dashboard/talent") || path.startsWith("/dashboard/recruteur")) {
        return NextResponse.redirect(new URL(isLocalhost && !isAdminSubdomain ? "/dashboard/admin" : adminUrl, req.url));
      }

      // Si l'admin est déjà connecté et visite la page de connexion /admin ou les pages de connexion classiques
      if (path === "/admin" || isAuthRoute) {
        return NextResponse.redirect(new URL(isLocalhost && !isAdminSubdomain ? "/dashboard/admin" : adminUrl, req.url));
      }

      // Si l'admin visite /dashboard tout court
      if (path === "/dashboard") {
        return NextResponse.redirect(new URL(isLocalhost && !isAdminSubdomain ? "/dashboard/admin" : adminUrl, req.url));
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
      const isAccountDeleted = (token as any).error === "DeletedAccount";
      if (!isAccountDeleted && (path === "/" || path === "/dashboard" || isAuthRoute)) {
        const dest = urlLocale ? `/${urlLocale}${defaultDashboardPath}` : defaultDashboardPath;
        return NextResponse.redirect(new URL(dest, req.url));
      }

      // RBAC : Empêcher l'accès aux dashboards des autres rôles
      if (path.startsWith("/dashboard/talent") && role !== "TALENT") {
        const dest = urlLocale ? `/${urlLocale}${defaultDashboardPath}` : defaultDashboardPath;
        return NextResponse.redirect(new URL(dest, req.url));
      }
      if (path.startsWith("/dashboard/recruteur") && role !== "RECRUTEUR" && role !== "RECRUITER") {
        const dest = urlLocale ? `/${urlLocale}${defaultDashboardPath}` : defaultDashboardPath;
        return NextResponse.redirect(new URL(dest, req.url));
      }
    }
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", path);
  requestHeaders.set("x-url", req.url);
  const cookieLocale = req.cookies.get("NEXT_LOCALE")?.value;
  const activeLocale: SupportedLocale =
    urlLocale || (cookieLocale === "en" || cookieLocale === "fr" ? (cookieLocale as SupportedLocale) : "fr");
  requestHeaders.set("x-locale", activeLocale);

  // REWRITE 1 : Masquer /dashboard/admin dans l'URL pour le sous-domaine admin
  if (isAdminSubdomain && !isPublicRoute && !path.startsWith("/dashboard")) {
    return NextResponse.rewrite(new URL(`/dashboard/admin${path === "/" ? "" : path}`, req.url), {
      request: {
        headers: requestHeaders,
      },
    });
  }

  // REWRITE 2 : Si l'URL comporte un préfixe de langue (/fr/... ou /en/...), réécrire vers la route interne sans le préfixe
  if (urlLocale) {
    const rewriteUrl = new URL(path, req.url);
    rewriteUrl.search = req.nextUrl.search;
    return NextResponse.rewrite(rewriteUrl, {
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export async function middleware(req: NextRequest) {
  const fullPath = req.nextUrl.pathname;
  const localeMatch = fullPath.match(/^\/(fr|en)(\/.*)?$/);
  const urlLocale: SupportedLocale | null = localeMatch ? (localeMatch[1] as SupportedLocale) : null;

  const res = await handleMiddleware(req);

  // Synchronisation du cookie NEXT_LOCALE (uniquement 'fr' ou 'en')
  const locales = ["fr", "en"];
  const currentCookie = req.cookies.get("NEXT_LOCALE")?.value;
  const targetLocale: string =
    urlLocale || (currentCookie && locales.includes(currentCookie) ? currentCookie : "fr");

  const isLocalhost =
    req.headers.get("host")?.includes("localhost") ||
    req.headers.get("host")?.includes("127.0.0.1");
  const domain = isLocalhost ? undefined : ".netacuv.com";

  if (targetLocale !== currentCookie) {
    res.cookies.set("NEXT_LOCALE", targetLocale, {
      domain,
      path: "/",
      sameSite: "lax",
      secure: !isLocalhost,
      maxAge: 31536000,
    });
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, assets, Logo, uploads
     */
    "/((?!_next/static|_next/image|favicon.ico|assets|Logo|uploads|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm|pdf)$).*)",
  ],
};