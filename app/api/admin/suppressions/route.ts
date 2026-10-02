import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role?.toUpperCase() || "";
    const isAdmin = role === "SUPER ADMIN" || role === "ADMIN RH / MODÉRATEUR" || role === "MANAGER IA & CERTIFICATION" || role === "GESTIONNAIRE FINANCIER" || role === "SUPPORT CLIENT" || role === "ADMIN";

    if (!session || !session.user || !isAdmin) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const deletions = await prisma.deletedAccount.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(deletions);
  } catch (error) {
    console.error("Erreur récupération suppressions:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
