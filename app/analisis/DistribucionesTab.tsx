"use client";

import { PriceHistogram, BoxplotByRoomType, PieRoomType } from "@/components/Charts";
import { ADEN_COLORS } from "@/lib/constants";
import type { ChartsData } from "./types";

export function DistribucionesTab({ data }: { data: ChartsData | null }) {
  if (!data) {
    return (
      <div className="text-slate-500 dark:text-slate-400 py-8">
        No hay datos de gráficos disponibles.
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="glass-card p-6">
        <PriceHistogram
          data={data.priceHistogram}
          title="Distribución de precios"
          xLabel="Rango de precio (USD)"
        />
      </div>
      <div className="glass-card p-6">
        <BoxplotByRoomType
          data={data.boxplotSeries}
          title="Precios por tipo de habitación (boxplot)"
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <PriceHistogram
            data={data.minimumNightsHistogram}
            title="Distribución de noches mínimas (≤30)"
            xLabel="Noches mínimas"
            color={ADEN_COLORS.red}
          />
        </div>
        <div className="glass-card p-6">
          <PriceHistogram
            data={data.reviewsPerMonthHistogram}
            title="Distribución de reviews por mes"
            xLabel="Reviews/mes"
            color={ADEN_COLORS.green}
          />
        </div>
      </div>
      <div className="glass-card p-6">
        <PieRoomType data={data.roomTypePie} title="Distribución de tipos de habitación" />
      </div>
    </div>
  );
}
