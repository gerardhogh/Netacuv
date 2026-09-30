import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function GET() {
  const session = await getServerSession(authOptions);

  // Vérification : Seul un ADMIN peut voir la liste des utilisateurs
  if (!session || (session.user?.role as string)?.toUpperCase() !== "ADMIN") {
    return NextResponse.json(
      { error: "Accès refusé. Droits d'administrateur requis." },
      { status: 403 }
    );
  }

  // Récupération sécurisée (exclusion explicite du champ passwordHash)
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      roleId: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      active: true,
      recruiterProfile: {
        include: {
          jobOffers: {
            include: { applications: true }
          }
        }
      },
      talentProfile: true
    },
  });
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  // Vérification : Seul un ADMIN peut créer un utilisateur manuellement
  if (!session || (session.user?.role as string)?.toUpperCase() !== "ADMIN") {
    return NextResponse.json(
      { error: "Accès refusé. Droits d'administrateur requis." },
      { status: 403 }
    );
  }

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
        by: session.user.name || session.user.email || "Admin",
        details: roleId ? `Attribué au rôle ID: ${roleId}` : "Aucun rôle spécifique"
      }
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    console.error("Erreur création utilisateur:", error);
    return NextResponse.json({ error: "Erreur lors de la création de l'utilisateur." }, { status: 500 });
  }
}