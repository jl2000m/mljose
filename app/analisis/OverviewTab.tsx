"use client";

import { useState, useEffect } from "react";
import type { OverviewStats } from "@/lib/dataLoader";
import type { AirbnbRow } from "@/lib/dataLoader";

export function OverviewTab({ stats }: { stats: OverviewStats }) {
  const [tableData, setTableData] = useState<{ rows: AirbnbRow[]; total: number } | null>(null);
  const [page, setPage] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    fetch(`/api/data?mode=table&skip=${page * pageSize}&limit=${pageSize}`)
      .then((r) => r.json())
      .then(setTableData)
      .catch(() => setTableData({ rows: [], total: 0 }));
  }, [page]);

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
          KPIs principales
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-card p-4">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Total propiedades
            </p>
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-1">
              {stats.totalProperties.toLocaleString()}
            </p>
          </div>
          <div className="glass-card p-4">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Precio promedio
            </p>
            <p className="text-2xl font-bold text-accent-600 dark:text-accent-400 mt-1">
              ${stats.priceMean.toFixed(2)}
            </p>
          </div>
          <div className="glass-card p-4">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Mediana precio
            </p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1">
              ${stats.priceMedian.toFixed(2)}
            </p>
          </div>
          <div className="glass-card p-4">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Desv. estándar
            </p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1">
              ${stats.priceStd.toFixed(2)}
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
          Estadísticas descriptivas
        </h2>
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <th className="text-left p-3 font-medium">Métrica</th>
                <th className="text-right p-3 font-medium">Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="p-3">Total propiedades</td>
                <td className="p-3 text-right">{stats.totalProperties.toLocaleString()}</td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="p-3">Precio promedio (USD)</td>
                <td className="p-3 text-right">{stats.priceMean.toFixed(2)}</td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="p-3">Precio mediana (USD)</td>
                <td className="p-3 text-right">{stats.priceMedian.toFixed(2)}</td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="p-3">Desviación estándar precio</td>
                <td className="p-3 text-right">{stats.priceStd.toFixed(2)}</td>
              </tr>
              {Object.entries(stats.roomTypeCounts).map(([room, count]) => (
                <tr key={room} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="p-3">Tipo: {room}</td>
                  <td className="p-3 text-right">
                    {count.toLocaleString()} ({((count / stats.totalProperties) * 100).toFixed(1)}%)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
          Tabla de datos (muestra)
        </h2>
        <div className="glass-card overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <th className="text-left p-2 font-medium">room_type</th>
                <th className="text-right p-2 font-medium">price</th>
                <th className="text-right p-2 font-medium">minimum_nights</th>
                <th className="text-right p-2 font-medium">reviews_per_month</th>
                <th className="text-right p-2 font-medium">availability_365</th>
              </tr>
            </thead>
            <tbody>
              {tableData?.rows.map((row, i) => (
                <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="p-2 truncate max-w-[140px]" title={String(row.room_type)}>
                    {String(row.room_type ?? "")}
                  </td>
                  <td className="p-2 text-right">{Number(row.price ?? 0)}</td>
                  <td className="p-2 text-right">{Number(row.minimum_nights ?? 0)}</td>
                  <td className="p-2 text-right">
                    {Number(row.reviews_per_month ?? 0)?.toFixed(2)}
                  </td>
                  <td className="p-2 text-right">{Number(row.availability_365 ?? 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {tableData && tableData.total > pageSize && (
            <div className="flex items-center justify-between p-3 border-t border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-400 text-sm">
                {page * pageSize + 1}–{Math.min((page + 1) * pageSize, tableData.total)} de{" "}
                {tableData.total}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-3 py-1 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 disabled:opacity-50 text-sm font-medium"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={(page + 1) * pageSize >= tableData.total}
                  className="px-3 py-1 rounded-md bg-primary-600 text-white disabled:opacity-50 text-sm font-medium"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
