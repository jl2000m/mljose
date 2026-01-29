/**
 * Data loader for Airbnb dataset.
 * Server: import from lib/airbnb-data.json or use getServerData().
 * Client: fetch /api/data.
 */

import { NUMERIC_COLS } from "./constants";

export interface AirbnbRow {
  id?: number | null;
  name?: string | null;
  host_id?: number | null;
  room_type?: string | null;
  price?: number | null;
  minimum_nights?: number | null;
  number_of_reviews?: number | null;
  reviews_per_month?: number | null;
  availability_365?: number | null;
  calculated_host_listings_count?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  last_review?: string | null;
  [key: string]: unknown;
}

export interface OverviewStats {
  totalProperties: number;
  priceMean: number;
  priceMedian: number;
  priceStd: number;
  roomTypeCounts: Record<string, number>;
}

export interface HistogramBin {
  bin: string;
  count: number;
  label: string;
}

export interface BoxplotSeries {
  room_type: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  count: number;
}

export interface CorrelationMatrix {
  columns: string[];
  matrix: number[][];
}

function loadData(): AirbnbRow[] {
  if (typeof window !== "undefined") return [];
  try {
    const path = require("path");
    const fs = require("fs");
    const filePath = path.join(process.cwd(), "lib", "airbnb-data.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw) as AirbnbRow[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function getOverviewStats(data?: AirbnbRow[]): OverviewStats {
  const rows = data ?? loadData();
  const prices = rows.map((r) => Number(r.price)).filter((n) => !Number.isNaN(n) && n > 0);
  const total = rows.length;
  const sum = prices.reduce((a, b) => a + b, 0);
  const mean = total > 0 ? sum / total : 0;
  const sorted = [...prices].sort((a, b) => a - b);
  const median = sorted.length > 0
    ? sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1]! + sorted[sorted.length / 2]!) / 2
      : sorted[Math.floor(sorted.length / 2)]!
    : 0;
  const variance = prices.length > 0
    ? prices.reduce((acc, p) => acc + (p - mean) ** 2, 0) / prices.length
    : 0;
  const std = Math.sqrt(variance);

  const roomTypeCounts: Record<string, number> = {};
  for (const r of rows) {
    const rt = String(r.room_type ?? "Unknown");
    roomTypeCounts[rt] = (roomTypeCounts[rt] ?? 0) + 1;
  }

  return {
    totalProperties: total,
    priceMean: mean,
    priceMedian: median,
    priceStd: std,
    roomTypeCounts,
  };
}

export function getDataForCharts(data?: AirbnbRow[]) {
  const rows = data ?? loadData();
  const stats = getOverviewStats(rows);

  // Price histogram bins (e.g. 0-50, 50-100, ...)
  const priceBins = 30;
  const maxPrice = Math.min(
    Math.max(...rows.map((r) => Number(r.price) || 0), 0),
    1000
  );
  const step = maxPrice / priceBins || 50;
  const hist: Record<string, number> = {};
  for (let i = 0; i < priceBins; i++) {
    const low = i * step;
    const high = (i + 1) * step;
    hist[`${low.toFixed(0)}-${high.toFixed(0)}`] = 0;
  }
  for (const r of rows) {
    const p = Number(r.price) || 0;
    if (p <= 0 || p > maxPrice) continue;
    const idx = Math.min(Math.floor(p / step), priceBins - 1);
    const low = idx * step;
    const high = (idx + 1) * step;
    const key = `${low.toFixed(0)}-${high.toFixed(0)}`;
    hist[key] = (hist[key] ?? 0) + 1;
  }
  const priceHistogram = Object.entries(hist).map(([bin, count]) => ({
    bin,
    count,
    label: bin,
  }));

  // Boxplot by room_type
  const byRoom: Record<string, number[]> = {};
  for (const r of rows) {
    const rt = String(r.room_type ?? "Unknown");
    const p = Number(r.price);
    if (!Number.isNaN(p) && p > 0) {
      if (!byRoom[rt]) byRoom[rt] = [];
      byRoom[rt].push(p);
    }
  }
  const quartile = (arr: number[], q: number) => {
    const s = [...arr].sort((a, b) => a - b);
    const i = (s.length - 1) * q;
    const lo = Math.floor(i);
    const hi = Math.ceil(i);
    return lo === hi ? s[lo]! : s[lo]! * (1 - (i - lo)) + s[hi]! * (i - lo);
  };
  const boxplotSeries: BoxplotSeries[] = Object.entries(byRoom).map(
    ([room_type, vals]) => {
      const s = [...vals].sort((a, b) => a - b);
      return {
        room_type,
        min: s[0] ?? 0,
        q1: quartile(vals, 0.25),
        median: quartile(vals, 0.5),
        q3: quartile(vals, 0.75),
        max: s[s.length - 1] ?? 0,
        count: s.length,
      };
    }
  );

  // minimum_nights distribution (cap at 30 for display)
  const mnMax = 30;
  const mnHist: Record<number, number> = {};
  for (let i = 0; i <= mnMax; i++) mnHist[i] = 0;
  for (const r of rows) {
    const mn = Math.min(Number(r.minimum_nights) ?? 0, mnMax);
    if (mn >= 0) mnHist[mn] = (mnHist[mn] ?? 0) + 1;
  }
  const minimumNightsHistogram = Object.entries(mnHist).map(([bin, count]) => ({
    bin: String(bin),
    count,
    label: bin,
  }));

  // reviews_per_month distribution
  const rpmValues = rows
    .map((r) => Number(r.reviews_per_month))
    .filter((n) => !Number.isNaN(n));
  const rpmStep = 0.5;
  const rpmHist: Record<string, number> = {};
  for (let i = 0; i <= 20; i++) {
    const low = (i * rpmStep).toFixed(1);
    rpmHist[low] = 0;
  }
  for (const v of rpmValues) {
    const idx = Math.min(Math.floor(v / rpmStep), 20);
    const key = (idx * rpmStep).toFixed(1);
    rpmHist[key] = (rpmHist[key] ?? 0) + 1;
  }
  const reviewsPerMonthHistogram = Object.entries(rpmHist).map(
    ([bin, count]) => ({ bin, count, label: bin })
  );

  // Pie: room_type
  const roomTypePie = Object.entries(stats.roomTypeCounts).map(([name, value]) => ({
    name,
    value,
  }));

  return {
    priceHistogram,
    boxplotSeries,
    minimumNightsHistogram,
    reviewsPerMonthHistogram,
    roomTypePie,
    stats,
  };
}

export function getCorrelationMatrix(data?: AirbnbRow[]): CorrelationMatrix {
  const rows = data ?? loadData();
  const cols = [...NUMERIC_COLS];
  const n = cols.length;
  const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

  const colData = cols.map((c) =>
    rows.map((r) => Number((r as Record<string, unknown>)[c])).filter((v) => !Number.isNaN(v))
  );

  const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / (arr.length || 1);
  const std = (arr: number[]) => {
    const m = mean(arr);
    const v = arr.reduce((a, x) => a + (x - m) ** 2, 0) / (arr.length || 1);
    return Math.sqrt(v) || 1;
  };

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const a = colData[i]!;
      const b = colData[j]!;
      const len = Math.min(a.length, b.length);
      if (len === 0) {
        matrix[i]![j] = 0;
        continue;
      }
      const ma = mean(a);
      const mb = mean(b);
      const sa = std(a);
      const sb = std(b);
      let sum = 0;
      for (let k = 0; k < len; k++) {
        sum += ((a[k]! - ma) / sa) * ((b[k]! - mb) / sb);
      }
      matrix[i]![j] = sum / len;
    }
  }

  return { columns: cols, matrix };
}

export function getRawTable(
  data: AirbnbRow[] | undefined,
  skip: number,
  limit: number
): { rows: AirbnbRow[]; total: number } {
  const rows = data ?? loadData();
  const total = rows.length;
  const slice = rows.slice(skip, skip + limit);
  return { rows: slice, total };
}

export function getScatterData(
  data?: AirbnbRow[],
  xKey: string = "reviews_per_month",
  yKey: string = "price",
  maxPoints: number = 500
) {
  const rows = (data ?? loadData()).filter((r) => {
    const x = Number((r as Record<string, unknown>)[xKey]);
    const y = Number((r as Record<string, unknown>)[yKey]);
    return !Number.isNaN(x) && !Number.isNaN(y) && y <= 500;
  });
  const sample =
    rows.length > maxPoints
      ? rows.sort(() => Math.random() - 0.5).slice(0, maxPoints)
      : rows;
  return sample.map((r) => ({
    x: Number((r as Record<string, unknown>)[xKey]),
    y: Number((r as Record<string, unknown>)[yKey]),
  }));
}
