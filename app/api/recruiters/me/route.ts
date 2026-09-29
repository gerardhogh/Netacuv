import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getToken } from "next-auth/jwt";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token?.sub) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = token.sub;
    
    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        recruiterProfile: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.image,
      recruiterProfile: user.recruiterProfile || {}
    });
  } catch (error) {
    console.error("Erreur GET /api/recruiters/me:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token?.sub) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = token.sub;
    const data = await req.json();

    const {
      companyName,
      industry,
      website,
      phone,
      address,
      description,
      skills,
      facebook,
      linkedin,
      twitter,
      pinterest,
      behance
    } = data;

    // Prepare recruiter profile data
    const recruiterData: any = {};
    if (companyName !== undefined) recruiterData.companyName = companyName;
    if (industry !== undefined) recruiterData.industry = industry;
    if (website !== undefined) recruiterData.website = website;
    if (phone !== undefined) recruiterData.phone = phone;
    if (address !== undefined) recruiterData.address = address;
    if (description !== undefined) recruiterData.description = description;
    if (skills !== undefined) recruiterData.skills = skills;
    if (facebook !== undefined) recruiterData.facebook = facebook;
    if (linkedin !== undefined) recruiterData.linkedin = linkedin;
    if (twitter !== undefined) recruiterData.twitter = twitter;
    if (pinterest !== undefined) recruiterData.pinterest = pinterest;
    if (behance !== undefined) recruiterData.behance = behance;

    const recruiterProfile = await prisma.recruiterProfile.upsert({
      where: { userId },
      update: recruiterData,
      create: {
        userId,
        ...recruiterData
      }
    });

    return NextResponse.json({
      success: true,
      recruiterProfile
    });

  } catch (error) {
    console.error("Erreur PUT /api/recruiters/me:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour du profil" }, { status: 500 });
  }
}
