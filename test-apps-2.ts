import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const apps = await prisma.application.findMany();
  console.log("Count:", apps.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
