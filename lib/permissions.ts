import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function hasPermission(requiredPermission: string): Promise<boolean> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      role: {
        include: {
          rolePermissions: {
            include: { permission: true }
          }
        }
      }
    }
  });

  if (!user || !user.role || !user.role.active) return false;

  // Super Admin or Admin has all permissions
  const roleName = user.role.name.toUpperCase();
  if (roleName === "SUPER ADMIN" || roleName === "ADMIN" || roleName === "ADMINISTRATEUR") return true;

  const hasPerm = user.role.rolePermissions.some(
    (rp: { permission: { code: string } }) => 
      rp.permission.code === requiredPermission || rp.permission.code === "*:*"
  );

  return hasPerm;
}
