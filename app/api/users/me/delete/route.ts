import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteUserFiles } from "@/lib/deleteFiles";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const userId = session.user.id;
    console.log("Session user id:", userId);

    const body = await req.json();
    const { reason } = body;
    console.log("Reason:", reason);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });
    
    console.log("Found user:", user);

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    // Enregistrer la raison
    await prisma.deletedAccount.create({
      data: {
        email: user.email || "Inconnu",
        role: user.role?.name || "Inconnu",
        reason: reason || "Aucune raison fournie",
      },
    });

    await deleteUserFiles(user.id);

    // Supprimer l'utilisateur (Cascade se chargera des profils)
    await prisma.user.delete({
      where: { id: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erreur suppression compte:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
