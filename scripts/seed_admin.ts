import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@netacuv.com';
  const password = 'admin@n01';
  
  // Ensure the ADMIN role exists
  let adminRole = await prisma.role.findUnique({
    where: { name: 'ADMIN' }
  });
  
  if (!adminRole) {
    adminRole = await prisma.role.create({
      data: { name: 'ADMIN', permissions: '[]' }
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash: hashedPassword,
      roleId: adminRole.id
    },
    create: {
      email,
      name: 'Super Admin',
      passwordHash: hashedPassword,
      roleId: adminRole.id
    }
  });

  console.log('Admin account created/updated successfully:', user.email);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
