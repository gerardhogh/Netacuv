import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const adminRole = await prisma.role.findFirst({ where: { name: 'ADMIN' } });
  if (adminRole) {
    await prisma.role.delete({ where: { id: adminRole.id } });
    console.log("Deleted ADMIN role");
  } else {
    console.log("ADMIN role not found");
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
