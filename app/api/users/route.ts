import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  // Vérification : Seul un ADMIN peut voir la liste des utilisateurs
  if (!session || session.user?.role !== "ADMIN") {
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