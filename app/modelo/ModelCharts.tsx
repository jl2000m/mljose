"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Legend,
} from "recharts";
import { ADEN_COLORS } from "@/lib/constants";
import type { ModelMetricsData } from "./types";

export function ModelCharts({ metrics }: { metrics: ModelMetricsData }) {
  if (
    !metrics.featureImportance?.length &&
    !metrics.predictionsVsReal?.length &&
    !metrics.residuals?.length &&
    !metrics.errorsHistogram?.length
  ) {
    return null;
  }

  return (
    <section>
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
        Visualizaciones del mejor modelo
      </h2>
      <div className="space-y-8">
        {metrics.featureImportance && metrics.featureImportance.length > 0 && (
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
              Importancia de variables
            </h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={metrics.featureImportance}
                  layout="vertical"
                  margin={{ top: 8, right: 24, left: 100, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="variable" width={96} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="importancia" fill={ADEN_COLORS.green} radius={[0, 2, 2, 0]} name="Importancia" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        {metrics.predictionsVsReal && metrics.predictionsVsReal.length > 0 && (
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
              Predicciones vs valores reales
            </h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 8, right: 8, left: 8, bottom: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                  <XAxis dataKey="real" name="Real" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="pred" name="Predicho" tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Scatter data={metrics.predictionsVsReal} fill={ADEN_COLORS.red} fillOpacity={0.6} name="Puntos" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        {metrics.residuals && metrics.residuals.length > 0 && (
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
              Análisis de residuales
            </h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 8, right: 8, left: 8, bottom: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                  <XAxis dataKey="pred" name="Predicho" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="residual" name="Residual" tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Scatter data={metrics.residuals} fill={ADEN_COLORS.red} fillOpacity={0.6} name="Residuales" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        {metrics.errorsHistogram && metrics.errorsHistogram.length > 0 && (
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
              Distribución de errores
            </h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.errorsHistogram} margin={{ top: 8, right: 8, left: 8, bottom: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                  <XAxis dataKey="bin" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill={ADEN_COLORS.green} radius={[2, 2, 0, 0]} name="Frecuencia" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
