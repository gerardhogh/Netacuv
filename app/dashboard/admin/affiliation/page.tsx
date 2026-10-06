import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AffiliationClient from './AffiliationClient';

export const metadata = {
  title: "Gestion de l'affiliation | Netacuv",
  description: "Configuration et gestion des codes d'affiliation",
};

export default async function AffiliationPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "SUPER ADMIN" && session.user.role !== "ADMIN" && !session.user.role?.includes("FINANCIER"))) {
    redirect("/dashboard");
  }

  // Retrieve global settings
  const settings = await prisma.systemSetting.findMany({
    where: {
      key: { in: ['AFFILIATE_BONUS_FIXED', 'AFFILIATE_BONUS_PERCENT'] }
    }
  });

  const fixedBonus = settings.find(s => s.key === 'AFFILIATE_BONUS_FIXED')?.value || '';
  const percentBonus = settings.find(s => s.key === 'AFFILIATE_BONUS_PERCENT')?.value || '';

  // Retrieve users who have a role or can have affiliation
  // Exclude SUPER ADMIN to keep the list clean if desired, or just show everyone.
  const usersRaw = await prisma.user.findMany({
    where: {
      role: {
        name: { in: ["TALENT", "RECRUTEUR"] }
      }
    },
    select: {
      id: true,
      name: true,
      email: true,
      referralCode: true,
      affiliateBalance: true,
      role: {
        select: { name: true }
      },
      _count: {
        select: { referrals: true }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const users = usersRaw.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    roleName: u.role?.name || null,
    referralCode: u.referralCode,
    affiliateBalance: u.affiliateBalance,
    referralsCount: u._count.referrals
  }));

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Gestion de l'affiliation</h1>
        <p className="text-slate-500 mt-2">Paramétrez les bonus de parrainage et gérez les codes des utilisateurs.</p>
      </div>

      <AffiliationClient 
        users={users} 
        initialFixedBonus={fixedBonus} 
        initialPercentBonus={percentBonus} 
      />
    </div>
  );
}
