"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import { ADEN_COLORS } from "@/lib/constants";

// ADEN palette only: red primary, green accent, neutrals
const COLORS = [ADEN_COLORS.red, ADEN_COLORS.green, "#c41e1e", "#22c55e", "#64748b"];

interface HistogramProps {
  data: { bin: string; count: number; label: string }[];
  title?: string;
  xLabel?: string;
  color?: string;
}

export function PriceHistogram({
  data,
  title = "Distribución de precios",
  xLabel = "Rango de precio (USD)",
  color = ADEN_COLORS.red,
}: HistogramProps) {
  return (
    <div className="w-full h-[320px]">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 24 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10 }}
            label={{ value: xLabel, position: "insideBottom", offset: -8 }}
          />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--card-border)",
              borderRadius: "8px",
            }}
          />
          <Bar dataKey="count" fill={color} radius={[2, 2, 0, 0]} name="Frecuencia" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface BoxplotSeries {
  room_type: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  count: number;
}

export function BoxplotByRoomType({
  data,
  title = "Precios por tipo de habitación",
}: {
  data: BoxplotSeries[];
  title?: string;
}) {
  const chartData = data.flatMap((d) => [
    { room_type: d.room_type, value: d.min, type: "min" },
    { room_type: d.room_type, value: d.q1, type: "q1" },
    { room_type: d.room_type, value: d.median, type: "median" },
    { room_type: d.room_type, value: d.q3, type: "q3" },
    { room_type: d.room_type, value: d.max, type: "max" },
  ]);
  return (
    <div className="w-full h-[320px]">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 8, right: 24, left: 80, bottom: 24 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
          <XAxis type="number" tick={{ fontSize: 10 }} />
          <YAxis type="category" dataKey="room_type" width={76} tick={{ fontSize: 10 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--card-border)",
              borderRadius: "8px",
            }}
          />
          <Bar
            dataKey="value"
            fill={ADEN_COLORS.green}
            radius={0}
            name="Precio (USD)"
            fillOpacity={0.8}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PieRoomType({
  data,
  title = "Distribución de tipos de habitación",
}: {
  data: { name: string; value: number }[];
  title?: string;
}) {
  return (
    <div className="w-full h-[320px]">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--card-border)",
              borderRadius: "8px",
            }}
            formatter={(value: number) => [value, "Propiedades"]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CorrelationHeatmap({
  columns,
  matrix,
  title = "Matriz de correlación",
}: {
  columns: string[];
  matrix: number[][];
  title?: string;
}) {
  const cellSize = 36;
  const n = columns.length;
  const getColor = (r: number) => {
    if (r >= 0.5) return ADEN_COLORS.green;
    if (r >= 0.2) return ADEN_COLORS.greenLight;
    if (r >= -0.2) return ADEN_COLORS.grey;
    if (r >= -0.5) return ADEN_COLORS.redLight;
    return ADEN_COLORS.red;
  };

  return (
    <div className="overflow-x-auto">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
        {title}
      </h3>
      <div className="inline-block min-w-0">
        <table className="border-collapse text-xs">
          <thead>
            <tr>
              <th className="p-1 w-8" />
              {columns.map((c) => (
                <th
                  key={c}
                  className="font-medium text-slate-600 dark:text-slate-400 p-1 truncate max-w-[80px]"
                  title={c}
                >
                  {c.replace(/_/g, " ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i}>
                <td
                  className="font-medium text-slate-600 dark:text-slate-400 p-1 truncate max-w-[80px]"
                  title={columns[i]}
                >
                  {columns[i]?.replace(/_/g, " ")}
                </td>
                {row.map((r, j) => (
                  <td
                    key={j}
                    className="text-center align-middle"
                    style={{
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: getColor(r),
                      color: Math.abs(r) > 0.5 ? "white" : "inherit",
                    }}
                    title={`${columns[i]} vs ${columns[j]}: ${r.toFixed(3)}`}
                  >
                    {r.toFixed(2)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ScatterPlot({
  data,
  xLabel = "x",
  yLabel = "y",
  title = "Scatter",
}: {
  data: { x: number; y: number }[];
  xLabel?: string;
  yLabel?: string;
  title?: string;
}) {
  return (
    <div className="w-full h-[320px]">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 8, right: 8, left: 8, bottom: 24 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
          <XAxis
            dataKey="x"
            name={xLabel}
            tick={{ fontSize: 10 }}
            label={{ value: xLabel, position: "insideBottom", offset: -8 }}
          />
          <YAxis
            dataKey="y"
            name={yLabel}
            tick={{ fontSize: 10 }}
            label={{ value: yLabel, angle: -90, position: "insideLeft" }}
          />
          <ZAxis range={[50]} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--card-border)",
              borderRadius: "8px",
            }}
          />
          <Scatter data={data} fill={ADEN_COLORS.red} fillOpacity={0.6} name="Puntos" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
