"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getMaintenanceMode() {
  const setting = await prisma.systemSetting.findUnique({
    where: { key: "MAINTENANCE_MODE" },
  });
  return setting?.value === "true";
}

export async function toggleMaintenanceMode(isActive: boolean) {
  await prisma.systemSetting.upsert({
    where: { key: "MAINTENANCE_MODE" },
    update: { value: isActive ? "true" : "false" },
    create: { key: "MAINTENANCE_MODE", value: isActive ? "true" : "false" },
  });

  revalidatePath("/", "layout");
  return isActive;
}
