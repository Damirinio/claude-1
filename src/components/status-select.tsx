"use client";

import { useTransition } from "react";
import clsx from "clsx";
import { STATUT_COLORS, STATUT_LABELS } from "@/lib/constants";

const OPTIONS = ["a_faire", "en_cours", "termine"];

export function StatusSelect({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => Promise<void>;
  disabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={value}
      disabled={disabled || isPending}
      onChange={(e) => {
        const next = e.target.value;
        startTransition(() => {
          void onChange(next);
        });
      }}
      className={clsx(
        "cursor-pointer rounded-full border px-2 py-1 text-xs font-medium outline-none disabled:cursor-wait",
        STATUT_COLORS[value] ?? "bg-slate-100 text-slate-600 border-slate-200",
      )}
    >
      {OPTIONS.map((opt) => (
        <option key={opt} value={opt}>
          {STATUT_LABELS[opt]}
        </option>
      ))}
    </select>
  );
}
