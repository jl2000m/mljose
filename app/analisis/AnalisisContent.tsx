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

export function AnalisisContent() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [chartsData, setChartsData] = useState<ChartsData | null>(null);
  const [correlation, setCorrelation] = useState<{ columns: string[]; matrix: number[][] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        <Skeleton className="h-10 w-96" />
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
    <Tabs defaultValue="overview" className="w-full">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="distribuciones">Distribuciones</TabsTrigger>
        <TabsTrigger value="correlaciones">Correlaciones</TabsTrigger>
        <TabsTrigger value="conclusiones">Conclusiones</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <OverviewTab stats={stats} />
      </TabsContent>
      <TabsContent value="distribuciones">
        <DistribucionesTab data={chartsData} />
      </TabsContent>
      <TabsContent value="correlaciones">
        <CorrelacionesTab correlation={correlation} chartsData={chartsData} />
      </TabsContent>
      <TabsContent value="conclusiones">
        <ConclusionesTab stats={stats} />
      </TabsContent>
    </Tabs>
  );
}
