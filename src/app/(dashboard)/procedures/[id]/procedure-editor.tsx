"use client";

import { useState, useTransition } from "react";
import { Pencil, X } from "lucide-react";
import { renderMarkdown } from "@/lib/markdown";
import { updateProcedureContenu } from "@/lib/actions/procedures";

export function ProcedureEditor({ id, contenu }: { id: string; contenu: string }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(contenu);
  const [isPending, startTransition] = useTransition();

  if (!editing) {
    return (
      <div>
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            <Pencil size={12} /> Modifier cette procédure
          </button>
        </div>
        {renderMarkdown(contenu)}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-slate-500">Édition — Markdown simplifié (## titres, listes -, 1.)</p>
        <button type="button" onClick={() => { setEditing(false); setDraft(contenu); }} className="text-slate-400 hover:text-slate-600">
          <X size={16} />
        </button>
      </div>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={18}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm outline-none focus:border-blue-500"
      />
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await updateProcedureContenu(id, draft);
              setEditing(false);
            })
          }
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60"
        >
          {isPending ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
        <button
          type="button"
          onClick={() => { setEditing(false); setDraft(contenu); }}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
