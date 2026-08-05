import clsx from "clsx";
import { STATUT_COLORS, STATUT_LABELS } from "@/lib/constants";

export function StatusBadge({ statut }: { statut: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        STATUT_COLORS[statut] ?? "bg-slate-100 text-slate-600 border-slate-200",
      )}
    >
      {STATUT_LABELS[statut] ?? statut}
    </span>
  );
}
