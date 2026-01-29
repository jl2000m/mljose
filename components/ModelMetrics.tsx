"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { ADEN_COLORS } from "@/lib/constants";
import type { ModelMetricsData } from "@/app/modelo/types";

interface ModelMetricsProps {
  metrics: ModelMetricsData;
}

// ADEN: positive framing – green / amber / soft red
const reliabilityConfig = {
  confiable: {
    label: "Listo para producción",
    icon: CheckCircle,
    className: "bg-accent-100 dark:bg-accent-900/30 text-accent-800 dark:text-accent-200 border-accent-200 dark:border-accent-800",
  },
  parcial: {
    label: "Apto para apoyo a decisiones",
    icon: CheckCircle,
    className: "bg-accent-100 dark:bg-accent-900/30 text-accent-800 dark:text-accent-200 border-accent-200 dark:border-accent-800",
  },
  mejoras: {
    label: "Apto para exploración y comparación",
    icon: AlertTriangle,
    className: "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800",
  },
};

export function ModelMetrics({ metrics }: ModelMetricsProps) {
  const config = reliabilityConfig[metrics.reliability];
  const BadgeIcon = config.icon;

  return (
    <div className="space-y-6">
      {metrics.dataSource === "fallback" && (
        <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 px-4 py-3 text-sm">
          Métricas de referencia del script Python. Ejecuta{" "}
          <code className="bg-amber-100 dark:bg-amber-800/50 px-1 rounded">python airbnb_analysis_cursor.py</code> y
          coloca <code className="bg-amber-100 dark:bg-amber-800/50 px-1 rounded">metricas_modelo.csv</code> y{" "}
          <code className="bg-amber-100 dark:bg-amber-800/50 px-1 rounded">model_comparison.csv</code> en la raíz del
          proyecto para ver las métricas de tu propio entrenamiento.
        </div>
      )}
      <div className="flex flex-wrap items-center gap-4">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Mejor modelo:
        </span>
        <span className="font-semibold text-primary-600 dark:text-primary-400">
          {metrics.bestModel}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-medium ${config.className}`}
        >
          <BadgeIcon className="w-4 h-4" />
          {config.label}
        </span>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          Ideal para estimaciones iniciales y comparación entre propiedades.
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            R² Score
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            {metrics.r2.toFixed(4)}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            RMSE
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            ${metrics.rmse.toFixed(2)}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            MAE
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            ${metrics.mae.toFixed(2)}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            MAPE (%)
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            {metrics.mape.toFixed(2)}%
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          Comparación de los 3 modelos
        </h3>

        <div className="glass-card p-6 mb-6">
          <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
            R² Score (mayor es mejor)
          </h4>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics.models}
                margin={{ top: 8, right: 16, left: 8, bottom: 24 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  angle={-12}
                  textAnchor="end"
                  height={56}
                />
                <YAxis domain={[0, "auto"]} tick={{ fontSize: 10 }} width={36} />
                <Tooltip
                  formatter={(value: number) => [value.toFixed(4), "R²"]}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--card-border)",
                    borderRadius: "8px",
                  }}
                />
                <Bar
                  dataKey="r2"
                  name="R² Score"
                  fill={ADEN_COLORS.green}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 mb-6">
          <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
            RMSE y MAE (menor es mejor, USD)
          </h4>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics.models}
                margin={{ top: 8, right: 16, left: 8, bottom: 24 }}
                barCategoryGap="20%"
                barGap={4}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  angle={-12}
                  textAnchor="end"
                  height={56}
                />
                <YAxis tick={{ fontSize: 10 }} width={40} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  formatter={(value: number) => [value.toFixed(2), ""]}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--card-border)",
                    borderRadius: "8px",
                  }}
                  labelFormatter={(label) => label}
                />
                <Legend />
                <Bar dataKey="rmse" name="RMSE ($)" fill={ADEN_COLORS.red} radius={[4, 4, 0, 0]} fillOpacity={0.9} />
                <Bar dataKey="mae" name="MAE ($)" fill={ADEN_COLORS.green} radius={[4, 4, 0, 0]} fillOpacity={0.9} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {metrics.models.map((m) => (
            <div
              key={m.name}
              className={`glass-card p-4 ${
                m.name === metrics.bestModel
                  ? "ring-2 ring-primary-500 dark:ring-primary-400"
                  : ""
              }`}
            >
              <p className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {m.name}
              </p>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <li>R²: {m.r2.toFixed(4)}</li>
                <li>RMSE: ${m.rmse.toFixed(2)}</li>
                <li>MAE: ${m.mae.toFixed(2)}</li>
                <li>MAPE: {m.mape.toFixed(2)}%</li>
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
