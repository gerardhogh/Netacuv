import React from "react";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import { Globe, Users, Activity } from "lucide-react";

const TrafficClient = dynamic(() => import("./TrafficClient"), { ssr: false });

export const dynamic = "force-dynamic";

export default async function TraficPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "SUPER ADMIN" && session.user.role !== "ADMIN")) {
    redirect("/connexion");
  }

  // Get total visitors
  const totalVisits = await prisma.visitor.count();

  // Get unique visitors
  const uniqueVisitorsRaw = await prisma.visitor.groupBy({
    by: ['ip'],
    _count: true,
  });
  const uniqueVisitors = uniqueVisitorsRaw.length;

  // Recent visits
  const recentVisits = await prisma.visitor.findMany({
    take: 50,
    orderBy: {
      visitedAt: 'desc'
    }
  });

  // Basic aggregation by day for the chart (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentVisitsForChart = await prisma.visitor.findMany({
    where: {
      visitedAt: {
        gte: sevenDaysAgo
      }
    },
    select: {
      visitedAt: true,
      ip: true
    }
  });

  const dailyDataMap: Record<string, { visits: number, unique: Set<string> }> = {};
  
  // Initialize last 7 days
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    dailyDataMap[dateStr] = { visits: 0, unique: new Set() };
  }

  recentVisitsForChart.forEach(v => {
    const dateStr = v.visitedAt.toISOString().split('T')[0];
    if (dailyDataMap[dateStr]) {
      dailyDataMap[dateStr].visits++;
      if (v.ip) {
        dailyDataMap[dateStr].unique.add(v.ip);
      }
    }
  });

  const chartData = Object.keys(dailyDataMap).sort().map(date => ({
    date,
    Visites: dailyDataMap[date].visits,
    Uniques: dailyDataMap[date].unique.size
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Trafic & Visites</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Globe size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Visites</p>
            <p className="text-2xl font-bold text-slate-800">{totalVisits}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Visiteurs Uniques (IPs)</p>
            <p className="text-2xl font-bold text-slate-800">{uniqueVisitors}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Visites (7 derniers jours)</p>
            <p className="text-2xl font-bold text-slate-800">{recentVisitsForChart.length}</p>
          </div>
        </div>
      </div>

      <TrafficClient chartData={chartData} recentVisits={recentVisits} />
    </div>
  );
}
