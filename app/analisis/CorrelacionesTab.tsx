"use client";

import { useState, useEffect } from "react";
import { CorrelationHeatmap, ScatterPlot } from "@/components/Charts";
import type { ChartsData } from "./types";

export function CorrelacionesTab({
  correlation,
  chartsData,
}: {
  correlation: { columns: string[]; matrix: number[][] } | null;
  chartsData: ChartsData | null;
}) {
  const [scatterData, setScatterData] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    fetch("/api/data?mode=scatter&xKey=reviews_per_month&yKey=price")
      .then((r) => r.json())
      .then(setScatterData)
      .catch(() => setScatterData([]));
  }, []);

  return (
    <div className="space-y-10">
      {correlation && (
        <div className="glass-card p-6">
          <CorrelationHeatmap
            columns={correlation.columns}
            matrix={correlation.matrix}
            title="Matriz de correlación"
          />
        </div>
      )}
      <div className="glass-card p-6">
        <ScatterPlot
          data={scatterData}
          xLabel="Reviews por mes"
          yLabel="Precio (USD)"
          title="Precio vs Reviews mensuales (precios ≤ 500 USD)"
        />
      </div>
    </div>
  );
}
