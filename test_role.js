const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const newRole = await prisma.role.create({
      data: {
        name: "Test Role " + Date.now(),
        description: "test",
        isSystem: false,
        active: true,
        rolePermissions: {
          create: ["*:*"].map(code => ({
            permission: {
              connectOrCreate: {
                where: { code },
                create: { code, module: 'general' }
              }
            }
          }))
        }
      }
    });
    console.log("Success:", newRole);
  } catch (e) {
    console.error("Error:", e);
  }
}
main();
