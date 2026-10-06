import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Gift } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AffiliationPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "SUPER ADMIN" && session.user.role !== "ADMIN" && !session.user.role.includes("FINANCIER"))) {
    redirect("/connexion");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Gift className="text-blue-600" size={28} />
          Gestion de l'affiliation
        </h1>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center">
        <h2 className="text-xl font-semibold text-slate-700 mb-2">Module d'affiliation en cours de développement</h2>
        <p className="text-slate-500 max-w-lg mx-auto">
          Cette page vous permettra de personnaliser les codes promotionnels et les bonus pour que les talents et recruteurs puissent gagner de l'argent.
        </p>
      </div>
    </div>
  );
}
