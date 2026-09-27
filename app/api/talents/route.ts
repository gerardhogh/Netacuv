import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const degree = searchParams.get('degree') || '';
    const gender = searchParams.get('gender') || '';
    const country = searchParams.get('country') || '';
    const city = searchParams.get('city') || '';

    const filters: any = { isNot: null };
    if (degree) filters.degree = degree;
    if (gender) filters.gender = gender;
    if (country) filters.country = country;
    if (city) filters.city = city;

    // Return users that have a TalentProfile
    const talents = await prisma.user.findMany({
      where: {
        talentProfile: filters,
        ...(query ? {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { talentProfile: { bio: { contains: query, mode: 'insensitive' } } },
            { talentProfile: { skills: { contains: query, mode: 'insensitive' } } },
          ]
        } : {})
      },
      include: {
        talentProfile: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

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
        email: t.email || "",
        contact: profile?.phone || "Non spécifié",
        date: new Date(t.createdAt).toLocaleDateString('fr-FR'),
        status: t.active ? "Actif" : "Suspendu",
        videoOk: !!profile?.videoUrl,
        domaine: profile?.degree || "Général",
        location: profile?.city || "Non spécifié",
        country: profile?.country || "Non spécifié",
        profession: profile?.degree || "Talent", 
        bio: profile?.bio || "Aucune biographie",
        avatar: t.image || "/assets/avatar_africain.jpg",
        cvUrl: profile?.cvUrl || "",
        isVerified: true,
        skills: Array.isArray(skillsArray) ? skillsArray.join(", ") : "",
        gender: profile?.gender || "Non précisé",
        opportunity: "Emploi",
        socials: {
          facebook: profile?.facebook || "",
          linkedin: profile?.linkedin || "",
          twitter: profile?.twitter || "",
          pinterest: profile?.pinterest || "",
          behance: profile?.behance || "",
        },
      };
    });

    return NextResponse.json(formattedTalents);
  } catch (error) {
    console.error("Erreur GET /api/talents:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération des talents" }, { status: 500 });
  }
}
