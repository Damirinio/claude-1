"use client";

import { useRef, useState } from "react";
import { Plus, UploadCloud, X } from "lucide-react";
import { uploadDocument } from "@/lib/actions/documents";
import { DOCUMENT_CATEGORY_LABELS } from "@/lib/constants";

export function UploadPanel({ clients }: { clients: { id: string; nom: string }[] }) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <UploadCloud size={16} className="text-blue-600" />
          Ajouter un document
        </span>
        {open ? <X size={16} className="text-slate-400" /> : <Plus size={16} className="text-slate-400" />}
      </button>

      {open && (
        <form
          ref={formRef}
          action={async (formData) => {
            await uploadDocument(formData);
            formRef.current?.reset();
            setOpen(false);
          }}
          className="grid grid-cols-1 gap-3 border-t border-slate-100 p-5 md:grid-cols-2 lg:grid-cols-3"
        >
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Client</label>
            <select name="clientId" required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500">
              <option value="">Sélectionner...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.nom}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Exercice</label>
            <input name="exercice" required placeholder="2026" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Catégorie</label>
            <select name="categorie" required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500">
              {Object.entries(DOCUMENT_CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-600">Nom du document</label>
            <input name="nom" required placeholder="Ex : Bilan exercice 2025" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Fichier (optionnel)</label>
            <input name="file" type="file" className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-blue-500" />
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <p className="mb-3 text-xs text-slate-400">
              Si un document existe déjà pour ce client, cet exercice, cette catégorie et ce nom, l&apos;ajout créera
              automatiquement une nouvelle version tout en conservant l&apos;historique.
            </p>
            <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">
              Enregistrer le document
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
