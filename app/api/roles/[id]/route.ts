import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, description, permissions, active } = body;

    const updatedRole = await prisma.role.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(permissions && { permissions: JSON.stringify(permissions) }),
        ...(active !== undefined && { active })
      }
    });

    // Add Audit Log
    const actionDesc = active !== undefined 
      ? `Rôle "${updatedRole.name}" ${active ? 'activé' : 'suspendu'}` 
      : `Rôle "${updatedRole.name}" modifié`;
      
    const session = await getServerSession(authOptions);
    const adminName = session?.user?.name || session?.user?.email || "Administrateur Inconnu";

    await prisma.auditLog.create({
      data: {
        action: actionDesc,
        by: `${adminName}\n(Administrateur)`,
      }
    });

    return NextResponse.json(updatedRole);
  } catch (error) {
    console.error("Erreur PUT /api/roles/[id]:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour du rôle" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Check if users are assigned to this role
    const usersWithRole = await prisma.user.count({
      where: { roleId: id }
    });

    if (usersWithRole > 0) {
      return NextResponse.json({ error: "Impossible de supprimer ce rôle car il est assigné à des utilisateurs." }, { status: 400 });
    }

    const deletedRole = await prisma.role.delete({
      where: { id }
    });

    const session = await getServerSession(authOptions);
    const adminName = session?.user?.name || session?.user?.email || "Administrateur Inconnu";

    // Add Audit Log
    await prisma.auditLog.create({
      data: {
        action: `Rôle "${deletedRole.name}" supprimé`,
        by: `${adminName}\n(Administrateur)`,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur DELETE /api/roles/[id]:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression du rôle" }, { status: 500 });
  }
}
