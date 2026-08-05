"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, FileText } from "lucide-react";

type Procedure = { id: string; categorie: string; titre: string; updatedAt: Date };

export function ProceduresList({ groups }: { groups: { categorie: string; items: Procedure[] }[] }) {
  const [search, setSearch] = useState("");

  const filteredGroups = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return groups;
    return groups
      .map((g) => ({ ...g, items: g.items.filter((p) => p.titre.toLowerCase().includes(term)) }))
      .filter((g) => g.items.length > 0);
  }, [groups, search]);

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une procédure..."
          className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
        />
      </div>

      {filteredGroups.length === 0 && (
        <p className="py-10 text-center text-sm text-slate-400">Aucune procédure ne correspond à la recherche.</p>
      )}

      {filteredGroups.map((group) => (
        <div key={group.categorie} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <h2 className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-900">{group.categorie}</h2>
          <ul className="divide-y divide-slate-50">
            {group.items.map((p) => (
              <li key={p.id}>
                <Link href={`/procedures/${p.id}`} className="flex items-center gap-3 px-5 py-3 text-sm hover:bg-slate-50">
                  <FileText size={15} className="shrink-0 text-slate-400" />
                  <span className="font-medium text-slate-800">{p.titre}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
