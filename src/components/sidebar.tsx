"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  LayoutDashboard,
  CalendarDays,
  Table2,
  Receipt,
  FolderOpen,
  Users,
  BookOpen,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Pilotage", icon: LayoutDashboard },
  { href: "/calendrier", label: "Calendrier fiscal", icon: CalendarDays },
  { href: "/r23", label: "Tableau R23", icon: Table2 },
  { href: "/r10", label: "Tableau R10 — TVA", icon: Receipt },
  { href: "/documents", label: "Documents", icon: FolderOpen },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/procedures", label: "Procédures", icon: BookOpen },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-950 md:flex">
      <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
          CY
        </div>
        <div>
          <p className="text-sm font-semibold text-white leading-tight">CYS PRO CONSEIL</p>
          <p className="text-[11px] text-slate-500 leading-tight">Cabinet comptable</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white",
              )}
            >
              <Icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 px-4 py-3 text-[11px] text-slate-600">
        Application interne — usage réservé aux collaborateurs.
      </div>
    </aside>
  );
}
