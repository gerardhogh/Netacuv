import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getToken } from "next-auth/jwt";
import { logger } from "@/lib/logger";

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
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isPremium: true,
        talentProfile: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    let applicationsCountThisMonth = 0;
    
    if (user.talentProfile) {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      applicationsCountThisMonth = await prisma.application.count({
        where: {
          talentId: user.talentProfile.id,
          createdAt: {
            gte: startOfMonth
          }
        }
      });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.image,
      isPremium: user.isPremium || false,
      applicationsCountThisMonth,
      talentProfile: user.talentProfile || {}
    });
  } catch (error) {
    logger.error("Error GET /api/talents/me", { error: error instanceof Error ? error.message : "Unknown", context: "api/talents/me/GET" });
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
      name,
      bio,
      phone,
      city,
      country,
      degree,
      gender,
      skills,
      facebook,
      linkedin,
      twitter,
      pinterest,
      behance,
      other1,
      other2,
      username
    } = data;

    // Prepare talent profile data
    const talentData: any = {};
    if (username !== undefined) talentData.username = username;
    if (bio !== undefined) talentData.bio = bio;
    if (phone !== undefined) talentData.phone = phone;
    if (city !== undefined) talentData.city = city;
    if (country !== undefined) talentData.country = country;
    if (degree !== undefined) talentData.degree = degree;
    if (gender !== undefined) talentData.gender = gender;
    if (skills !== undefined) talentData.skills = skills;
    if (facebook !== undefined) talentData.facebook = facebook;
    if (linkedin !== undefined) talentData.linkedin = linkedin;
    if (twitter !== undefined) talentData.twitter = twitter;
    if (pinterest !== undefined) talentData.pinterest = pinterest;
    if (behance !== undefined) talentData.behance = behance;
    if (other1 !== undefined) talentData.other1 = other1;
    if (other2 !== undefined) talentData.other2 = other2;

    // Utilisation d'une transaction Prisma (Point 19)
    const [updatedUser, talentProfile] = await prisma.$transaction([
      ...(name ? [
        prisma.user.update({
          where: { id: userId },
          data: { name }
        })
      ] : []),
      prisma.talentProfile.upsert({
        where: { userId },
        update: talentData,
        create: {
          userId,
          ...talentData
        }
      })
    ]);

    logger.info("Talent profile updated", { userId });
    return NextResponse.json({
      success: true,
      talentProfile
    });

  } catch (error) {
    logger.error("Erreur PUT /api/talents/me:", { error: error instanceof Error ? error.message : "Unknown", context: "api/talents/me/PUT" });
    return NextResponse.json({ error: "Erreur lors de la mise à jour du profil" }, { status: 500 });
  }
}

