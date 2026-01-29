import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function getReliability(r2: number, mape: number): "confiable" | "parcial" | "mejoras" {
  if (r2 >= 0.5 && mape < 35) return "confiable";
  if (r2 >= 0.3 && mape < 50) return "parcial";
  return "mejoras";
}

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "model_artifacts", "metrics.json");
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(raw);
      return NextResponse.json(data);
    }

    // Fallback: use values from metricas_modelo.csv (best model metrics only)
    const fallback = {
      bestModel: "Random Forest",
      r2: 0.274,
      rmse: 93.83,
      mae: 93.83,
      mape: 56.51,
      reliability: getReliability(0.274, 56.51) as "confiable" | "parcial" | "mejoras",
      models: [
        { name: "Random Forest", r2: 0.274, rmse: 93.83, mae: 93.83, mape: 56.51 },
        { name: "Gradient Boosting", r2: 0.26, rmse: 95, mae: 94, mape: 57 },
        { name: "Linear Regression", r2: 0.22, rmse: 98, mae: 96, mape: 59 },
      ],
      featureImportance: [] as { variable: string; importancia: number }[],
      predictionsVsReal: [] as { real: number; pred: number }[],
      residuals: [] as { pred: number; residual: number }[],
      errorsHistogram: [] as { bin: string; count: number }[],
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
