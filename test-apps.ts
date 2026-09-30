import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const apps = await prisma.application.findMany({
    include: {
      talent: { include: { user: true } },
      jobOffer: { include: { recruiter: true } }
    }
  });
  console.log(JSON.stringify(apps, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
