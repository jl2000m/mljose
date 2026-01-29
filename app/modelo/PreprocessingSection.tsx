"use client";

import { Database, Filter, Hash, Trash2 } from "lucide-react";

const steps = [
  {
    icon: Trash2,
    title: "Eliminación de columnas",
    text: "Se eliminan name, latitude, longitude, id, host_id y last_review por bajo valor predictivo.",
  },
  {
    icon: Database,
    title: "Imputación",
    text: "Valores nulos en reviews_per_month se reemplazan por 0.",
  },
  {
    icon: Hash,
    title: "Codificación de room_type",
    text: "LabelEncoder convierte los tipos de habitación a códigos numéricos.",
  },
  {
    icon: Filter,
    title: "Filtro de outliers",
    text: "Se excluyen propiedades con precio superior al percentil 99 para reducir el impacto de valores extremos.",
  },
];

export function PreprocessingSection() {
  return (
    <section>
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
        Preprocesamiento
      </h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {steps.map((step, i) => (
          <div key={i} className="glass-card p-5 flex gap-4">
            <div className="flex-shrink-0 p-2 rounded-lg bg-accent-100 dark:bg-accent-900/30">
              <step.icon className="w-6 h-6 text-accent-600 dark:text-accent-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                {step.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{step.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
