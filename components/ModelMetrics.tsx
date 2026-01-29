"use client";

import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import type { ModelMetricsData } from "@/app/modelo/types";

interface ModelMetricsProps {
  metrics: ModelMetricsData;
}

// ADEN: green for confiable, amber for parcial, red for mejoras
const reliabilityConfig = {
  confiable: {
    label: "Confiable",
    icon: CheckCircle,
    className: "bg-accent-100 dark:bg-accent-900/30 text-accent-800 dark:text-accent-200 border-accent-200 dark:border-accent-800",
  },
  parcial: {
    label: "Parcialmente confiable",
    icon: AlertTriangle,
    className: "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800",
  },
  mejoras: {
    label: "Requiere mejoras",
    icon: XCircle,
    className: "bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 border-primary-200 dark:border-primary-800",
  },
};

export function ModelMetrics({ metrics }: ModelMetricsProps) {
  const config = reliabilityConfig[metrics.reliability];
  const BadgeIcon = config.icon;

  return (
    <div className="space-y-6">
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
