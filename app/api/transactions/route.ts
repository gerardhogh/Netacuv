import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const isAdmin = ["SUPER ADMIN", "ADMIN RH / MODÉRATEUR", "GESTIONNAIRE FINANCIER", "ADMIN"].includes(session.user.role?.toUpperCase() || "");

    const whereClause = isAdmin ? {} : { userId: session.user.id };

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        user: {
          include: {
            role: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      }
    });

    return NextResponse.json({ transactions }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération des transactions:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des transactions' },
      { status: 500 }
    );
  }
}
