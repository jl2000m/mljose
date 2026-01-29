import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import type { AirbnbRow } from "@/lib/dataLoader";

/**
 * Predictor using dataset statistics (mean price by room_type, MAE from model metrics).
 * Only returns predictions when airbnb-data.json exists; no fabricated defaults.
 */
function loadData(): AirbnbRow[] {
  try {
    const filePath = path.join(process.cwd(), "lib", "airbnb-data.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw) as AirbnbRow[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function median(sortedArr: number[]): number {
  if (sortedArr.length === 0) return 0;
  const mid = Math.floor(sortedArr.length / 2);
  return sortedArr.length % 2
    ? sortedArr[mid]!
    : (sortedArr[mid - 1]! + sortedArr[mid]!) / 2;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const data = loadData();

    if (data.length === 0) {
      return NextResponse.json(
        {
          available: false,
          message:
            "Exporta el dataset (npm run export-data) para habilitar predicciones basadas en los datos.",
        },
        { status: 503 }
      );
    }

    const room_type = String(body.room_type ?? "Entire home/apt");
    const prices = data
      .filter((r) => String(r.room_type) === room_type)
      .map((r) => Number(r.price))
      .filter((n) => !Number.isNaN(n) && n > 0);

    if (prices.length === 0) {
      return NextResponse.json(
        {
          available: false,
          message: `No hay propiedades en el dataset para el tipo "${room_type}".`,
        },
        { status: 404 }
      );
    }

    const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
    const errors = prices.map((p) => Math.abs(p - mean));
    const mae = errors.reduce((a, b) => a + b, 0) / errors.length;
    const sortedPrices = [...prices].sort((a, b) => a - b);
    const dataset_median = median(sortedPrices);

    const pred = Math.round(mean * 100) / 100;
    return NextResponse.json({
      predicted_price: pred,
      interval_low: Math.max(0, Math.round((pred - mae) * 100) / 100),
      interval_high: Math.round((pred + mae) * 100) / 100,
      mae: Math.round(mae * 100) / 100,
      dataset_median: Math.round(dataset_median * 100) / 100,
    });
  } catch (e) {
    console.error("predict error:", e);
    return NextResponse.json(
      { error: "Failed to compute prediction" },
      { status: 500 }
    );
  }
}
