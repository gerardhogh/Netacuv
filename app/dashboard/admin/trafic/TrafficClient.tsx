"use client";

import React, { useState } from "react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Search } from "lucide-react";

interface ChartData {
  date: string;
  Visites: number;
  Uniques: number;
}

interface Visit {
  id: string;
  ip: string | null;
  userAgent: string | null;
  path: string | null;
  visitedAt: Date;
}

export default function TrafficClient({ 
  chartData, 
  recentVisits 
}: { 
  chartData: ChartData[];
  recentVisits: Visit[];
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredVisits = recentVisits.filter(v => 
    (v.ip && v.ip.includes(searchTerm)) || 
    (v.path && v.path.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Évolution sur 7 jours</h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVisites" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorUniques" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{fontSize: 12}} tickFormatter={(val) => {
                const date = new Date(val);
                return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' }).format(date);
              }} />
              <YAxis tick={{fontSize: 12}} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                labelFormatter={(label) => new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(label as string))}
              />
              <Legend />
              <Area type="monotone" dataKey="Visites" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVisites)" />
              <Area type="monotone" dataKey="Uniques" stroke="#10b981" fillOpacity={1} fill="url(#colorUniques)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-800">Dernières visites (50)</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Rechercher par IP ou Chemin..."
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
              <tr>
                <th className="px-5 py-4">Date & Heure</th>
                <th className="px-5 py-4">Adresse IP</th>
                <th className="px-5 py-4">Chemin</th>
                <th className="px-5 py-4">Appareil / Navigateur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredVisits.length > 0 ? (
                filteredVisits.map((visit) => (
                  <tr key={visit.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">
                      {new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(visit.visitedAt))}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs">{visit.ip}</td>
                    <td className="px-5 py-4 truncate max-w-[200px]" title={visit.path || undefined}>
                      {visit.path}
                    </td>
                    <td className="px-5 py-4 truncate max-w-[300px] text-xs text-slate-500" title={visit.userAgent || undefined}>
                      {visit.userAgent}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-slate-500">
                    Aucune visite trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
