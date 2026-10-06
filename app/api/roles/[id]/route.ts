import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';
import { hasPermission } from '@/lib/permissions';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await hasPermission('roles:write'))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, description, permissions, active } = body;

    const currentRole = await prisma.role.findUnique({ where: { id } });
    if (!currentRole) return NextResponse.json({ error: "Rôle non trouvé" }, { status: 404 });
    if (currentRole.name === "Super Admin") {
      return NextResponse.json({ error: "Le rôle Super Admin est verrouillé par le système et ne peut être modifié." }, { status: 400 });
    }
    if (currentRole.isSystem && name && name !== currentRole.name) {
      return NextResponse.json({ error: "Impossible de renommer un rôle système" }, { status: 400 });
    }

    const updatedRole = await prisma.role.update({
      where: { id },
      data: {
        ...(name && !currentRole.isSystem && { name }),
        ...(description !== undefined && { description }),
        ...(active !== undefined && !currentRole.isSystem && { active }),
        ...(permissions && {
          rolePermissions: {
            deleteMany: {},
            create: permissions.map((code: string) => ({
              permission: {
                connectOrCreate: {
                  where: { code },
                  create: { code, module: 'general' }
                }
              }
            }))
          }
        })
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
  } catch (error: any) {
    console.error("Erreur PUT /api/roles/[id]:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Ce nom de rôle existe déjà" }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur lors de la mise à jour du rôle" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await hasPermission('roles:delete'))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const roleToDelete = await prisma.role.findUnique({ where: { id } });
    if (!roleToDelete) return NextResponse.json({ error: "Rôle non trouvé" }, { status: 404 });
    if (roleToDelete.isSystem) {
      return NextResponse.json({ error: "Impossible de supprimer un rôle système" }, { status: 400 });
    }

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
