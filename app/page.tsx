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
    <div className="space-y-16">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-400 dark:to-accent-400 bg-clip-text text-transparent">
          Análisis y Modelo Predictivo Airbnb
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Actividad Integradora de Machine Learning: exploración de datos, modelos
          de regresión y predictor de precios.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
          <GraduationCap className="w-5 h-5 flex-shrink-0" />
          <span>
            {STUDENT.name} · Pasaporte {STUDENT.passport} · {STUDENT.institution}
          </span>
        </div>
      </motion.section>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((item, i) => (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 * (i + 1) }}
          >
            <Link href={item.href}>
              <div className="glass-card p-6 h-full flex flex-col hover:shadow-xl transition-shadow duration-300 group">
                <div className="mb-4 p-3 rounded-lg bg-primary-100 dark:bg-primary-900/30 w-fit group-hover:bg-primary-200 dark:group-hover:bg-primary-800/50 transition-colors">
                  <item.icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  {item.label}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm flex-1">
                  {item.description}
                </p>
                <span className="mt-4 inline-flex items-center text-primary-600 dark:text-primary-400 font-medium text-sm group-hover:underline">
                  Ver más →
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="space-y-8"
      >
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Predictor de precios
        </h2>
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <PredictorForm onResult={handleResult} onError={setError} />
          <div className="flex-1 w-full lg:max-w-xl space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4">
                {error}
              </div>
            )}
            {result && (
              <>
                <div className="glass-card p-6">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                    Precio predicho
                  </p>
                  <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                    ${result.predicted_price.toFixed(2)}
                  </p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    Intervalo aproximado (±MAE): ${result.interval_low.toFixed(2)} – $
                    {result.interval_high.toFixed(2)}
                  </p>
                </div>
                <div className="glass-card p-5">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
                    Recomendación
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {getRecommendation(result.predicted_price, lastInput?.room_type ?? "Entire home/apt")}
                  </p>
                </div>
                {chartData.length > 0 && (
                  <div className="glass-card p-5">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">
                      Distribución de precios en el dataset
                    </h3>
                    <PriceHistogram data={chartData} title="" xLabel="Rango de precio (USD)" />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </motion.section>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center text-sm text-slate-500 dark:text-slate-500 border-t border-slate-200 dark:border-slate-700 pt-8"
      >
        Machine Learning · ADEN International Business School · Enero 2026
      </motion.footer>
    </div>
  );
}
