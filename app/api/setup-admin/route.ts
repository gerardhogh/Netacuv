import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const key = url.searchParams.get('key');

    // Clé secrète de protection pour que personne d'autre n'exécute ça
    if (key !== 'NetacuvForceSetup2026') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // 1. Créer ou trouver le rôle Admin
    const adminRole = await prisma.role.upsert({
      where: { name: 'ADMIN' },
      update: {},
      create: {
        name: 'ADMIN',
        description: 'Administrateur principal du système',
        isSystem: true,
      },
    });

    // 2. Créer l'utilisateur Admin avec les bons accès
    const passwordHash = await bcrypt.hash('admin@n01', 12);

    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@netacuv.com' },
      update: {
        passwordHash,
        roleId: adminRole.id,
        active: true,
      },
      create: {
        name: 'Netacuv Admin',
        email: 'admin@netacuv.com',
        passwordHash,
        roleId: adminRole.id,
        active: true,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Compte Administrateur mis à jour en production !',
      email: adminUser.email 
    });
  } catch (error: any) {
    console.error('Erreur setup admin:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
