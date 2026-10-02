import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const defaultRoles = [
  {
    name: 'Super Admin',
    description: 'Administrateur principal du système. Accès total.',
    isSystem: true,
    permissions: [
      { code: '*:*', module: 'System', description: 'Accès total (bypass rules)' }
    ]
  },
  {
    name: 'Admin RH / Modérateur',
    description: 'Valider les annonces d\'emploi et modérer les candidats/recruteurs.',
    isSystem: true,
    permissions: [
      { code: 'jobs:approve', module: 'Jobs', description: 'Approuver les offres' },
      { code: 'jobs:delete', module: 'Jobs', description: 'Supprimer les offres' },
      { code: 'users:read', module: 'Users', description: 'Voir les utilisateurs' },
      { code: 'users:moderate', module: 'Users', description: 'Modérer les utilisateurs' },
      { code: 'reviews:read', module: 'Reviews', description: 'Lire les avis' }
    ]
  },
  {
    name: 'Manager IA & Certification',
    description: 'Gérer les grilles d\'évaluation et les questions des entretiens vidéo IA.',
    isSystem: true,
    permissions: [
      { code: 'ai:configure', module: 'AI', description: 'Configurer l\'IA' },
      { code: 'ai:audit', module: 'AI', description: 'Auditer l\'IA' },
      { code: 'questions:manage', module: 'Questions', description: 'Gérer les questions' },
      { code: 'certifications:read', module: 'Certifications', description: 'Voir les certifications' }
    ]
  },
  {
    name: 'Gestionnaire Financier',
    description: 'Suivi des abonnements Freemium et statut Premium.',
    isSystem: true,
    permissions: [
      { code: 'subscriptions:read', module: 'Finance', description: 'Voir les abonnements' },
      { code: 'payments:refund', module: 'Finance', description: 'Rembourser les paiements' },
      { code: 'metrics:view', module: 'Finance', description: 'Voir les métriques' },
      { code: 'premium:toggle', module: 'Finance', description: 'Activer/Désactiver Premium' }
    ]
  },
  {
    name: 'Support Client',
    description: 'Assistance utilisateur avec accès en lecture seule.',
    isSystem: true,
    permissions: [
      { code: 'users:read', module: 'Users', description: 'Voir les utilisateurs' },
      { code: 'tickets:manage', module: 'Tickets', description: 'Gérer les tickets' },
      { code: 'emails:resend', module: 'Emails', description: 'Renvoyer les emails' }
    ]
  }
];

async function main() {
  console.log("Début du seeding...");

  for (const roleData of defaultRoles) {
    const role = await prisma.role.upsert({
      where: { name: roleData.name },
      update: { description: roleData.description, isSystem: roleData.isSystem },
      create: { name: roleData.name, description: roleData.description, isSystem: roleData.isSystem },
    });

    for (const perm of roleData.permissions) {
      const permission = await prisma.permission.upsert({
        where: { code: perm.code },
        update: { module: perm.module, description: perm.description },
        create: perm,
      });

      const existingLink = await prisma.rolePermission.findFirst({
        where: { roleId: role.id, permissionId: permission.id }
      });
      if (!existingLink) {
        await prisma.rolePermission.create({
          data: { roleId: role.id, permissionId: permission.id }
        });
      }
    }
  }

  const superAdminRole = await prisma.role.findUnique({ where: { name: 'Super Admin' } });
  
  if (superAdminRole) {
    const passwordHash = await bcrypt.hash('admin@n01', 12);
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@netacuv.com' },
      update: { passwordHash, roleId: superAdminRole.id, active: true },
      create: {
        name: 'Netacuv Admin',
        email: 'admin@netacuv.com',
        passwordHash,
        roleId: superAdminRole.id,
        active: true,
      },
    });
    console.log('✅ Compte Admin créé/mis à jour avec succès !');
  }

  console.log('✅ Seeding terminé avec succès !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
