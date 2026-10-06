import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const roles = await prisma.role.findMany();
  console.log("Roles:");
  console.table(roles.map(r => ({ id: r.id, name: r.name })));
}
main().catch(console.error).finally(() => prisma.$disconnect());
