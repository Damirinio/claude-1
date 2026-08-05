import "server-only";
import { prisma } from "@/lib/db";
import { currentPeriode, effectiveEcheanceStatut } from "@/lib/constants";

export async function getDashboardData() {
  const now = new Date();
  const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const periode = currentPeriode(now);
  const mois = now.getUTCMonth() + 1;
  const annee = now.getUTCFullYear();

  const [
    totalClients,
    echeances,
    ligneR23Periode,
    ligneR10EnAttente,
    ligneR10SituationsParticulieres,
    echeancesCommentees,
    alertesConfig,
  ] = await Promise.all([
    prisma.client.count({ where: { actif: true } }),
    prisma.echeance.findMany({
      include: { client: { select: { id: true, nom: true } } },
      orderBy: { dateEcheance: "asc" },
    }),
    prisma.ligneR23.findMany({
      where: { periode },
      include: { client: { select: { nom: true } } },
    }),
    prisma.ligneR10.findMany({
      where: {
        statutDeclaration: { not: "termine" },
        OR: [{ annee: { lt: annee } }, { annee, mois: { lte: mois } }],
      },
      include: { client: { select: { nom: true } } },
    }),
    prisma.ligneR10.findMany({
      where: { situationParticuliere: { not: null } },
      include: { client: { select: { nom: true } } },
      orderBy: [{ annee: "desc" }, { mois: "desc" }],
      take: 20,
    }),
    prisma.ligneR23.findMany({
      where: { periode, remarques: { not: null } },
      include: { client: { select: { nom: true } } },
    }),
    prisma.alerteConfig.findMany({ orderBy: { joursAvant: "desc" } }),
  ]);

  const echeancesAvecStatut = echeances.map((e) => ({
    ...e,
    statutEffectif: effectiveEcheanceStatut(e.statut, e.dateEcheance, now),
  }));

  const enRetard = echeancesAvecStatut.filter((e) => e.statutEffectif === "en_retard");
  const clientsEnRetard = new Set(enRetard.map((e) => e.clientId));

  const aVenir30j = echeancesAvecStatut.filter(
    (e) => e.statutEffectif !== "termine" && e.statutEffectif !== "en_retard" && e.dateEcheance <= in30,
  );

  const prochaines = [...aVenir30j].sort((a, b) => a.dateEcheance.getTime() - b.dateEcheance.getTime()).slice(0, 8);

  const actionsPrioritaires = [
    ...enRetard.map((e) => ({ ...e, priorite: "retard" as const })),
    ...aVenir30j
      .filter((e) => e.dateEcheance.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000)
      .map((e) => ({ ...e, priorite: "urgent" as const })),
  ]
    .sort((a, b) => a.dateEcheance.getTime() - b.dateEcheance.getTime())
    .slice(0, 10);

  const statutFields = [
    "saisieStatut",
    "rapprochementBancaire",
    "situationStatut",
    "tvaStatut",
    "bilanStatut",
  ] as const;

  const avancementTravaux = ligneR23Periode.length
    ? Math.round(
        (ligneR23Periode.reduce((sum, ligne) => {
          const done = statutFields.filter((field) => ligne[field] === "termine").length;
          return sum + done / statutFields.length;
        }, 0) /
          ligneR23Periode.length) *
          100,
      )
    : 0;

  return {
    now,
    periode,
    totalClients,
    avancementTravaux,
    echeancesAVenirCount: aVenir30j.length,
    dossiersEnRetardCount: clientsEnRetard.size,
    echeancesEnRetardCount: enRetard.length,
    documentsManquantsCount: echeancesCommentees.length,
    declarationsEnAttenteCount: ligneR10EnAttente.length,
    situationsParticulieresCount: ligneR10SituationsParticulieres.length,
    prochainesEcheances: prochaines,
    actionsPrioritaires,
    situationsParticulieres: ligneR10SituationsParticulieres,
    documentsManquantsDetail: echeancesCommentees,
    alertesConfig,
  };
}
