"use client";

import { useState, useEffect } from "react";
import { ModelMetrics } from "@/components/ModelMetrics";
import { Skeleton } from "@/components/ui/Skeleton";
import { PreprocessingSection } from "./PreprocessingSection";
import { ModelCharts } from "./ModelCharts";
import type { ModelMetricsData } from "./types";

export function ModeloContent() {
  const [metrics, setMetrics] = useState<ModelMetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/model-metrics")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("No metrics"))))
      .then(setMetrics)
      .catch(() => setError("No se pudieron cargar las métricas del modelo."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 p-4">
        {error ?? "Ejecuta el script de exportación del modelo para generar model_artifacts/metrics.json."}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <PreprocessingSection />
      <section>
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
          Comparación de modelos
        </h2>
        <ModelMetrics metrics={metrics} />
      </section>
      <ModelCharts metrics={metrics} />
      <section>
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
          Conclusiones y recomendaciones
        </h2>
        <div className="glass-card p-6 space-y-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
          <p>
            El modelo desarrollado ({metrics.bestModel}) es apto como herramienta de apoyo a la
            toma de decisiones: estimaciones iniciales de precio para hosts, comparación relativa
            entre propiedades e identificación de drivers de valor. Se recomienda complementar
            con análisis de ubicación detallada y amenidades. Limitaciones: no incluye datos
            geográficos procesados ni estacionalidad.
          </p>
        </div>
      </section>
    </div>
  );
}
