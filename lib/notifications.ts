import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { NotificationType } from "@prisma/client";

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string | null;
}

/**
 * Diffuse une notification en temps réel via Supabase Realtime Broadcast.
 */
export async function broadcastNotification(userId: string, notification: any) {
  try {
    const channel = supabase.channel(`notifications:${userId}`);
    await new Promise<void>((resolve) => {
      channel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          channel
            .send({
              type: "broadcast",
              event: "new_notification",
              payload: notification,
            })
            .finally(() => {
              supabase.removeChannel(channel);
              resolve();
            });
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          supabase.removeChannel(channel);
          resolve();
        }
      });

      // Timeout de sécurité pour éviter de bloquer la requête
      setTimeout(() => {
        supabase.removeChannel(channel);
        resolve();
      }, 1500);
    });
  } catch (err) {
    console.error("[Notification] Erreur de diffusion Supabase Realtime:", err);
  }
}

/**
 * Crée une notification en base et l'émet en temps réel.
 */
export async function createNotification({
  userId,
  title,
  message,
  type,
  link,
}: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        link: link || null,
      },
    });

    // Envoi en temps réel (asynchrone, non bloquant)
    broadcastNotification(userId, notification).catch(() => {});

    return notification;
  } catch (error) {
    console.error("[Notification] Erreur lors de la création de la notification:", error);
    throw error;
  }
}

/**
 * Notifie tous les administrateurs du système.
 */
export async function notifyAdmins({
  title,
  message,
  type,
  link,
}: Omit<CreateNotificationParams, "userId">) {
  try {
    // Récupérer tous les rôles administratifs
    const adminRoles = await prisma.role.findMany({
      where: {
        name: {
          in: [
            "SUPER ADMIN",
            "ADMIN",
            "ADMINISTRATEUR",
            "ADMIN RH / MODÉRATEUR",
            "MANAGER IA & CERTIFICATION",
            "GESTIONNAIRE FINANCIER",
            "SUPPORT CLIENT",
          ],
        },
      },
      select: { id: true },
    });

    const adminRoleIds = adminRoles.map((r) => r.id);
    const adminUsers = await prisma.user.findMany({
      where: {
        roleId: { in: adminRoleIds },
        active: true,
      },
      select: { id: true },
    });

    const notifications = await Promise.all(
      adminUsers.map((admin) =>
        createNotification({
          userId: admin.id,
          title,
          message,
          type,
          link,
        }).catch((e) => {
          console.error(`[Notification] Échec pour l'admin ${admin.id}:`, e);
          return null;
        })
      )
    );

    return notifications.filter(Boolean);
  } catch (error) {
    console.error("[Notification] Erreur lors de la notification des admins:", error);
    return [];
  }
}

// -------------------------------------------------------------
// HELPERS SPÉCIFIQUES MÉTIER
// -------------------------------------------------------------

/**
 * Talent : Alerte nouvelle offre d'emploi correspondant à ses compétences
 */
export async function notifyJobAlert(talentUserId: string, jobTitle: string, companyName?: string, jobId?: string) {
  return createNotification({
    userId: talentUserId,
    title: "Nouvelle offre d'emploi",
    message: companyName 
      ? `${companyName} recrute pour le poste "${jobTitle}". Postulez dès maintenant !`
      : `Une nouvelle opportunité "${jobTitle}" est disponible sur Netacuv.`,
    type: "JOB_ALERT",
    link: jobId ? `/talents#emplois` : "/talents#emplois",
  });
}

/**
 * Talent : Changement de statut de sa candidature
 */
export async function notifyApplicationStatus({
  talentUserId,
  jobTitle,
  status,
  companyName,
}: {
  talentUserId: string;
  jobTitle: string;
  status: string;
  companyName?: string;
}) {
  let statusText = "mise à jour";
  if (status === "ACCEPTED" || status === "ACCEPTEE") statusText = "acceptée 🎉";
  else if (status === "REJECTED" || status === "REFUSEE") statusText = "non retenue";
  else if (status === "INTERVIEW" || status === "ENTRETIEN") statusText = "sélectionnée pour un entretien";

  return createNotification({
    userId: talentUserId,
    title: "Statut de candidature mis à jour",
    message: `Votre candidature pour le poste "${jobTitle}"${companyName ? ` chez ${companyName}` : ""} a été ${statusText}.`,
    type: "APPLICATION_STATUS",
    link: "/dashboard/talent#emplois",
  });
}

/**
 * Talent : Rappel d'entretien vidéo à venir
 */
export async function notifyInterviewReminder({
  talentUserId,
  interviewTitle,
}: {
  talentUserId: string;
  interviewTitle?: string;
}) {
  return createNotification({
    userId: talentUserId,
    title: "Rappel d'entretien vidéo IA",
    message: interviewTitle
      ? `N'oubliez pas de passer votre entretien vidéo pour "${interviewTitle}" afin de valoriser votre profil.`
      : "Votre entretien vidéo IA vous attend. Complétez-le pour obtenir vos étoiles de certification !",
    type: "INTERVIEW_REMINDER",
    link: "/interview",
  });
}

/**
 * Recruteur : Nouvelle candidature reçue sur une offre
 */
export async function notifyNewApplication({
  recruiterUserId,
  candidateName,
  jobTitle,
}: {
  recruiterUserId: string;
  candidateName: string;
  jobTitle: string;
}) {
  return createNotification({
    userId: recruiterUserId,
    title: "Nouvelle candidature reçue",
    message: `${candidateName} a postulé à votre offre d'emploi "${jobTitle}".`,
    type: "NEW_APPLICATION",
    link: "/dashboard/recruteur#candidatures",
  });
}

/**
 * Recruteur : Offre arrivant bientôt à expiration
 */
export async function notifyJobExpiringSoon({
  recruiterUserId,
  jobTitle,
  daysLeft = 3,
}: {
  recruiterUserId: string;
  jobTitle: string;
  daysLeft?: number;
}) {
  return createNotification({
    userId: recruiterUserId,
    title: "Offre expirant bientôt",
    message: `Votre offre "${jobTitle}" arrive à expiration dans ${daysLeft} jour${daysLeft > 1 ? "s" : ""}. Pensez à la prolonger si nécessaire.`,
    type: "JOB_EXPIRING_SOON",
    link: "/dashboard/recruteur#mes-offres",
  });
}

/**
 * Recruteur : Récapitulatif hebdomadaire des candidatures reçues
 */
export async function notifyApplicationSummary({
  recruiterUserId,
  count,
}: {
  recruiterUserId: string;
  count: number;
}) {
  return createNotification({
    userId: recruiterUserId,
    title: "Récapitulatif des candidatures",
    message: count > 0
      ? `Vous avez reçu ${count} nouvelle${count > 1 ? "s" : ""} candidature${count > 1 ? "s" : ""} cette semaine.`
      : "Aucune nouvelle candidature reçue cette semaine. Pensez à booster la visibilité de vos offres !",
    type: "APPLICATION_SUMMARY",
    link: "/dashboard/recruteur#candidatures",
  });
}

/**
 * Admin : Nouvelle entreprise en attente de validation
 */
export async function notifyNewCompanyPending({
  companyName,
  email,
}: {
  companyName?: string | null;
  email?: string | null;
}) {
  return notifyAdmins({
    title: "Nouvelle entreprise inscrite",
    message: `L'entreprise "${companyName || "Entreprise"}" (${email || "Nouveau recruteur"}) vient de s'inscrire et attend votre validation.`,
    type: "NEW_COMPANY_PENDING",
    link: "/dashboard/admin/recruteurs",
  });
}

/**
 * Admin / Système : Alerte système globale ou ciblée
 */
export async function notifySystemAlert({
  userId,
  title,
  message,
  link,
}: {
  userId?: string;
  title: string;
  message: string;
  link?: string;
}) {
  if (userId) {
    return createNotification({
      userId,
      title,
      message,
      type: "SYSTEM_ALERT",
      link,
    });
  }

  // Si pas d'userId fourni, avertir les admins
  return notifyAdmins({
    title,
    message,
    type: "SYSTEM_ALERT",
    link,
  });
}
