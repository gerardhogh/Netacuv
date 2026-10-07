const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.seteigcwsvyitnawgarw:geegerard%40TSupabase01@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?pgbouncer=true"
    }
  }
});
async function test() {
  const user = await prisma.user.findUnique({
    where: { email: 'merveilleagbotou@netacuv.com' },
    include: { accounts: true }
  });
  console.log("User:", user);
}
test().catch(console.error).finally(() => prisma.$disconnect());
