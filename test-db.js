const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const profiles = await prisma.talentProfile.findMany({
    include: { user: true }
  });
  console.log(JSON.stringify(profiles.map(p => ({
    name: p.user.name,
    email: p.user.email,
    cvUrl: p.cvUrl,
    videoUrl: p.videoUrl,
    username: p.username
  })), null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
