"use client";

import { AlertTriangle, Loader2, RotateCcw } from "lucide-react";
import { useFarm } from "@/lib/farm-store";

/**
 * Blocks only on the initial fetch. After that, a failed section shows a
 * dismissible-by-retry banner instead of replacing the whole dashboard —
 * one bad endpoint shouldn't take down five working ones.
 */
export function FarmDataGate({ children }: { children: React.ReactNode }) {
  const { loading, errors, sectionLabels, refetch } = useFarm();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-(--brand)" />
      </div>
    );
  }

  const failedKeys = Object.keys(errors) as (keyof typeof errors)[];
  const allFailed = failedKeys.length === sectionLabels.length;

  if (allFailed) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
        <AlertTriangle className="h-6 w-6 text-rose-500" />
        <p className="max-w-sm text-sm text-gray-600">
          Couldn&apos;t reach the server. Check that the backend is running.
        </p>
        <button
          type="button"
          onClick={refetch}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-(--brand) px-4 text-xs font-semibold text-white hover:bg-(--brand-hover)"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Retry
        </button>
      </div>
    );
  }

  return (
    <>
      {failedKeys.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-4 py-2.5 text-xs text-rose-700">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>
            Couldn&apos;t load: {failedKeys.map((k) => sectionLabels.find((s) => s.key === k)?.label ?? k).join(", ")}.
          </span>
          <button
            type="button"
            onClick={refetch}
            className="ml-auto inline-flex items-center gap-1 font-semibold hover:text-rose-900"
          >
            <RotateCcw className="h-3 w-3" /> Retry
          </button>
        </div>
      )}
      {children}
    </>
  );
}
