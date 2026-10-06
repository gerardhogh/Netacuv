"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateSystemSettings(settings: { key: string, value: string }[]) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "SUPER ADMIN" && session.user.role !== "ADMIN" && !session.user.role.includes("FINANCIER"))) {
    throw new Error("Unauthorized");
  }

  for (const { key, value } of settings) {
    await prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
  }
  
  revalidatePath("/dashboard/admin/affiliation");
  return { success: true };
}

export async function updateUserReferralCode(userId: string, newCode: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "SUPER ADMIN" && session.user.role !== "ADMIN" && !session.user.role.includes("FINANCIER"))) {
    throw new Error("Unauthorized");
  }

  // Vérifier si le code existe déjà pour un autre utilisateur
  if (newCode) {
    const existing = await prisma.user.findFirst({
      where: { referralCode: newCode, id: { not: userId } }
    });
    if (existing) {
      throw new Error("Ce code d'affiliation est déjà utilisé par un autre utilisateur.");
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { referralCode: newCode || null }
  });

  revalidatePath("/dashboard/admin/affiliation");
  return { success: true };
}
