import { LogOut } from "lucide-react";
import { logoutAction } from "@/lib/session-actions";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrateur",
  DIRECTION: "Direction",
  COLLABORATEUR: "Collaborateur",
};

export function Header({ user }: { user: { name: string; role: string } }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
      <div className="md:hidden text-sm font-semibold text-slate-900">CYS PRO CONSEIL</div>
      <div className="hidden md:block" />
      <div className="flex items-center gap-4">
        <div className="text-right leading-tight">
          <p className="text-sm font-medium text-slate-900">{user.name}</p>
          <p className="text-xs text-slate-500">{ROLE_LABELS[user.role] ?? user.role}</p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            title="Se déconnecter"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <LogOut size={16} />
          </button>
        </form>
      </div>
    </header>
  );
}
