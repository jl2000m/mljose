import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import {
  getOverviewStats,
  getDataForCharts,
  getCorrelationMatrix,
  getRawTable,
  getScatterData,
  type AirbnbRow,
} from "@/lib/dataLoader";

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode"); // overview | charts | correlation | table | scatter
    const skip = Math.max(0, parseInt(searchParams.get("skip") ?? "0", 10));
    const limit = Math.min(500, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10)));
    const xKey = searchParams.get("xKey") ?? "reviews_per_month";
    const yKey = searchParams.get("yKey") ?? "price";

    const data = loadData();

    if (mode === "overview") {
      const stats = getOverviewStats(data);
      return NextResponse.json(stats);
    }

    if (mode === "charts") {
      const charts = getDataForCharts(data);
      return NextResponse.json(charts);
    }

    if (mode === "correlation") {
      const corr = getCorrelationMatrix(data);
      return NextResponse.json(corr);
    }

    if (mode === "table") {
      const result = getRawTable(data, skip, limit);
      return NextResponse.json(result);
    }

    if (mode === "scatter") {
      const scatter = getScatterData(data, xKey, yKey);
      return NextResponse.json(scatter);
    }

    // Full dataset (for client-side use; can be large)
    return NextResponse.json(data);
  } catch (e) {
    console.error("API data error:", e);
    return NextResponse.json(
      { error: "Failed to load data" },
      { status: 500 }
    );
  }
}
