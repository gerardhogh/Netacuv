import { prisma } from "@/lib/prisma";
import { deleteUserFiles } from "@/lib/deleteFiles";

export interface DataRetentionResult {
  success: boolean;
  retentionLimitDate: Date;
  scannedUsersCount: number;
  deletedUsersCount: number;
  deletedAccounts: Array<{
    id: string;
    email: string;
    role: string;
    lastActivity: Date;
  }>;
  errors: Array<{ userId: string; email?: string; error: string }>;
}

/**
 * Applique la politique de conservation des données en cas d'inactivité supérieure à 2 ans :
 * Conformément aux engagements de confidentialité et aux exigences légales (RGPD / protection des données personnelles),
 * les comptes n'ayant eu aucune activité depuis plus de 2 ans et leurs données associées (profils, CV, vidéos, offres, etc.)
 * sont définitivement purgés.
 *
 * @param options.dryRun Si true, effectue une simulation sans suppression réelle en base.
 */
export async function applyDataRetentionPolicy(options: { dryRun?: boolean } = {}): Promise<DataRetentionResult> {
  const { dryRun = false } = options;

  // Calcul du seuil d'inactivité de 2 ans révolus
  const now = new Date();
  const retentionLimitDate = new Date(now);
  retentionLimitDate.setFullYear(retentionLimitDate.getFullYear() - 2);

  // Recherche des utilisateurs potentiellement inactifs
  // Sont exclus de toute suppression automatique les comptes administrateurs / système
  const candidates = await prisma.user.findMany({
    where: {
      updatedAt: { lte: retentionLimitDate },
      createdAt: { lte: retentionLimitDate },
      NOT: {
        role: {
          name: {
            in: ["SUPER ADMIN", "ADMIN", "ADMINISTRATEUR", "SUPPORT", "MODERATEUR"],
          },
        },
      },
    },
    include: {
      role: true,
      sessions: {
        where: {
          expires: { gte: retentionLimitDate },
        },
      },
      talentProfile: {
        include: {
          applications: {
            where: { createdAt: { gte: retentionLimitDate } },
            select: { id: true },
          },
          interviewSessions: {
            where: { updatedAt: { gte: retentionLimitDate } },
            select: { id: true },
          },
        },
      },
      recruiterProfile: {
        include: {
          jobOffers: {
            where: { updatedAt: { gte: retentionLimitDate } },
            select: { id: true },
          },
        },
      },
    },
  });

  const result: DataRetentionResult = {
    success: true,
    retentionLimitDate,
    scannedUsersCount: candidates.length,
    deletedUsersCount: 0,
    deletedAccounts: [],
    errors: [],
  };

  for (const user of candidates) {
    // Vérification approfondie d'inactivité :
    // Si l'utilisateur possède une session active ou une activité enregistrée dans les 2 ans, on préserve le compte
    const hasActiveSession = (user.sessions?.length || 0) > 0;
    const hasRecentApplication = (user.talentProfile?.applications?.length || 0) > 0;
    const hasRecentInterview = (user.talentProfile?.interviewSessions?.length || 0) > 0;
    const hasRecentJob = (user.recruiterProfile?.jobOffers?.length || 0) > 0;

    if (hasActiveSession || hasRecentApplication || hasRecentInterview || hasRecentJob) {
      continue;
    }

    const userEmail = user.email || "Utilisateur anonyme";
    const userRole = user.role?.name || "TALENT";
    const lastActivity = user.updatedAt;

    if (dryRun) {
      result.deletedUsersCount++;
      result.deletedAccounts.push({
        id: user.id,
        email: userEmail,
        role: userRole,
        lastActivity,
      });
      continue;
    }

    try {
      // 1. Enregistrement dans DeletedAccount (historique de conformité RGPD)
      await prisma.deletedAccount.create({
        data: {
          email: userEmail,
          role: userRole,
          reason: "Suppression automatique suite à inactivité supérieure à 2 ans (politique de conservation des données)",
        },
      });

      // 2. Suppression des fichiers physiques téléversés (CV, vidéos de simulation, avatars, logos)
      await deleteUserFiles(user.id);

      // 3. Dissociation de parrainage pour éviter les violations de clés étrangères
      await prisma.user.updateMany({
        where: { referredById: user.id },
        data: { referredById: null },
      });

      // 4. Suppression définitive du compte utilisateur (supprime en cascade profil, candidatures, offres, etc.)
      await prisma.user.delete({
        where: { id: user.id },
      });

      // 5. Traçabilité dans l'AuditLog
      await prisma.auditLog.create({
        data: {
          action: "AUTO_DELETE_INACTIVE_USER",
          by: "SYSTEM_DATA_RETENTION",
          details: `Compte ${userEmail} (${user.id}) supprimé suite à inactivité supérieure à 2 ans (dernière activité : ${lastActivity.toISOString()}).`,
        },
      });

      result.deletedUsersCount++;
      result.deletedAccounts.push({
        id: user.id,
        email: userEmail,
        role: userRole,
        lastActivity,
      });
    } catch (err: any) {
      console.error(`Erreur suppression compte inactif ${user.id} (${userEmail}):`, err);
      result.errors.push({
        userId: user.id,
        email: userEmail,
        error: err.message || "Erreur inconnue lors de la suppression",
      });
    }
  }

  return result;
}
