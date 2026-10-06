"use client";

import React, { useState, useEffect } from "react";
import { getMaintenanceMode, toggleMaintenanceMode } from "@/app/actions/maintenance";
import { Wrench } from "lucide-react";

export default function MaintenanceToggle() {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStatus() {
      const status = await getMaintenanceMode();
      setIsMaintenance(status);
      setIsLoading(false);
    }
    fetchStatus();
  }, []);

  const handleToggle = async () => {
    setIsLoading(true);
    const newStatus = !isMaintenance;
    await toggleMaintenanceMode(newStatus);
    setIsMaintenance(newStatus);
    setIsLoading(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
        isMaintenance
          ? "bg-red-100 text-red-700 hover:bg-red-200"
          : "bg-[#F97316] text-white hover:bg-[#EA580C]"
      } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <Wrench size={18} className={isMaintenance ? "text-red-600" : "text-white"} />
      {isLoading
        ? "Chargement..."
        : isMaintenance
        ? "Désactiver maintenance"
        : "Activer maintenance"}
    </button>
  );
}
