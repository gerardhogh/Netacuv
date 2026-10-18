import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

import { hasPermission } from "@/lib/permissions";

export async function GET(req: Request) {
  if (!(await hasPermission('users:read')) && !(await hasPermission('users:moderate'))) {
    return NextResponse.json(
      { error: "Accès refusé. Droits requis." },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const limit = Math.max(1, parseInt(searchParams.get("limit") || "20", 10) || 20);
  const skip = (page - 1) * limit;

  const role = searchParams.get("role");
  const where: any = {};
  if (role === "recruiter" || role === "recruteur") {
    where.OR = [
      { recruiterProfile: { isNot: null } },
      { role: { name: { in: ["RECRUTEUR", "RECRUITER"] } } }
    ];
  } else if (role === "talent") {
    where.OR = [
      { talentProfile: { isNot: null } },
      { role: { name: { in: ["TALENT"] } } }
    ];
  }

  // Récupération sécurisée (exclusion explicite du champ passwordHash)
  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        roleId: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        active: true,
        isPremium: true,
        recruiterProfile: {
          select: {
            id: true,
            companyName: true,
            companyLogo: true,
            industry: true,
            website: true,
            address: true,
            description: true,
            skills: true,
            phone: true,
            jobOffers: {
              select: {
                id: true,
                applications: {
                  select: { id: true }
                }
              }
            }
          }
        },
        talentProfile: (role === "recruiter" || role === "recruteur") ? false : true
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({
    users,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    page,
    limit,
  }, {
    headers: {
      'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=30',
    }
  });
}

export async function POST(request: Request) {
  if (!(await hasPermission('users:moderate'))) {
    return NextResponse.json(
      { error: "Accès refusé. Droits requis." },
      { status: 403 }
    );
  }

  const session = await getServerSession(authOptions);

  try {
    const { name, email, password, roleId } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Tous les champs sont requis." }, { status: 400 });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Un utilisateur avec cet email existe déjà." }, { status: 400 });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        roleId: roleId || null,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        action: `Création d'un nouvel utilisateur (${email})`,
        by: session?.user?.name || session?.user?.email || "Admin",
        details: roleId ? `Attribué au rôle ID: ${roleId}` : "Aucun rôle spécifique"
      }
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    console.error("Erreur création utilisateur:", error);
    return NextResponse.json({ error: "Erreur lors de la création de l'utilisateur." }, { status: 500 });
  }
}