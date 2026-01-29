"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 p-8">
      <AlertCircle className="w-12 h-12 text-red-500 dark:text-red-400" />
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
        Algo salió mal
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 text-center max-w-md">
        {error.message}
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="px-4 py-2 rounded-lg bg-primary-600 text-white font-medium text-sm hover:bg-primary-700 transition-colors"
        >
          Reintentar
        </button>
        <Link
          href="/"
          className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
