"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { OverviewTab } from "./OverviewTab";
import { DistribucionesTab } from "./DistribucionesTab";
import { CorrelacionesTab } from "./CorrelacionesTab";
import { ConclusionesTab } from "./ConclusionesTab";
import { Skeleton } from "@/components/ui/Skeleton";
import type { OverviewStats } from "@/lib/dataLoader";
import type { ChartsData } from "./types";

const TAB_OPTIONS = [
  { value: "overview", label: "Overview" },
  { value: "distribuciones", label: "Distribuciones" },
  { value: "correlaciones", label: "Correlaciones" },
  { value: "conclusiones", label: "Conclusiones" },
] as const;

export function AnalisisContent() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [chartsData, setChartsData] = useState<ChartsData | null>(null);
  const [correlation, setCorrelation] = useState<{ columns: string[]; matrix: number[][] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    Promise.all([
      fetch("/api/data?mode=overview").then((r) => r.json()),
      fetch("/api/data?mode=charts").then((r) => r.json()),
      fetch("/api/data?mode=correlation").then((r) => r.json()),
    ])
      .then(([overview, charts, corr]) => {
        setStats(overview);
        setChartsData(charts);
        setCorrelation(corr);
      })
      .catch(() => setError("Error al cargar los datos"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4">
        {error ?? "No se pudieron cargar los datos."}
      </div>
    );
  }

  return (
    <Tabs defaultValue="overview" value={tab} onValueChange={(v) => setTab(v)} className="w-full">
      {/* Mobile: single select */}
      <div className="md:hidden mb-4">
        <select
          value={tab}
          onChange={(e) => setTab(e.target.value)}
          aria-label="Sección de análisis"
          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          {TAB_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      {/* Desktop: tab row */}
      <div className="hidden md:block">
        <TabsList>
          {TAB_OPTIONS.map((o) => (
            <TabsTrigger key={o.value} value={o.value}>
              {o.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {TAB_OPTIONS.map((o) => (
        <TabsContent key={o.value} value={o.value}>
          {o.value === "overview" && <OverviewTab stats={stats} />}
          {o.value === "distribuciones" && <DistribucionesTab data={chartsData} />}
          {o.value === "correlaciones" && (
            <CorrelacionesTab correlation={correlation} chartsData={chartsData} />
          )}
          {o.value === "conclusiones" && <ConclusionesTab stats={stats} />}
        </TabsContent>
      ))}
    </Tabs>
  );
}
