"use client";

import { useState, useEffect } from "react";
import { PredictorForm, type PredictResult } from "@/components/PredictorForm";
import { PriceHistogram } from "@/components/Charts";

function getRecommendation(
  price: number,
  datasetMedian: number | undefined
): string {
  if (datasetMedian == null || datasetMedian <= 0) {
    return "La estimación se basa en el promedio de precios del dataset para este tipo de habitación. Usa el intervalo como referencia de variación típica.";
  }
  if (price < datasetMedian * 0.7)
    return "Precio bajo respecto a la mediana del tipo de habitación en el dataset. Puede ser una buena opción para huéspedes con presupuesto limitado.";
  if (price > datasetMedian * 1.3)
    return "Precio alto respecto a la mediana del tipo de habitación. Asegúrate de ofrecer valor diferenciado (ubicación, amenidades, calidad) para justificar el precio.";
  return "Precio dentro del rango típico para este tipo de habitación en el dataset. Recomendable para una estrategia equilibrada.";
}

export function PredictorClient() {
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
      .then((data) => {
        setChartData(data.priceHistogram ?? []);
      })
      .catch(() => setChartData([]));
  }, [result]);

  return (
    <div className="space-y-10">
      <PredictorForm onResult={handleResult} onError={setError} />

      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 max-w-xl">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <div className="glass-card p-8 max-w-xl">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
              Precio predicho
            </p>
            <p className="text-4xl font-bold text-primary-600 dark:text-primary-400">
              ${result.predicted_price.toFixed(2)}
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Intervalo aproximado (±MAE): ${result.interval_low.toFixed(2)} – $
              {result.interval_high.toFixed(2)}
            </p>
          </div>

          <div className="glass-card p-6 max-w-xl">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
              Recomendación
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {getRecommendation(result.predicted_price, result.dataset_median)}
            </p>
          </div>

          {chartData.length > 0 && (
            <div className="glass-card p-6 max-w-2xl">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                Comparativo: distribución de precios en el dataset
              </h3>
              <PriceHistogram
                data={chartData}
                title=""
                xLabel="Rango de precio (USD)"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
