"use client";

import { TrendingUp, Home, BarChart2, AlertCircle } from "lucide-react";
import type { OverviewStats } from "@/lib/dataLoader";

export function ConclusionesTab({ stats }: { stats: OverviewStats }) {
  const dominantRoom = Object.entries(stats.roomTypeCounts).sort(
    (a, b) => b[1] - a[1]
  )[0];
  const dominantPct = dominantRoom
    ? ((dominantRoom[1] / stats.totalProperties) * 100).toFixed(1)
    : "0";

  const insights = [
    {
      icon: TrendingUp,
      title: "Asimetría positiva en precios",
      text: "El precio promedio ($" +
        stats.priceMean.toFixed(2) +
        ") es mayor que la mediana ($" +
        stats.priceMedian.toFixed(2) +
        "), lo que indica que propiedades de alto valor elevan el promedio. La mediana es más representativa del precio típico.",
    },
    {
      icon: Home,
      title: "Tipo de habitación dominante",
      text:
        (dominantRoom
          ? `${dominantRoom[0]} domina el dataset con ${dominantPct}% de las propiedades. `
          : "") +
        "La oferta está concentrada en ciertos tipos, lo que afecta la comparabilidad de precios entre categorías.",
    },
    {
      icon: BarChart2,
      title: "Correlaciones débiles con precio",
      text: "Las variables numéricas (reviews_per_month, availability_365, etc.) muestran correlaciones débiles con el precio. El precio depende más de características cualitativas (tipo de habitación, ubicación) que de la popularidad medida por reseñas.",
    },
    {
      icon: AlertCircle,
      title: "Uso del modelo",
      text: "El modelo predictivo es adecuado para estimaciones iniciales y comparación relativa entre propiedades. Se recomienda complementar con análisis de ubicación y amenidades para decisiones finales.",
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
        Insights clave
      </h2>
      <ul className="space-y-4">
        {insights.map((item, i) => (
          <li key={i} className="glass-card p-5 flex gap-4">
            <div className="flex-shrink-0 p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
              <item.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                {item.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {item.text}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
