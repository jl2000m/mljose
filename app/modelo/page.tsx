import type { Metadata } from "next";
import { ModeloContent } from "./ModeloContent";

export const metadata: Metadata = {
  title: "Modelo Predictivo | Airbnb ML",
  description:
    "Preprocesamiento, comparación de modelos (Random Forest, Gradient Boosting, Regresión Lineal) y evaluación de confiabilidad.",
};

export default function ModeloPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
        Modelo Predictivo
      </h1>
      <ModeloContent />
    </div>
  );
}
