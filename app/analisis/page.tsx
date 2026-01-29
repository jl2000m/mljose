import type { Metadata } from "next";
import { AnalisisContent } from "./AnalisisContent";

export const metadata: Metadata = {
  title: "Análisis Exploratorio | Airbnb ML",
  description: "Overview, distribuciones, correlaciones y conclusiones del dataset Airbnb.",
};

export default function AnalisisPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
        Análisis Exploratorio
      </h1>
      <AnalisisContent />
    </div>
  );
}
