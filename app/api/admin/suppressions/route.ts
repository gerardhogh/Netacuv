import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
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
