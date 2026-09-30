import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  console.log("Jobs:", await prisma.jobOffer.count());
}
main().catch(console.error).finally(() => prisma.$disconnect());
