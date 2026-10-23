import { prisma } from "@/lib/prisma";

export interface ReferrerMatch {
  id: string;
  name: string | null;
  email: string | null;
  referralCode: string | null;
}

/**
 * Recherche robuste et tolérante d'un parrain.
 * Prend en charge :
 * - Le code exact (insensible à la casse)
 * - Le code avec ou sans le préfixe "REF-"
 * - L'ancien format temporaire basé sur le nom (ex: "GEN-750", "G-750")
 * - L'adresse email du parrain (très souvent utilisée par les utilisateurs comme code de parrainage)
 * - Le nom ou prénom exact du parrain
 */
export async function findReferrer(rawCode: string | null | undefined): Promise<ReferrerMatch | null> {
  if (!rawCode) return null;

  const clean = rawCode.trim().replace(/^['"]|['"]$/g, "");
  if (clean.length < 2) return null;

  // 1. Recherche directe par code de parrainage (insensible à la casse)
  const byCode = await prisma.user.findFirst({
    where: {
      referralCode: {
        equals: clean,
        mode: "insensitive",
      },
    },
    select: { id: true, name: true, email: true, referralCode: true },
  });
  if (byCode) return byCode;

  // 2. Recherche avec préfixe "REF-" ajouté si absent
  if (!clean.toUpperCase().startsWith("REF-")) {
    const byWithRef = await prisma.user.findFirst({
      where: {
        referralCode: {
          equals: `REF-${clean}`,
          mode: "insensitive",
        },
      },
      select: { id: true, name: true, email: true, referralCode: true },
    });
    if (byWithRef) return byWithRef;
  } else {
    // Si commence par "REF-", tenter sans le "REF-"
    const stripped = clean.substring(4);
    if (stripped.length >= 2) {
      const byWithoutRef = await prisma.user.findFirst({
        where: {
          referralCode: {
            equals: stripped,
            mode: "insensitive",
          },
        },
        select: { id: true, name: true, email: true, referralCode: true },
      });
      if (byWithoutRef) return byWithoutRef;
    }
  }

  // 3. Recherche par adresse email (si l'amie a saisi l'email de son parrain)
  if (clean.includes("@")) {
    const byEmail = await prisma.user.findFirst({
      where: {
        email: {
          equals: clean,
          mode: "insensitive",
        },
      },
      select: { id: true, name: true, email: true, referralCode: true },
    });
    if (byEmail) return byEmail;
  }

  // 4. Gestion de l'ancien format fallback "[NOM]-750" (ex: "GEN-750", "G-750")
  if (clean.toUpperCase().endsWith("-750")) {
    const namePrefix = clean.slice(0, -4).trim();
    if (namePrefix.length >= 1) {
      const byNamePrefix = await prisma.user.findFirst({
        where: {
          OR: [
            { name: { startsWith: namePrefix, mode: "insensitive" } },
            { referralCode: { contains: namePrefix, mode: "insensitive" } },
          ],
        },
        select: { id: true, name: true, email: true, referralCode: true },
      });
      if (byNamePrefix) return byNamePrefix;
    }
  }

  // 5. Recherche par nom d'utilisateur (si le filleul a saisi le prénom ou pseudo du parrain)
  const byName = await prisma.user.findFirst({
    where: {
      name: {
        equals: clean,
        mode: "insensitive",
      },
    },
    select: { id: true, name: true, email: true, referralCode: true },
  });
  if (byName) return byName;

  return null;
}
