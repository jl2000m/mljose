"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BarChart3, Brain, Calculator, GraduationCap } from "lucide-react";
import { ROUTES, STUDENT } from "@/lib/constants";
import { PredictorForm } from "@/components/PredictorForm";
import { PriceHistogram } from "@/components/Charts";
import { useState, useEffect } from "react";
import type { PredictResult } from "@/components/PredictorForm";

const MEDIAN_BY_ROOM: Record<string, number> = {
  "Entire home/apt": 150,
  "Private room": 70,
  "Shared room": 45,
  "Hotel room": 120,
};

function getRecommendation(price: number, roomType: string): string {
  const median = MEDIAN_BY_ROOM[roomType] ?? 100;
  if (price < median * 0.7)
    return "Precio bajo respecto al promedio del tipo de habitación. Puede ser una buena opción para huéspedes con presupuesto limitado.";
  if (price > median * 1.3)
    return "Precio alto respecto al promedio. Asegúrate de ofrecer valor diferenciado (ubicación, amenidades, calidad) para justificar el precio.";
  return "Precio dentro del rango típico para este tipo de habitación. Recomendable para una estrategia equilibrada.";
}

const cards = [
  {
    href: ROUTES.analisis,
    label: "Análisis Exploratorio",
    description: "KPIs, distribuciones, correlaciones y conclusiones del dataset.",
    icon: BarChart3,
  },
  {
    href: ROUTES.modelo,
    label: "Modelo Predictivo",
    description: "Preprocesamiento, comparación de modelos y evaluación de confiabilidad.",
    icon: Brain,
  },
  {
    href: ROUTES.predictor,
    label: "Predictor Interactivo",
    description: "Estima el precio de una propiedad a partir de sus características.",
    icon: Calculator,
  },
];

export default function HomePage() {
  const [result, setResult] = useState<PredictResult | null>(null);
  const [lastInput, setLastInput] = useState<{ room_type: string } | null>(null);
  const [error, setError] = useState("");
  const [chartData, setChartData] = useState<{ bin: string; count: number; label: string }[]>([]);

  const handleResult = (r: PredictResult, input: { room_type: string }) => {
    setResult(r);
    setLastInput(input);
    setError("");
  };

  useEffect(() => {
    if (!result) return;
    fetch("/api/data?mode=charts")
      .then((res) => res.json())
      .then((data) => setChartData(data.priceHistogram ?? []))
      .catch(() => setChartData([]));
  }, [result]);

  return (
    <div className="min-h-[60vh] space-y-14 sm:space-y-20">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="text-center space-y-5 pt-4 sm:pt-8"
      >
        <p className="text-xs sm:text-sm font-medium uppercase tracking-widest text-primary-600 dark:text-primary-400">
          Machine Learning · Actividad Integradora 1
        </p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-slate-50 max-w-4xl mx-auto leading-[1.1]">
          <span className="bg-gradient-to-r from-primary-600 to-primary-500 dark:from-primary-400 dark:to-primary-300 bg-clip-text text-transparent">
            Análisis y Modelo Predictivo
          </span>
          <br />
          <span className="bg-gradient-to-r from-accent-600 to-accent-500 dark:from-accent-400 dark:to-accent-300 bg-clip-text text-transparent">
            Airbnb
          </span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed px-2">
          Exploración de datos, modelos de regresión y predictor de precios para
          propiedades.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-slate-500 dark:text-slate-500 text-sm sm:text-base">
          <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" aria-hidden />
          <span>
            {STUDENT.name} · Pasaporte {STUDENT.passport} · {STUDENT.institution}
          </span>
        </div>
      </motion.section>

      {/* Predictor section — 2 columns: form + results | 3 nav cards */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-6 sm:space-y-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          {/* Column 1: predictor form + results */}
          <div className="flex flex-col gap-6 w-full lg:max-w-xl">
            <PredictorForm onResult={handleResult} onError={setError} />
            {error && (
              <div
                className="rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 text-sm"
                role="alert"
              >
                {error}
              </div>
            )}
            {result && (
              <div className="space-y-4 sm:space-y-5">
                <div className="glass-card p-5 sm:p-6">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Precio predicho
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400 tabular-nums">
                    ${result.predicted_price.toFixed(2)}
                  </p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    Intervalo (±MAE): ${result.interval_low.toFixed(2)} – $
                    {result.interval_high.toFixed(2)}
                  </p>
                </div>
                <div className="glass-card p-5 sm:p-6">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
                    Recomendación
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {getRecommendation(result.predicted_price, lastInput?.room_type ?? "Entire home/apt")}
                  </p>
                </div>
                {chartData.length > 0 && (
                  <div className="glass-card p-5 sm:p-6">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">
                      Distribución de precios
                    </h3>
                    <PriceHistogram data={chartData} title="" xLabel="Rango de precio (USD)" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Column 2: 3 rows — cards Análisis, Modelo, Predictor */}
          <div className="flex flex-col gap-4 sm:gap-5">
            {cards.map((item, i) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.15 + 0.06 * i, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  href={item.href}
                  className="block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-xl"
                >
                  <div className="glass-card p-5 sm:p-6 w-full flex flex-col sm:flex-row sm:items-center gap-4 transition-all duration-300 group hover:shadow-xl hover:border-slate-300/80 dark:hover:border-slate-500/50 active:scale-[0.99]">
                    <div className="p-3 rounded-xl bg-primary-100/80 dark:bg-primary-900/30 w-fit transition-colors group-hover:bg-primary-200/80 dark:group-hover:bg-primary-800/40 shrink-0">
                      <item.icon className="w-7 h-7 sm:w-8 sm:h-8 text-primary-600 dark:text-primary-400" aria-hidden />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100 mb-1">
                        {item.label}
                      </h2>
                      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                        {item.description}
                      </p>
                      <span className="mt-3 inline-flex items-center gap-1 text-primary-600 dark:text-primary-400 font-medium text-sm group-hover:gap-2 transition-all">
                        Ver más →
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-xs sm:text-sm text-slate-500 dark:text-slate-500 border-t border-slate-200 dark:border-slate-700 pt-6 sm:pt-8 pb-2"
      >
        Machine Learning · ADEN International Business School · Enero 2026
      </motion.footer>
    </div>
  );
}
