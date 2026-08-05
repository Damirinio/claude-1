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
  { href: "/calendrier", label: "Calendrier", icon: CalendarDays },
  { href: "/r23", label: "R23", icon: Table2 },
  { href: "/r10", label: "R10", icon: Receipt },
  { href: "/documents", label: "Documents", icon: FolderOpen },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/procedures", label: "Procédures", icon: BookOpen },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-2 py-2 md:hidden">
      {NAV_ITEMS.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition",
              isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600",
            )}
          >
            <Icon size={14} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
