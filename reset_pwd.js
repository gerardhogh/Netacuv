const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.seteigcwsvyitnawgarw:geegerard%40TSupabase01@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?pgbouncer=true"
    }
  }
});
async function run() {
  const passwordHash = await bcrypt.hash("Netacuv2026!", 10);
  await prisma.user.update({
    where: { email: 'merveilleagbotou@netacuv.com' },
    data: { passwordHash }
  });
  console.log("Mot de passe réinitialisé avec succès.");
}
run().catch(console.error).finally(() => prisma.$disconnect());
