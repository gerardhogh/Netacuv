import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const degree = searchParams.get('degree') || '';
    const gender = searchParams.get('gender') || '';
    const country = searchParams.get('country') || '';
    const city = searchParams.get('city') || '';

    const session = await getServerSession(authOptions);
    const isAdmin = ["SUPER ADMIN", "ADMIN RH / MODÉRATEUR", "MANAGER IA & CERTIFICATION", "GESTIONNAIRE FINANCIER", "SUPPORT CLIENT", "ADMIN"].includes(session?.user?.role?.toUpperCase() || "");

    // AS-03: Vérifier isPremium en BDD uniquement pour les recruteurs non-admin (économise un aller-retour réseau Supabase)
    let isPremium = false;
    if (!isAdmin && session?.user?.id) {
      const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id as string },
        select: { isPremium: true },
      });
      isPremium = dbUser?.isPremium === true;
    }

    const filters: any = { isNot: null };
    
    // Filtres avancés bloqués pour les recruteurs non-premium
    if (isAdmin || isPremium) {
      if (degree) filters.degree = degree;
      if (gender) filters.gender = gender;
      if (country) filters.country = country;
      if (city) filters.city = city;
    }

    // Build the query where clause
    const whereClause: any = {
      talentProfile: filters,
      ...(query ? {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { talentProfile: { bio: { contains: query, mode: 'insensitive' } } },
          { talentProfile: { skills: { contains: query, mode: 'insensitive' } } },
          { talentProfile: { degree: { contains: query, mode: 'insensitive' } } },
        ]
      } : {})
    };

    // Only filter by active if not admin
    if (!isAdmin) {
      whereClause.active = true;
    }

    // VLT-02: Pagination serveur
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100); // Cap at 100
    const skip = (page - 1) * limit;

    // Return users that have a TalentProfile and role TALENT
    const [talents, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          active: true,
          isPremium: true,
          createdAt: true,
          role: { select: { name: true } },
          talentProfile: {
            select: {
              id: true,
              bio: true,
              degree: true,
              gender: true,
              city: true,
              country: true,
              phone: true,
              skills: true,
              cvUrl: true,
              videoUrl: true,
              username: true,
              facebook: true,
              linkedin: true,
              twitter: true,
              pinterest: true,
              behance: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit,
      }),
      prisma.user.count({ where: whereClause }),
    ]);
    
    // Récupération des sessions d'interview en 1 seule requête bulk globale (ultra rapide, 0 N+1)
    const profileIds = talents.map(t => t.talentProfile?.id).filter((id): id is string => Boolean(id));
    const sessions = profileIds.length > 0 ? await prisma.interviewSession.findMany({
      where: { talentId: { in: profileIds } },
      select: {
        talentId: true,
        status: true,
        aiScore: true,
        videoRecordings: true,
      },
      orderBy: { createdAt: 'desc' },
    }) : [];

    const sessionByTalent = new Map<string, (typeof sessions)[0]>();
    for (const s of sessions) {
      if (!sessionByTalent.has(s.talentId)) {
        sessionByTalent.set(s.talentId, s);
      }
    }

    // Si c'est un recruteur non-premium, on masque certaines données
    const shouldHideSensitive = !isAdmin && !isPremium;

    const formattedTalents = talents.map((t: any, index: number) => {
      const profile = t.talentProfile;
      const talentSession = profile ? sessionByTalent.get(profile.id) : null;
      const hasCompletedSession = !!(talentSession && (talentSession.status === "COMPLETED" || (talentSession.aiScore !== null && talentSession.aiScore !== undefined) || !!talentSession.videoRecordings));
      const resolvedVideo = profile?.videoUrl || talentSession?.videoRecordings || null;
      const hasVideo = !!resolvedVideo || hasCompletedSession;
      let skillsArray = [];
      if (profile?.skills) {
        try {
          skillsArray = JSON.parse(profile.skills);
        } catch (e) {
          skillsArray = profile.skills.split(',').map((s: string) => s.trim());
        }
      }

      return {
        id: t.id,
        no: (index + 1).toString().padStart(2, '0'),
        name: t.name || "Talent Anonyme",
        firstName: t.name?.split(" ")[0] || "",
        lastName: t.name?.split(" ").slice(1).join(" ") || "",
        username: profile?.username || t.email?.split("@")[0] || "",
        email: shouldHideSensitive ? "premium@requis.com" : (t.email || ""),
        contact: shouldHideSensitive ? "Premium requis" : (profile?.phone || "Non spécifié"),
        date: new Date(t.createdAt).toLocaleDateString('fr-FR'),
        status: t.active ? "Actif" : "Suspendu",
        videoOk: hasVideo,
        videoUrl: resolvedVideo,
        domaine: profile?.degree || "Général",
        location: profile?.city ? `${profile.city}, ${profile.country || ''}` : (profile?.country || "Non spécifié"),
        country: profile?.country || "Non spécifié",
        profession: profile?.degree || "Talent", 
        bio: profile?.bio || "Aucune biographie",
        avatar: t.image?.startsWith("data:image") 
          ? `/api/users/${t.id}/avatar` 
          : (t.image || "/assets/avatar_africain.jpg"),
        cvUrl: shouldHideSensitive ? "" : (profile?.cvUrl || ""),
        isVerified: t.isPremium || false,
        isPremium: t.isPremium || false,
        skills: Array.isArray(skillsArray) ? skillsArray.join(", ") : "",
        gender: profile?.gender || "Non précisé",
        opportunity: "Emploi",
        socials: shouldHideSensitive ? {
          facebook: "",
          linkedin: "",
          twitter: "",
          pinterest: "",
          behance: "",
        } : {
          facebook: profile?.facebook || "",
          linkedin: profile?.linkedin || "",
          twitter: profile?.twitter || "",
          pinterest: profile?.pinterest || "",
          behance: profile?.behance || "",
        },
      };
    });

    return NextResponse.json({
      talents: formattedTalents,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=30',
      }
    });
  } catch (error) {
    console.error("Erreur GET /api/talents:", error);
    return NextResponse.json({ 
      error: "Erreur lors de la récupération des talents",
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
