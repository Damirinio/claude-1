"use client";

import { useState, useTransition } from "react";

export function EditableAmount({
  value,
  onCommit,
}: {
  value: number;
  onCommit: (value: number) => Promise<void>;
}) {
  const [draft, setDraft] = useState(String(value));
  const [isPending, startTransition] = useTransition();

  return (
    <input
      type="number"
      step="0.01"
      value={draft}
      disabled={isPending}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        const parsed = Number(draft);
        if (Number.isFinite(parsed) && parsed !== value) {
          startTransition(() => {
            void onCommit(parsed);
          });
        } else {
          setDraft(String(value));
        }
      }}
      className="w-28 rounded-lg border border-slate-200 px-2 py-1 text-right text-sm outline-none focus:border-blue-500 disabled:opacity-60"
    />
  );
}
