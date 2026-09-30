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
    const isAdmin = session?.user?.role === "ADMIN";

    // AS-03: Vérifier isPremium en BDD (et non via le JWT client)
    let isPremium = false;
    if (session?.user?.id) {
      const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id as string },
        select: { isPremium: true },
      });
      isPremium = dbUser?.isPremium === true;
    }

    const filters: any = { isNot: null };
    if (degree) filters.degree = degree;
    if (gender) filters.gender = gender;
    if (country) filters.country = country;
    if (city) filters.city = city;

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
        include: {
          talentProfile: true,
          role: true,
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit,
      }),
      prisma.user.count({ where: whereClause }),
    ]);
    
    // Si c'est un recruteur non-premium, on masque certaines données
    const shouldHideSensitive = !isAdmin && !isPremium;

    const formattedTalents = talents.map((t: any, index: number) => {
      const profile = t.talentProfile;
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
        videoOk: !!profile?.videoUrl,
        videoUrl: profile?.videoUrl || null,
        domaine: profile?.degree || "Général",
        location: profile?.city ? `${profile.city}, ${profile.country || ''}` : (profile?.country || "Non spécifié"),
        country: profile?.country || "Non spécifié",
        profession: profile?.degree || "Talent", 
        bio: profile?.bio || "Aucune biographie",
        avatar: t.image || "/assets/avatar_africain.jpg",
        cvUrl: shouldHideSensitive ? "" : (profile?.cvUrl || ""),
        isVerified: true,
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
    });
  } catch (error) {
    console.error("Erreur GET /api/talents:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération des talents" }, { status: 500 });
  }
}
