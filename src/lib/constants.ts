export const ECHEANCE_TYPE_LABELS: Record<string, string> = {
  TVA_CA3: "TVA — CA3 mensuelle",
  TVA_ACOMPTE: "TVA — Acompte (régime simplifié)",
  TVA_CA12: "TVA — Régularisation annuelle (CA12)",
  IS_ACOMPTE: "IS — Acompte",
  IS_SOLDE: "IS — Solde (relevé 2572)",
  CFE_ACOMPTE: "CFE — Acompte",
  CFE_SOLDE: "CFE — Solde",
  CVAE_ACOMPTE: "CVAE — Acompte",
  CVAE_SOLDE: "CVAE — Solde",
  CVAE_DECLARATION: "CVAE — Déclaration (n°1330)",
  LIASSE_FISCALE: "Liasse fiscale",
  DEPOT_COMPTES: "Dépôt des comptes annuels (greffe)",
  DAS2: "Déclaration DAS2 (honoraires)",
  AUTRE: "Autre obligation fiscale",
};

export const DOCUMENT_CATEGORY_LABELS: Record<string, string> = {
  BILAN: "Bilan",
  COMPTE_RESULTAT: "Compte de résultat",
  LIASSE_FISCALE: "Liasse fiscale",
  DECLARATION_TVA: "Déclaration de TVA",
  PIECE_COMPTABLE: "Pièce comptable",
  COURRIER_FISCAL: "Courrier fiscal",
  DOCUMENT_CLIENT: "Document transmis par le client",
};

export const STATUT_LABELS: Record<string, string> = {
  a_faire: "À faire",
  en_cours: "En cours",
  termine: "Terminé",
  en_retard: "En retard",
};

export const STATUT_COLORS: Record<string, string> = {
  a_faire: "bg-slate-100 text-slate-600 border-slate-200",
  en_cours: "bg-amber-50 text-amber-700 border-amber-200",
  termine: "bg-emerald-50 text-emerald-700 border-emerald-200",
  en_retard: "bg-red-50 text-red-700 border-red-200",
};

export const REGIME_TVA_LABELS: Record<string, string> = {
  reel_normal: "Réel normal",
  reel_simplifie: "Réel simplifié",
  franchise: "Franchise en base",
};

export const MOIS_LABELS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

/**
 * Statut effectif d'une échéance : une échéance non terminée dont la date est
 * dépassée est considérée "en retard" indépendamment de son statut enregistré.
 */
export function effectiveEcheanceStatut(
  statut: string,
  dateEcheance: Date,
  now: Date = new Date(),
): "a_faire" | "en_cours" | "termine" | "en_retard" {
  if (statut === "termine") return "termine";
  if (dateEcheance.getTime() < now.getTime()) return "en_retard";
  return statut === "en_cours" ? "en_cours" : "a_faire";
}

export function formatDateFr(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" }).format(date);
}

export function formatDateShortFr(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

export function formatEuro(amount: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);
}

export function currentPeriode(now: Date = new Date()) {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}
