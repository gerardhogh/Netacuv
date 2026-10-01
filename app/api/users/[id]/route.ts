import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteUserFiles } from "@/lib/deleteFiles";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session || (session.user?.role as string)?.toUpperCase() !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  const body = await req.json();

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
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session || (session.user?.role as string)?.toUpperCase() !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  const body = await req.json();

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
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session || (session.user?.role as string)?.toUpperCase() !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  await deleteUserFiles(id);

  await prisma.user.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}