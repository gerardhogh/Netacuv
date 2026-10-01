import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log("Début du seeding...");

  // 1. Créer ou trouver le rôle Admin
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Administrateur principal du système',
      permissions: JSON.stringify(['ALL']),
    },
  });

  // 2. Créer l'utilisateur Admin
  const passwordHash = await bcrypt.hash('admin@n01', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@netacuv.com' },
    update: {
      passwordHash,
      roleId: adminRole.id,
      active: true,
    },
    create: {
      name: 'Netacuv Admin',
      email: 'admin@netacuv.com',
      passwordHash,
      roleId: adminRole.id,
      active: true,
    },
  });

  console.log('✅ Compte Admin créé/mis à jour avec succès !');
  console.log('Email:', adminUser.email);
  console.log('Mot de passe:', 'admin@n01');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
