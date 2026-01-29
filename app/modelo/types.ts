export interface ModelMetricsData {
  bestModel: string;
  r2: number;
  rmse: number;
  mae: number;
  mape: number;
  reliability: "confiable" | "parcial" | "mejoras";
  models: { name: string; r2: number; rmse: number; mae: number; mape: number }[];
  featureImportance?: { variable: string; importancia: number }[];
  predictionsVsReal?: { real: number; pred: number }[];
  residuals?: { pred: number; residual: number }[];
  errorsHistogram?: { bin: string; count: number }[];
  /** Source of metrics: real files vs reference fallback. */
  dataSource?: "metrics.json" | "csv" | "fallback";
}
