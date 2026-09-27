import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  // Use getToken directly. It automatically handles secure cookies on production/HTTPS.
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const hostname = req.headers.get("host") || "";
  const path = req.nextUrl.pathname;

  // Intercepter le sous-domaine admin
  const isAdminSubdomain = hostname === "admin.netacuv.com" || hostname.startsWith("admin.localhost");

  if (isAdminSubdomain && path === "/") {
    // Si déjà connecté en tant qu'admin, rediriger vers le dashboard
    if (token?.role === "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/admin", req.url));
    }
    // Sinon on rewrite silencieusement vers la page de login admin
    return NextResponse.rewrite(new URL("/admin", req.url));
  }

  // Routes protégées nécessitant une connexion
  const isProtectedRoute = path.startsWith("/dashboard") || path.startsWith("/interview");

  if (isProtectedRoute) {
    // Si l'utilisateur n'est pas connecté, le rediriger vers la page de connexion
    if (!token) {
      const url = new URL("/connexion", req.url);
      url.searchParams.set("callbackUrl", encodeURI(req.url));
      return NextResponse.redirect(url);
    }

    // Si on accède à la racine du dashboard, on redirige vers le bon espace selon le rôle
    if (path === "/dashboard") {
      if (token.role === "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard/admin", req.url));
      } else if (token.role === "RECRUTEUR") {
        return NextResponse.redirect(new URL("/dashboard/recruteur", req.url));
      } else {
        return NextResponse.redirect(new URL("/dashboard/talent", req.url));
      }
    }

    // Rediriger si l'accès à l'espace Admin est tenté par un non-ADMIN
    if (path.startsWith("/dashboard/admin") && token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Rediriger si l'accès à l'espace Recruteur est tenté par un rôle non autorisé
    if (
      (path.startsWith("/dashboard/recruiter") || path.startsWith("/dashboard/recruteur")) &&
      !["RECRUTEUR", "ADMIN"].includes(token.role as string)
    ) {
      return NextResponse.redirect(new URL("/dashboard/talent", req.url));
    }

    // Rediriger si l'accès à l'espace Talent est tenté par un rôle non autorisé
    if (
      path.startsWith("/dashboard/talent") &&
      !["TALENT", "ADMIN"].includes(token.role as string)
    ) {
      return NextResponse.redirect(new URL("/dashboard/recruteur", req.url));
    }
  }

  // Rediriger les utilisateurs connectés qui tentent d'accéder à l'accueil ou aux pages d'auth
  if (token && (path === "/" || path === "/connexion" || path === "/inscription")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, assets, Logo
     */
    "/((?!api|_next/static|_next/image|favicon.ico|assets|Logo|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};