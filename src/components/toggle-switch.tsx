"use client";

import { useTransition } from "react";
import clsx from "clsx";

export function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => Promise<void>;
  label?: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={isPending}
      onClick={() =>
        startTransition(() => {
          void onChange(!checked);
        })
      }
      className="flex items-center gap-2 disabled:opacity-60"
    >
      <span
        className={clsx(
          "relative inline-flex h-5 w-9 items-center rounded-full transition",
          checked ? "bg-blue-600" : "bg-slate-300",
        )}
      >
        <span
          className={clsx(
            "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition",
            checked ? "translate-x-4.5" : "translate-x-1",
          )}
          style={{ transform: checked ? "translateX(18px)" : "translateX(2px)" }}
        />
      </span>
      {label && <span className="text-xs text-slate-600">{label}</span>}
    </button>
  );
}
