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
  /** Median price for this room_type in the dataset (for recommendations). */
  dataset_median?: number;
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
          onError?.(data.message ?? data.error ?? "Error al predecir.");
          return;
        }
        if (data.available === false || data.error) {
          onError?.(data.message ?? data.error ?? "Error al predecir.");
          return;
        }
        onResult(
          {
            predicted_price: data.predicted_price,
            interval_low: data.interval_low,
            interval_high: data.interval_high,
            mae: data.mae,
            dataset_median: data.dataset_median,
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

  const inputBase =
    "w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-4 py-3 sm:py-2.5 text-base sm:text-sm transition-[border-color,box-shadow] focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/25 dark:focus:border-primary-400 dark:focus:ring-primary-400/25";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 sm:space-y-5 glass-card p-5 sm:p-6 max-w-xl w-full"
    >
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
          Predictor de precios
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Completa los campos para estimar el precio de una propiedad.
        </p>
      </div>

      <div>
        <label htmlFor="room_type" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Tipo de habitación
        </label>
        <select
          id="room_type"
          value={values.room_type}
          onChange={(e) => update("room_type", e.target.value)}
          className={`${inputBase} cursor-pointer`}
          aria-describedby={errors.room_type ? "room_type-error" : undefined}
        >
          {ROOM_TYPES.map((rt) => (
            <option key={rt} value={rt}>
              {rt}
            </option>
          ))}
        </select>
        {errors.room_type && (
          <p id="room_type-error" className="mt-1.5 text-sm text-red-600 dark:text-red-400" role="alert">
            {errors.room_type}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="minimum_nights" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Noches mínimas
          </label>
          <input
            id="minimum_nights"
            type="number"
            min={0}
            max={365}
            value={values.minimum_nights}
            onChange={(e) => update("minimum_nights", parseInt(e.target.value, 10) || 0)}
            className={inputBase}
            aria-describedby={errors.minimum_nights ? "minimum_nights-error" : undefined}
          />
          {errors.minimum_nights && (
            <p id="minimum_nights-error" className="mt-1.5 text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.minimum_nights}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="number_of_reviews" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Número de reseñas
          </label>
          <input
            id="number_of_reviews"
            type="number"
            min={0}
            value={values.number_of_reviews}
            onChange={(e) => update("number_of_reviews", parseInt(e.target.value, 10) || 0)}
            className={inputBase}
            aria-describedby={errors.number_of_reviews ? "number_of_reviews-error" : undefined}
          />
          {errors.number_of_reviews && (
            <p id="number_of_reviews-error" className="mt-1.5 text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.number_of_reviews}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="reviews_per_month" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
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
            className={inputBase}
            aria-describedby={errors.reviews_per_month ? "reviews_per_month-error" : undefined}
          />
          {errors.reviews_per_month && (
            <p id="reviews_per_month-error" className="mt-1.5 text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.reviews_per_month}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="availability_365" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Días disponibles (año)
          </label>
          <input
            id="availability_365"
            type="number"
            min={0}
            max={365}
            value={values.availability_365}
            onChange={(e) => update("availability_365", parseInt(e.target.value, 10) || 0)}
            className={inputBase}
            aria-describedby={errors.availability_365 ? "availability_365-error" : undefined}
          />
          {errors.availability_365 && (
            <p id="availability_365-error" className="mt-1.5 text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.availability_365}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="calculated_host_listings_count" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Listados del host
        </label>
        <input
          id="calculated_host_listings_count"
          type="number"
          min={0}
          value={values.calculated_host_listings_count}
          onChange={(e) => update("calculated_host_listings_count", parseInt(e.target.value, 10) || 0)}
          className={inputBase}
          aria-describedby={errors.calculated_host_listings_count ? "calculated_host_listings_count-error" : undefined}
        />
        {errors.calculated_host_listings_count && (
          <p id="calculated_host_listings_count-error" className="mt-1.5 text-sm text-red-600 dark:text-red-400" role="alert">
            {errors.calculated_host_listings_count}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 disabled:opacity-50 disabled:pointer-events-none text-white font-semibold py-3.5 sm:py-3 px-4 text-base sm:text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 min-h-[48px] sm:min-h-0"
      >
        {loading ? "Calculando…" : "Predecir precio"}
      </button>
    </form>
  );
}
