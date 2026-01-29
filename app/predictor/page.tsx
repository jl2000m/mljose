import type { Metadata } from "next";
import { PredictorClient } from "./PredictorClient";

export const metadata: Metadata = {
  title: "Predictor Interactivo | Airbnb ML",
  description: "Estima el precio de una propiedad Airbnb a partir de sus características.",
};

export default function PredictorPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
        Predictor Interactivo
      </h1>
      <PredictorClient />
    </div>
  );
}
