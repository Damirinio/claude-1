import { loginAction } from "./actions";

const ERROR_MESSAGES: Record<string, string> = {
  identifiants: "Adresse e-mail ou mot de passe incorrect.",
  invalide: "Merci de renseigner une adresse e-mail et un mot de passe valides.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; from?: string }>;
}) {
  const params = await searchParams;
  const errorMessage = params.error ? ERROR_MESSAGES[params.error] ?? "Une erreur est survenue." : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">
            CY
          </div>
          <h1 className="text-xl font-semibold text-white">CYS PRO CONSEIL</h1>
          <p className="mt-1 text-sm text-slate-400">Gestion comptable &amp; fiscale</p>
        </div>

        <form action={loginAction} className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <input type="hidden" name="from" value={params.from ?? "/"} />

          {errorMessage && (
            <div className="mb-4 rounded-lg border border-red-900 bg-red-950 px-3 py-2 text-sm text-red-300">
              {errorMessage}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-300">
              Adresse e-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoFocus
              placeholder="prenom.nom@cysproconseil.fr"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-300">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            Se connecter
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-500">
          Accès réservé aux collaborateurs du cabinet CYS PRO CONSEIL.
        </p>
      </div>
    </div>
  );
}
