import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AffiliationClient from './AffiliationClient';
import { getTranslations } from 'next-intl/server';

export const metadata = {
  title: "Gestion de l'affiliation | Netacuv",
  description: "Configuration et gestion des codes d'affiliation",
};

export default async function AffiliationPage() {
  const t = await getTranslations("admin.affiliationPage");
  const session = await getServerSession(authOptions);

  const upperRole = (session?.user?.role || "").toUpperCase();
  const isAllowed = upperRole.includes("ADMIN") || upperRole.includes("FINANCIER");

  if (!session || !isAllowed) {
    redirect("/dashboard/admin");
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
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">{t("pageTitle")}</h1>
        <p className="text-slate-500 mt-2">{t("pageSubtitle")}</p>
      </div>

      <AffiliationClient 
        users={users} 
        initialFixedBonus={fixedBonus} 
        initialPercentBonus={percentBonus} 
      />
    </div>
  );
}
