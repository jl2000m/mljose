import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function getReliability(r2: number, mape: number): "confiable" | "parcial" | "mejoras" {
  if (r2 >= 0.5 && mape < 35) return "confiable";
  if (r2 >= 0.2 && mape < 60) return "parcial";
  return "mejoras";
}

function parseMetricasCsv(content: string): { r2: number; rmse: number; mae: number; mape: number } | null {
  const lines = content.trim().split("\n").map((l) => l.split(",").map((c) => c.replace(/^"|"$/g, "").trim()));
  if (lines.length < 5) return null;
  const map = new Map<string, string>();
  for (let i = 1; i < lines.length; i++) {
    const [k, v] = lines[i]!;
    if (k && v != null) map.set(k, v);
  }
  const r2 = parseFloat(map.get("R² Score") ?? "");
  const rmseStr = map.get("RMSE") ?? "";
  const maeStr = map.get("MAE") ?? "";
  const mapeStr = (map.get("MAPE (%)") ?? "").replace("%", "");
  const rmse = parseFloat(rmseStr.replace(/[$,]/g, "")) || 0;
  const mae = parseFloat(maeStr.replace(/[$,]/g, "")) || 0;
  const mape = parseFloat(mapeStr) || 0;
  if (Number.isNaN(r2)) return null;
  return { r2, rmse, mae, mape };
}

function parseComparisonCsv(content: string): { name: string; r2: number; rmse: number; mae: number; mape: number }[] {
  const lines = content.trim().split("\n").map((l) => l.split(",").map((c) => c.replace(/^"|"$/g, "").trim()));
  if (lines.length < 2) return [];
  const rows: { name: string; r2: number; rmse: number; mae: number; mape: number }[] = [];
  const header = lines[0]!;
  const r2Idx = header.findIndex((h) => /R²|R2/i.test(h));
  const rmseIdx = header.findIndex((h) => /RMSE/i.test(h));
  const maeIdx = header.findIndex((h) => /MAE/i.test(h));
  const mapeIdx = header.findIndex((h) => /MAPE/i.test(h));
  const nameIdx = header.findIndex((h) => /Modelo|name/i.test(h));
  if (r2Idx < 0 || mapeIdx < 0 || nameIdx < 0) return [];

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i]!;
    const name = parts[nameIdx] ?? "";
    const r2 = parseFloat(parts[r2Idx] ?? "") || 0;
    const rmse = parseFloat((parts[rmseIdx] ?? "").replace(/[$,]/g, "")) || 0;
    const mae = parseFloat((parts[maeIdx] ?? "").replace(/[$,]/g, "")) || 0;
    const mape = parseFloat((parts[mapeIdx] ?? "").replace("%", "")) || 0;
    rows.push({ name, r2, rmse, mae, mape });
  }
  return rows;
}

const FALLBACK = {
  bestModel: "Gradient Boosting",
  r2: 0.274,
  rmse: 144.28,
  mae: 93.83,
  mape: 56.51,
  models: [
    { name: "Gradient Boosting", r2: 0.274, rmse: 144.28, mae: 93.83, mape: 56.51 },
    { name: "Random Forest", r2: 0.248, rmse: 146.81, mae: 96.21, mape: 57.77 },
    { name: "Linear Regression", r2: 0.119, rmse: 158.98, mae: 106.46, mape: 72.57 },
  ],
  featureImportance: [] as { variable: string; importancia: number }[],
  predictionsVsReal: [] as { real: number; pred: number }[],
  residuals: [] as { pred: number; residual: number }[],
  errorsHistogram: [] as { bin: string; count: number }[],
};

export async function GET() {
  try {
    const metricsPath = path.join(process.cwd(), "model_artifacts", "metrics.json");
    if (fs.existsSync(metricsPath)) {
      const raw = fs.readFileSync(metricsPath, "utf-8");
      const data = JSON.parse(raw);
      return NextResponse.json({ ...data, dataSource: "metrics.json" as const });
    }

    const metricasPath = path.join(process.cwd(), "metricas_modelo.csv");
    const comparisonPath = path.join(process.cwd(), "model_comparison.csv");

    if (fs.existsSync(metricasPath) && fs.existsSync(comparisonPath)) {
      const metricasRaw = fs.readFileSync(metricasPath, "utf-8");
      const comparisonRaw = fs.readFileSync(comparisonPath, "utf-8");
      const metricas = parseMetricasCsv(metricasRaw);
      const models = parseComparisonCsv(comparisonRaw);
      if (metricas && models.length > 0) {
        const best = models[0]!;
        return NextResponse.json({
          bestModel: best.name,
          r2: metricas.r2,
          rmse: metricas.rmse,
          mae: metricas.mae,
          mape: metricas.mape,
          reliability: getReliability(metricas.r2, metricas.mape),
          models: models.map((m) => ({
            name: m.name,
            r2: m.r2,
            rmse: m.rmse,
            mae: m.mae,
            mape: m.mape,
          })),
          featureImportance: [],
          predictionsVsReal: [],
          residuals: [],
          errorsHistogram: [],
          dataSource: "csv" as const,
        });
      }
    }

    const fallback = {
      ...FALLBACK,
      reliability: getReliability(FALLBACK.r2, FALLBACK.mape),
      dataSource: "fallback" as const,
    };
    return NextResponse.json(fallback);
  } catch (e) {
    console.error("model-metrics error:", e);
    return NextResponse.json(
      { error: "Failed to load model metrics" },
      { status: 500 }
    );
  }
}
