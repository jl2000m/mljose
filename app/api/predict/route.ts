import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import type { AirbnbRow } from "@/lib/dataLoader";

/**
 * Fallback predictor when Python model is not deployed.
 * Uses average price by room_type from the dataset.
 */
function getFallbackPrediction(body: Record<string, unknown>): {
  predicted_price: number;
  interval_low: number;
  interval_high: number;
  mae: number;
} {
  let data: AirbnbRow[] = [];
  try {
    const filePath = path.join(process.cwd(), "lib", "airbnb-data.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    data = JSON.parse(raw) as AirbnbRow[];
  } catch {
    // Default averages if no data
    const defaults: Record<string, number> = {
      "Entire home/apt": 150,
      "Private room": 70,
      "Shared room": 45,
      "Hotel room": 120,
    };
    const room_type = String(body.room_type ?? "Entire home/apt");
    const pred = defaults[room_type] ?? 100;
    const mae = 94;
    return {
      predicted_price: pred,
      interval_low: Math.max(0, pred - mae),
      interval_high: pred + mae,
      mae,
    };
  }

  const room_type = String(body.room_type ?? "Entire home/apt");
  const prices = data
    .filter((r) => String(r.room_type) === room_type)
    .map((r) => Number(r.price))
    .filter((n) => !Number.isNaN(n) && n > 0);

  const mean = prices.length > 0
    ? prices.reduce((a, b) => a + b, 0) / prices.length
    : 100;
  const errors = prices.map((p) => Math.abs(p - mean));
  const mae = errors.length > 0
    ? errors.reduce((a, b) => a + b, 0) / errors.length
    : 94;

  const pred = Math.round(mean * 100) / 100;
  return {
    predicted_price: pred,
    interval_low: Math.max(0, Math.round((pred - mae) * 100) / 100),
    interval_high: Math.round((pred + mae) * 100) / 100,
    mae: Math.round(mae * 100) / 100,
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const result = getFallbackPrediction(body);
    return NextResponse.json(result);
  } catch (e) {
    console.error("predict error:", e);
    return NextResponse.json(
      { error: "Failed to compute prediction" },
      { status: 500 }
    );
  }
}
