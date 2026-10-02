import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE : Supprimer une offre (Créateur de l'offre ou ADMIN uniquement)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: "Vous devez être connecté pour effectuer cette action." },
      { status: 401 }
    );
  }

  try {
    const job = await prisma.jobOffer.findUnique({
      where: { id },
      include: { recruiter: true },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Offre d'emploi introuvable." },
        { status: 404 }
      );
    }

    // Vérification : L'utilisateur doit être le créateur de l'offre ou un ADMIN
    const isOwner = job.recruiter?.userId === session.user.id;
    const isAdmin = ["SUPER ADMIN", "ADMIN RH / MODÉRATEUR", "MANAGER IA & CERTIFICATION", "GESTIONNAIRE FINANCIER", "SUPPORT CLIENT", "ADMIN"].includes(session.user.role?.toUpperCase() || "");

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Vous n'avez pas la permission de supprimer cette offre." },
        { status: 403 }
      );
    }

    await prisma.jobOffer.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Offre supprimée avec succès." });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'offre." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { status } = body;

    const job = await prisma.jobOffer.findUnique({ where: { id }, include: { recruiter: true } });
    if (!job) return NextResponse.json({ error: "Offre introuvable." }, { status: 404 });

    const isOwner = job.recruiter?.userId === session.user.id;
    const isAdmin = ["SUPER ADMIN", "ADMIN RH / MODÉRATEUR", "MANAGER IA & CERTIFICATION", "GESTIONNAIRE FINANCIER", "SUPPORT CLIENT", "ADMIN"].includes(session.user.role?.toUpperCase() || "");

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Interdit" }, { status: 403 });
    }

    const updated = await prisma.jobOffer.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Erreur de mise à jour" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json();
    
    const job = await prisma.jobOffer.findUnique({ where: { id }, include: { recruiter: true } });
    if (!job) return NextResponse.json({ error: "Offre introuvable." }, { status: 404 });

    const isOwner = job.recruiter?.userId === session.user.id;
    const isAdmin = ["SUPER ADMIN", "ADMIN RH / MODÉRATEUR", "MANAGER IA & CERTIFICATION", "GESTIONNAIRE FINANCIER", "SUPPORT CLIENT", "ADMIN"].includes(session.user.role?.toUpperCase() || "");

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Interdit" }, { status: 403 });
    }

    const { title, description, location, contractType } = body;

    const updated = await prisma.jobOffer.update({
      where: { id },
      data: { 
        title: title || job.title, 
        description: description || job.description, 
        location: location || job.location, 
        contractType: contractType || job.contractType 
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Erreur de mise à jour" }, { status: 500 });
  }
}