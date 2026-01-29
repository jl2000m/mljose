"use client";

import { useState, useCallback } from "react";
import { ROOM_TYPES } from "@/lib/constants";

export interface PredictInput {
  room_type: string;
  minimum_nights: number;
  number_of_reviews: number;
  reviews_per_month: number;
  availability_365: number;
  calculated_host_listings_count: number;
}

const defaultValues: PredictInput = {
  room_type: "Entire home/apt",
  minimum_nights: 1,
  number_of_reviews: 0,
  reviews_per_month: 0,
  availability_365: 365,
  calculated_host_listings_count: 1,
};

export interface PredictResult {
  predicted_price: number;
  interval_low: number;
  interval_high: number;
  mae: number;
}

interface PredictorFormProps {
  onResult: (result: PredictResult, input: PredictInput) => void;
  onError?: (message: string) => void;
}

function validate(input: PredictInput): string | null {
  if (input.minimum_nights < 0 || input.minimum_nights > 365)
    return "Noches mínimas debe estar entre 0 y 365.";
  if (input.number_of_reviews < 0)
    return "Número de reseñas no puede ser negativo.";
  if (input.reviews_per_month < 0 || input.reviews_per_month > 50)
    return "Reviews por mes debe estar entre 0 y 50.";
  if (input.availability_365 < 0 || input.availability_365 > 365)
    return "Disponibilidad anual debe estar entre 0 y 365.";
  if (input.calculated_host_listings_count < 0)
    return "Listados del host no puede ser negativo.";
  return null;
}

export function PredictorForm({ onResult, onError }: PredictorFormProps) {
  const [values, setValues] = useState<PredictInput>(defaultValues);
  const [errors, setErrors] = useState<Partial<Record<keyof PredictInput, string>>>({});
  const [loading, setLoading] = useState(false);

  const update = useCallback((field: keyof PredictInput, value: string | number) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const err = validate(values);
      if (err) {
        onError?.(err);
        return;
      }
      setLoading(true);
      onError?.("");
      try {
        const res = await fetch("/api/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        const data = await res.json();
        if (!res.ok) {
          onError?.(data.error ?? "Error al predecir.");
          return;
        }
        if (data.error) {
          onError?.(data.error);
          return;
        }
        onResult(
          {
            predicted_price: data.predicted_price,
            interval_low: data.interval_low,
            interval_high: data.interval_high,
            mae: data.mae,
          },
          values
        );
      } catch {
        onError?.("Error de conexión. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    },
    [values, onResult, onError]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5 glass-card p-6 max-w-xl">
      <div>
        <label htmlFor="room_type" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Tipo de habitación
        </label>
        <select
          id="room_type"
          value={values.room_type}
          onChange={(e) => update("room_type", e.target.value)}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          {ROOM_TYPES.map((rt) => (
            <option key={rt} value={rt}>
              {rt}
            </option>
          ))}
        </select>
        {errors.room_type && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.room_type}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="minimum_nights" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Noches mínimas
          </label>
          <input
            id="minimum_nights"
            type="number"
            min={0}
            max={365}
            value={values.minimum_nights}
            onChange={(e) => update("minimum_nights", parseInt(e.target.value, 10) || 0)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {errors.minimum_nights && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.minimum_nights}</p>
          )}
        </div>
        <div>
          <label htmlFor="number_of_reviews" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Número de reseñas
          </label>
          <input
            id="number_of_reviews"
            type="number"
            min={0}
            value={values.number_of_reviews}
            onChange={(e) => update("number_of_reviews", parseInt(e.target.value, 10) || 0)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {errors.number_of_reviews && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.number_of_reviews}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="reviews_per_month" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Reviews por mes
          </label>
          <input
            id="reviews_per_month"
            type="number"
            min={0}
            max={50}
            step={0.1}
            value={values.reviews_per_month}
            onChange={(e) => update("reviews_per_month", parseFloat(e.target.value) || 0)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {errors.reviews_per_month && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.reviews_per_month}</p>
          )}
        </div>
        <div>
          <label htmlFor="availability_365" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Días disponibles (año)
          </label>
          <input
            id="availability_365"
            type="number"
            min={0}
            max={365}
            value={values.availability_365}
            onChange={(e) => update("availability_365", parseInt(e.target.value, 10) || 0)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {errors.availability_365 && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.availability_365}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="calculated_host_listings_count" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Listados del host
        </label>
        <input
          id="calculated_host_listings_count"
          type="number"
          min={0}
          value={values.calculated_host_listings_count}
          onChange={(e) => update("calculated_host_listings_count", parseInt(e.target.value, 10) || 0)}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        {errors.calculated_host_listings_count && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.calculated_host_listings_count}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium py-3 px-4 transition-colors"
      >
        {loading ? "Calculando…" : "Predecir precio"}
      </button>
    </form>
  );
}
