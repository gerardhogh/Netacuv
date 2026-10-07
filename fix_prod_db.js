const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.seteigcwsvyitnawgarw:geegerard%40TSupabase01@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?pgbouncer=true"
    }
  }
});

async function main() {
  console.log("Connecté à la base de données de production.");

  // 1. Liste des utilisateurs et rôles
  const users = await prisma.user.findMany({
    include: { role: true }
  });
  console.log("Utilisateurs en production :");
  for (const u of users) {
    console.log(`- ${u.email} | Rôle: ${u.role ? u.role.name : 'Aucun'} | HasPassword: ${!!u.passwordHash}`);
  }

  // 2. Supprimer admin@gmail.com (ou gmmail.com)
  const userToDelete = users.find(u => u.email === 'admin@gmail.com' || u.email === 'admin@gmmail.com');
  if (userToDelete) {
    console.log(`Suppression de ${userToDelete.email}...`);
    // Supprimer les logs d'audit associés si cascade pas activé
    await prisma.auditLog.deleteMany({ where: { by: userToDelete.email } });
    await prisma.user.delete({ where: { email: userToDelete.email } });
    console.log(`Supprimé.`);
  }

  // 3. Modifier le rôle de admin@netacuv.com en "Super Admin"
  const adminNetacuv = users.find(u => u.email === 'admin@netacuv.com');
  const superAdminRole = await prisma.role.findUnique({ where: { name: 'Super Admin' } });
  
  if (adminNetacuv && superAdminRole) {
    if (adminNetacuv.roleId !== superAdminRole.id) {
      console.log(`Mise à jour de admin@netacuv.com vers Super Admin...`);
      await prisma.user.update({
        where: { email: 'admin@netacuv.com' },
        data: { roleId: superAdminRole.id }
      });
      console.log(`Mis à jour.`);
    } else {
      console.log(`admin@netacuv.com est déjà Super Admin.`);
    }
  } else {
    console.log("admin@netacuv.com ou le rôle Super Admin est introuvable.");
  }
  
  // 4. Chercher le rôle Administrateur et voir l'amie
  const adminRole = await prisma.role.findFirst({ where: { name: 'Administrateur' } });
  if (adminRole) {
    const amis = users.filter(u => u.roleId === adminRole.id);
    console.log("Amis avec le rôle Administrateur :", amis.map(a => a.email));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
