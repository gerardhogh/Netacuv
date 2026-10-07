const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.seteigcwsvyitnawgarw:geegerard%40TSupabase01@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?pgbouncer=true"
    }
  }
});

async function test() {
  const roles = await prisma.role.findMany();
  console.log("Roles Active status:");
  roles.forEach(r => console.log(`${r.name}: active = ${r.active}`));
}
test().catch(console.error).finally(() => prisma.$disconnect());
