import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteUserFiles } from "@/lib/deleteFiles";
import { hasPermission } from "@/lib/permissions";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  
  if (!session || !(await hasPermission('users:moderate'))) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  if (body.roleId) {
    const roleToAssign = await prisma.role.findUnique({ where: { id: body.roleId } });
    const currentUser = await prisma.user.findUnique({ where: { email: session.user?.email || "" }, include: { role: true } });
    if (roleToAssign?.name === "Super Admin" && currentUser?.role?.name !== "Super Admin") {
      return NextResponse.json({ error: "Seul un Super Admin peut assigner ce rôle." }, { status: 403 });
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      roleId: body.roleId,
      name: body.name,
      active: body.active, // Allow updating active status if passed
    },
  });

  return NextResponse.json(updatedUser);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  
  if (!session || !(await hasPermission('users:moderate'))) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  if (body.roleId) {
    const roleToAssign = await prisma.role.findUnique({ where: { id: body.roleId } });
    const currentUser = await prisma.user.findUnique({ where: { email: session.user?.email || "" }, include: { role: true } });
    if (roleToAssign?.name === "Super Admin" && currentUser?.role?.name !== "Super Admin") {
      return NextResponse.json({ error: "Seul un Super Admin peut assigner ce rôle." }, { status: 403 });
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: body,
  });

  return NextResponse.json(updatedUser);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !(await hasPermission('users:moderate'))) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  const { id } = await params;

  await deleteUserFiles(id);

  await prisma.user.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}