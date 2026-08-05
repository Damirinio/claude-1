import { PrismaClient } from "../src/generated/prisma/client";
import { createPrismaAdapter } from "../src/lib/prisma-adapter";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({ adapter: createPrismaAdapter() });

// Date de référence utilisée pour construire un jeu de données réaliste
// (échéances passées / en cours / à venir).
const TODAY = new Date("2026-08-05T00:00:00.000Z");

function d(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day));
}

type Regime = "reel_normal" | "reel_simplifie" | "franchise";

type ClientSeed = {
  nom: string;
  siren: string;
  formeJuridique: string;
  regimeFiscal: "IS" | "IR";
  regimeTVA: Regime;
  dateClotureExercice: string; // MM-DD
  collaborateurIndex: number;
};

const CLIENTS: ClientSeed[] = [
  { nom: "SARL Boulangerie Lefèvre", siren: "412 345 678", formeJuridique: "SARL", regimeFiscal: "IS", regimeTVA: "reel_simplifie", dateClotureExercice: "12-31", collaborateurIndex: 0 },
  { nom: "SAS TechNova Solutions", siren: "521 987 234", formeJuridique: "SAS", regimeFiscal: "IS", regimeTVA: "reel_normal", dateClotureExercice: "12-31", collaborateurIndex: 1 },
  { nom: "EURL Cabinet Architecture Roux", siren: "398 456 112", formeJuridique: "EURL", regimeFiscal: "IS", regimeTVA: "reel_normal", dateClotureExercice: "12-31", collaborateurIndex: 0 },
  { nom: "SCI Les Tilleuls", siren: "804 223 998", formeJuridique: "SCI", regimeFiscal: "IR", regimeTVA: "franchise", dateClotureExercice: "12-31", collaborateurIndex: 2 },
  { nom: "SARL Garage Petit", siren: "437 665 210", formeJuridique: "SARL", regimeFiscal: "IS", regimeTVA: "reel_simplifie", dateClotureExercice: "12-31", collaborateurIndex: 1 },
  { nom: "SAS Digital Wave", siren: "512 334 887", formeJuridique: "SAS", regimeFiscal: "IS", regimeTVA: "reel_normal", dateClotureExercice: "06-30", collaborateurIndex: 2 },
  { nom: "EI Traiteur Dupuis", siren: "789 112 456", formeJuridique: "Entreprise Individuelle", regimeFiscal: "IR", regimeTVA: "reel_simplifie", dateClotureExercice: "12-31", collaborateurIndex: 0 },
  { nom: "SARL Pharmacie du Centre", siren: "356 778 991", formeJuridique: "SARL", regimeFiscal: "IS", regimeTVA: "reel_normal", dateClotureExercice: "12-31", collaborateurIndex: 1 },
  { nom: "SAS GreenBuild Construction", siren: "601 223 447", formeJuridique: "SAS", regimeFiscal: "IS", regimeTVA: "reel_normal", dateClotureExercice: "12-31", collaborateurIndex: 2 },
  { nom: "SARL Institut Beauté Éclat", siren: "445 667 882", formeJuridique: "SARL", regimeFiscal: "IS", regimeTVA: "franchise", dateClotureExercice: "12-31", collaborateurIndex: 0 },
  { nom: "SASU Consulting RH Plus", siren: "533 998 761", formeJuridique: "SASU", regimeFiscal: "IS", regimeTVA: "reel_simplifie", dateClotureExercice: "12-31", collaborateurIndex: 1 },
  { nom: "SARL Menuiserie Vasseur", siren: "298 445 673", formeJuridique: "SARL", regimeFiscal: "IS", regimeTVA: "reel_normal", dateClotureExercice: "12-31", collaborateurIndex: 2 },
];

function statutFor(date: Date, forceLate = false): "a_faire" | "en_cours" | "termine" {
  if (date < TODAY) {
    if (forceLate) return "a_faire"; // volontairement en retard pour la démo
    return "termine";
  }
  if (date.getTime() - TODAY.getTime() < 1000 * 60 * 60 * 24 * 10) return "en_cours";
  return "a_faire";
}

async function main() {
  console.log("Nettoyage de la base...");
  await prisma.procedureVersion.deleteMany();
  await prisma.procedure.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.document.deleteMany();
  await prisma.ligneR10.deleteMany();
  await prisma.ligneR23.deleteMany();
  await prisma.echeance.deleteMany();
  await prisma.client.deleteMany();
  await prisma.alerteConfig.deleteMany();
  await prisma.user.deleteMany();

  console.log("Création des utilisateurs...");
  const passwordHash = await bcrypt.hash("CysPro2026!", 10);
  const [direction, julien, amina, marc] = await Promise.all([
    prisma.user.create({
      data: { name: "Sophie Martin", email: "sophie.martin@cysproconseil.fr", passwordHash, role: "ADMIN" },
    }),
    prisma.user.create({
      data: { name: "Julien Bernard", email: "julien.bernard@cysproconseil.fr", passwordHash, role: "COLLABORATEUR" },
    }),
    prisma.user.create({
      data: { name: "Amina Diallo", email: "amina.diallo@cysproconseil.fr", passwordHash, role: "COLLABORATEUR" },
    }),
    prisma.user.create({
      data: { name: "Marc Dubois", email: "marc.dubois@cysproconseil.fr", passwordHash, role: "DIRECTION" },
    }),
  ]);
  const collaborateurs = [julien, amina, marc];

  console.log("Configuration des alertes...");
  await prisma.alerteConfig.createMany({
    data: [
      { joursAvant: 30, actif: true },
      { joursAvant: 15, actif: true },
      { joursAvant: 7, actif: true },
      { joursAvant: 1, actif: true },
    ],
  });

  console.log("Création des clients...");
  const clients = [];
  for (const c of CLIENTS) {
    const client = await prisma.client.create({
      data: {
        nom: c.nom,
        siren: c.siren,
        formeJuridique: c.formeJuridique,
        regimeFiscal: c.regimeFiscal,
        regimeTVA: c.regimeTVA,
        dateClotureExercice: c.dateClotureExercice,
        collaborateurId: collaborateurs[c.collaborateurIndex].id,
      },
    });
    clients.push({ ...client, seed: c });
  }

  console.log("Génération du calendrier fiscal 2026...");
  let lateCounter = 0;
  for (const client of clients) {
    const echeances: {
      type: string;
      libelle: string;
      dateEcheance: Date;
      forceLate?: boolean;
    }[] = [];

    const clotureDecembre = client.dateClotureExercice === "12-31";

    // TVA
    if (client.regimeTVA === "reel_normal") {
      for (let mois = 1; mois <= 12; mois++) {
        const echeanceMois = mois === 12 ? 1 : mois + 1;
        const echeanceAnnee = mois === 12 ? 2027 : 2026;
        if (echeanceAnnee === 2027) continue; // hors périmètre 2026
        echeances.push({
          type: "TVA_CA3",
          libelle: `Déclaration TVA CA3 - période ${String(mois).padStart(2, "0")}/2026`,
          dateEcheance: d(echeanceAnnee, echeanceMois, 24),
        });
      }
    } else if (client.regimeTVA === "reel_simplifie") {
      echeances.push({ type: "TVA_ACOMPTE", libelle: "Acompte TVA (régime simplifié) - juillet", dateEcheance: d(2026, 7, 15) });
      echeances.push({ type: "TVA_ACOMPTE", libelle: "Acompte TVA (régime simplifié) - décembre", dateEcheance: d(2026, 12, 15) });
      echeances.push({ type: "TVA_CA12", libelle: "Déclaration annuelle de régularisation TVA (CA12) - exercice 2025", dateEcheance: d(2026, 5, 3) });
    }

    if (clotureDecembre) {
      // Impôt sur les sociétés
      if (client.regimeFiscal === "IS") {
        echeances.push({ type: "IS_ACOMPTE", libelle: "1er acompte IS 2026", dateEcheance: d(2026, 3, 15) });
        echeances.push({ type: "IS_ACOMPTE", libelle: "2e acompte IS 2026", dateEcheance: d(2026, 6, 15) });
        echeances.push({ type: "IS_ACOMPTE", libelle: "3e acompte IS 2026", dateEcheance: d(2026, 9, 15) });
        echeances.push({ type: "IS_ACOMPTE", libelle: "4e acompte IS 2026", dateEcheance: d(2026, 12, 15) });
        echeances.push({ type: "IS_SOLDE", libelle: "Solde IS (relevé 2572) - exercice 2025", dateEcheance: d(2026, 5, 15), forceLate: true });
      }

      // Liasse fiscale & dépôt des comptes
      echeances.push({ type: "LIASSE_FISCALE", libelle: "Dépôt de la liasse fiscale - exercice 2025", dateEcheance: d(2026, 5, 20), forceLate: true });
      echeances.push({ type: "DEPOT_COMPTES", libelle: "Dépôt des comptes annuels au greffe - exercice 2025", dateEcheance: d(2026, 7, 31), forceLate: true });
      echeances.push({ type: "DAS2", libelle: "Déclaration DAS2 (honoraires versés) - exercice 2025", dateEcheance: d(2026, 5, 3) });

      // CFE / CVAE
      echeances.push({ type: "CFE_ACOMPTE", libelle: "Acompte CFE 2026", dateEcheance: d(2026, 6, 15) });
      echeances.push({ type: "CFE_SOLDE", libelle: "Solde CFE 2026", dateEcheance: d(2026, 12, 15) });
      if (client.regimeFiscal === "IS" && client.regimeTVA !== "franchise") {
        echeances.push({ type: "CVAE_DECLARATION", libelle: "Déclaration de valeur ajoutée CVAE (n°1330) - exercice 2025", dateEcheance: d(2026, 5, 5), forceLate: true });
        echeances.push({ type: "CVAE_ACOMPTE", libelle: "Acompte CVAE 2026", dateEcheance: d(2026, 6, 15) });
        echeances.push({ type: "CVAE_SOLDE", libelle: "Solde CVAE 2026", dateEcheance: d(2026, 9, 15) });
      }
    } else {
      // Exercice décalé (clôture 30/06)
      echeances.push({ type: "IS_SOLDE", libelle: "Solde IS - exercice clos 30/06/2025", dateEcheance: d(2026, 10, 15) });
      echeances.push({ type: "LIASSE_FISCALE", libelle: "Dépôt de la liasse fiscale - exercice clos 30/06/2025", dateEcheance: d(2026, 9, 30) });
      echeances.push({ type: "DEPOT_COMPTES", libelle: "Dépôt des comptes annuels au greffe - exercice clos 30/06/2025", dateEcheance: d(2027, 1, 31) });
      echeances.push({ type: "CFE_SOLDE", libelle: "Solde CFE 2026", dateEcheance: d(2026, 12, 15) });
    }

    for (const e of echeances) {
      const statut = statutFor(e.dateEcheance, e.forceLate && lateCounter < 9);
      if (e.forceLate && statut === "a_faire" && e.dateEcheance < TODAY) lateCounter++;
      await prisma.echeance.create({
        data: {
          clientId: client.id,
          type: e.type,
          libelle: e.libelle,
          dateEcheance: e.dateEcheance,
          statut,
        },
      });
    }
  }

  console.log("Génération du tableau R23 (suivi comptable)...");
  const periodesR23 = ["2026-03", "2026-04", "2026-05", "2026-06", "2026-07", "2026-08"];
  const statutsPossibles = ["a_faire", "en_cours", "termine"];
  for (const client of clients) {
    for (let i = 0; i < periodesR23.length; i++) {
      const periode = periodesR23[i];
      const isPast = periode < "2026-08";
      const pick = (bias: number) => {
        if (isPast) return Math.random() < 0.85 ? "termine" : statutsPossibles[Math.floor(Math.random() * 2)];
        return statutsPossibles[Math.min(2, Math.floor(Math.random() * bias))];
      };
      await prisma.ligneR23.create({
        data: {
          clientId: client.id,
          collaborateur: collaborateurs[client.seed.collaborateurIndex].name,
          periode,
          typeOperation: i % 3 === 0 ? "revision" : "tenue",
          saisieStatut: pick(3),
          rapprochementBancaire: pick(3),
          situationStatut: pick(2),
          tvaStatut: client.seed.regimeTVA === "franchise" ? "termine" : pick(3),
          bilanStatut: periode === "2026-05" ? pick(2) : "a_faire",
          remarques: i === periodesR23.length - 1 && Math.random() < 0.3 ? "En attente de relevés bancaires du client" : null,
        },
      });
    }
  }

  console.log("Génération du tableau R10 (suivi TVA)...");
  for (const client of clients) {
    if (client.seed.regimeTVA === "franchise") continue;
    for (let mois = 1; mois <= 7; mois++) {
      const collectee = Math.round((2000 + Math.random() * 15000) * 100) / 100;
      const deductible = Math.round((800 + Math.random() * 9000) * 100) / 100;
      const statut = mois <= 6 ? "termine" : Math.random() < 0.6 ? "termine" : "en_cours";
      await prisma.ligneR10.create({
        data: {
          clientId: client.id,
          collaborateur: collaborateurs[client.seed.collaborateurIndex].name,
          mois,
          annee: 2026,
          tvaCollectee: collectee,
          tvaDeductible: deductible,
          statutDeclaration: statut,
          situationParticuliere: Math.random() < 0.08 ? "Crédit de TVA à reporter" : null,
          dateDeclaration: statut === "termine" ? d(2026, mois + 1, 20) : null,
        },
      });
    }
  }

  console.log("Génération des documents...");
  const categories = ["BILAN", "COMPTE_RESULTAT", "LIASSE_FISCALE", "DECLARATION_TVA", "PIECE_COMPTABLE", "COURRIER_FISCAL", "DOCUMENT_CLIENT"];
  for (const client of clients) {
    const docs = [
      { categorie: "BILAN", nom: `Bilan ${client.nom} - exercice 2024`, exercice: "2024" },
      { categorie: "COMPTE_RESULTAT", nom: `Compte de résultat ${client.nom} - exercice 2024`, exercice: "2024" },
      { categorie: "LIASSE_FISCALE", nom: `Liasse fiscale ${client.nom} - exercice 2024`, exercice: "2024" },
      { categorie: "DECLARATION_TVA", nom: `Déclarations TVA - synthèse 2025`, exercice: "2025" },
      { categorie: "PIECE_COMPTABLE", nom: `Relevés bancaires juillet 2026`, exercice: "2026" },
      { categorie: "DOCUMENT_CLIENT", nom: `Pièces transmises par le client - juillet 2026`, exercice: "2026" },
    ];
    for (const doc of docs) {
      await prisma.document.create({
        data: {
          clientId: client.id,
          exercice: doc.exercice,
          categorie: doc.categorie,
          nom: doc.nom,
          uploadedById: collaborateurs[Math.floor(Math.random() * collaborateurs.length)].id,
        },
      });
    }
  }
  void categories;

  console.log("Génération du journal d'audit initial...");
  await prisma.auditLog.createMany({
    data: [
      { userId: direction.id, action: "CREATION", entityType: "CLIENT", details: "Import initial des dossiers clients", entityId: null },
      { userId: julien.id, action: "MISE_A_JOUR", entityType: "LIGNE_R23", details: "Migration des données depuis le fichier Excel R23", entityId: null },
      { userId: amina.id, action: "MISE_A_JOUR", entityType: "LIGNE_R10", details: "Migration des données depuis le fichier Excel R10 (suivi TVA)", entityId: null },
    ],
  });

  console.log("Création de la base de connaissances (procédures internes)...");
  await seedProcedures(direction.id);

  console.log("Terminé.");
}

async function seedProcedures(authorId: string) {
  const procedures: { categorie: string; titre: string; ordre: number; contenu: string }[] = [
    {
      categorie: "Intégration client",
      titre: "Intégration d'un nouveau client",
      ordre: 1,
      contenu: `## Objectif
Garantir une prise en charge structurée de chaque nouveau dossier, depuis la signature de la lettre de mission jusqu'à l'ouverture effective du dossier dans les outils du cabinet.

## Étapes
1. **Ouverture du dossier administratif** : création de la fiche client (identité, SIREN, forme juridique, régime fiscal IS/IR, régime de TVA, date de clôture d'exercice, collaborateur référent) dans l'application.
2. **Collecte des informations juridiques** : statuts, Kbis, PV d'assemblée, RIB, attestation de régime fiscal.
3. **Reprise des données antérieures** : récupération de la dernière balance, du dernier bilan et des déclarations fiscales en cours auprès de l'ancien expert-comptable le cas échéant (lettre de confraternité).
4. **Paramétrage comptable et fiscal** : plan de comptes, échéances fiscales applicables (TVA, IS/IR, CFE, CVAE), périodicité de suivi (R23/R10).
5. **Création des accès et du classement documentaire** : dossier client structuré par exercice et par catégorie de pièces.
6. **Réunion de lancement** avec le client pour fixer les modalités de transmission des pièces et le calendrier de travail.

## Points de contrôle
- Lettre de mission signée et classée.
- Fiche client complète et validée par le collaborateur référent avant tout enregistrement comptable.`,
    },
    {
      categorie: "Collecte des pièces",
      titre: "Récupération des pièces comptables auprès des clients",
      ordre: 2,
      contenu: `## Principe
La qualité du dossier dépend directement de la régularité et de l'exhaustivité de la collecte des pièces.

## Étapes
1. Définir avec le client un mode de transmission unique (dépôt dans l'espace documentaire, boîte mail dédiée, ou coursier pour les pièces papier).
2. Établir une check-list des pièces attendues par période : factures d'achat et de vente, relevés bancaires, pièces de caisse, contrats, bulletins de paie, notes de frais.
3. Enregistrer la date de réception de chaque lot de pièces dans le tableau R23.
4. En cas de pièces manquantes à la date prévue, déclencher la procédure de relance (voir fiche « Relances clients »).

## Fréquence
- Pièces bancaires et comptables courantes : mensuelle.
- Pièces de clôture (inventaire, immobilisations, provisions) : à la clôture de l'exercice, avec délai de collecte d'un mois minimum avant la date cible de bilan.`,
    },
    {
      categorie: "Collecte des pièces",
      titre: "Contrôle de la conformité des documents reçus",
      ordre: 3,
      contenu: `## Objectif
Vérifier, dès réception, que les pièces transmises sont exploitables et conformes avant leur intégration en comptabilité.

## Contrôles à réaliser
1. **Lisibilité** : documents scannés lisibles, non tronqués.
2. **Complétude** : présence de toutes les mentions obligatoires sur les factures (SIREN/SIRET, TVA intracommunautaire, montants HT/TVA/TTC, date).
3. **Cohérence de période** : la pièce correspond bien à la période comptable annoncée.
4. **Doublons** : vérification qu'une pièce déjà saisie n'est pas retransmise.
5. **Rapprochement bancaire préalable** : les relevés couvrent bien l'intégralité du mois sans rupture de solde.

## En cas de non-conformité
Le document est marqué « à corriger » dans la gestion documentaire, un message de relance est envoyé au client en précisant la nature exacte de l'anomalie, et le dossier reste en statut « documents manquants » tant que la pièce n'est pas régularisée.`,
    },
    {
      categorie: "Classement documentaire",
      titre: "Organisation du classement documentaire",
      ordre: 4,
      contenu: `## Arborescence type
Chaque client dispose d'un espace documentaire organisé par **exercice comptable**, puis par **catégorie** :
- Bilans et comptes de résultat
- Liasses fiscales
- Déclarations de TVA
- Pièces comptables (factures, relevés, notes de frais)
- Courriers fiscaux et administratifs
- Documents transmis par le client

## Règles de nommage
Format recommandé : \`NomClient_Categorie_Periode_vX\` (ex. \`TechNova_TVA_2026-06_v1\`).

## Versioning
Toute nouvelle version d'un document remplace la précédente dans l'affichage courant mais l'historique complet (versions antérieures, auteur, date) reste consultable. Aucun document n'est supprimé physiquement sans validation d'un associé.

## Audit
Chaque ajout, modification ou consultation sensible est journalisé automatiquement (utilisateur, date, heure, action) dans le journal d'audit de l'application.`,
    },
    {
      categorie: "Production comptable",
      titre: "Contrôles à effectuer avant saisie comptable",
      ordre: 5,
      contenu: `## Avant toute saisie
1. Vérifier que le lot de pièces est complet pour la période concernée.
2. Contrôler la cohérence du solde de départ avec le solde de clôture de la période précédente.
3. Identifier les opérations atypiques (montants inhabituels, nouveaux tiers, virements internes) à documenter en commentaire.
4. Vérifier le rattachement correct à l'exercice (TVA sur les débits/encaissements, factures à cheval sur deux mois).

## Pendant la saisie
- Respecter le plan de comptes du cabinet et les imputations analytiques définies pour le client.
- Lettrer les comptes de tiers au fil de l'eau.
- Renseigner systématiquement le statut de saisie dans le tableau R23 en fin de session.`,
    },
    {
      categorie: "Production comptable",
      titre: "Contrôles de cohérence périodiques",
      ordre: 6,
      contenu: `## Contrôles mensuels
1. Rapprochement bancaire complet (tous les comptes du client).
2. Contrôle de la TVA collectée/déductible par recoupement avec le chiffre d'affaires et les achats du mois.
3. Analyse des soldes de comptes d'attente (à régulariser sous un mois maximum).
4. Vérification des immobilisations en cours et des amortissements planifiés.

## Contrôles trimestriels
- Analyse de la marge et des charges par rapport au budget ou à N-1.
- Suivi de la trésorerie prévisionnelle.

## Anomalies détectées
Toute anomalie est consignée avec sa nature, la date de détection et le plan d'action, puis suivie jusqu'à résolution (voir fiche « Traitement des anomalies »).`,
    },
    {
      categorie: "TVA",
      titre: "Préparation et suivi des déclarations de TVA",
      ordre: 7,
      contenu: `## Étapes de préparation
1. Clôturer la saisie du mois (ou du trimestre) concerné avant le 10 du mois suivant.
2. Éditer la balance TVA collectée/déductible et la comparer au chiffre d'affaires déclaré.
3. Vérifier les opérations particulières : autoliquidation, TVA intracommunautaire, TVA sur encaissements pour les prestataires de services.
4. Renseigner le tableau R10 (TVA collectée, TVA déductible, TVA à payer ou crédit, statut).
5. Faire valider la déclaration par le collaborateur référent avant télétransmission.
6. Télétransmettre la déclaration dans les délais légaux et archiver l'accusé de dépôt dans la gestion documentaire (catégorie « Déclarations de TVA »).

## Cas particuliers
Crédits de TVA, demandes de remboursement, régularisations de biens immobilisés : à signaler explicitement dans la colonne « situation particulière » du tableau R10 et à documenter par une note dans le dossier.`,
    },
    {
      categorie: "Production comptable",
      titre: "Préparation des situations comptables intermédiaires",
      ordre: 8,
      contenu: `## Objectif
Fournir au client une image fidèle et exploitable de son activité à une date intermédiaire (situation semestrielle, tableau de bord trimestriel, prévisionnel).

## Étapes
1. S'assurer que la comptabilité est à jour jusqu'à la date de situation (saisie et rapprochements bancaires complets).
2. Comptabiliser les écritures d'inventaire simplifiées nécessaires : charges/produits constatés d'avance, provisions estimées, stocks si disponibles.
3. Éditer le bilan et le compte de résultat intermédiaires.
4. Réaliser une analyse commentée (évolution du chiffre d'affaires, de la marge, de la trésorerie) à destination du client.
5. Faire valider la situation par le collaborateur référent avant envoi.`,
    },
    {
      categorie: "Clôture annuelle",
      titre: "Préparation du bilan annuel",
      ordre: 9,
      contenu: `## Calendrier
La préparation du bilan démarre dès la clôture de l'exercice et doit être finalisée au moins 15 jours avant la date limite de dépôt de la liasse fiscale.

## Étapes clés
1. Collecte des pièces de clôture : inventaire physique, relevés bancaires au 31/12, tableaux d'immobilisations, contrats de financement, attestations d'assurance.
2. Écritures d'inventaire : amortissements, provisions, charges et produits à rattacher, stocks, congés payés.
3. Contrôle de cohérence globale (variation des postes de bilan, rapprochement des comptes de tiers, justification des comptes d'attente à zéro).
4. Établissement de la liasse fiscale et calcul de l'impôt (IS ou IR).
5. Revue par un second collaborateur ou un associé avant finalisation (principe du double contrôle).
6. Dépôt de la liasse fiscale et des comptes annuels dans les délais légaux, puis archivage dans la gestion documentaire.`,
    },
    {
      categorie: "Clôture annuelle",
      titre: "Contrôles avant transmission au client",
      ordre: 10,
      contenu: `## Check-list avant envoi
1. Cohérence entre le bilan, le compte de résultat et la liasse fiscale.
2. Concordance des soldes bancaires avec les relevés de fin de période.
3. Vérification orthographique et de présentation des documents transmis.
4. Validation du calcul de l'impôt et des acomptes à venir.
5. Rédaction d'une note de synthèse expliquant les principales évolutions et points d'attention.

## Validation
Aucun document définitif (bilan, liasse, situation) n'est transmis au client sans validation formelle du collaborateur référent, tracée dans le journal d'audit.`,
    },
    {
      categorie: "Relation client",
      titre: "Règles de communication et de suivi avec les clients",
      ordre: 11,
      contenu: `## Principes
- Un point de contact unique et identifié par client (le collaborateur référent).
- Toute demande client reçoit un accusé de réception sous 48h ouvrées.
- Les échanges importants (validations, arbitrages fiscaux, anomalies significatives) sont conservés par écrit dans le dossier.

## Rythme de communication
- Mensuel : point rapide sur l'avancement du dossier et les pièces manquantes.
- Trimestriel : synthèse des indicateurs clés et alertes sur les échéances fiscales à venir.
- Annuel : présentation du bilan et échange sur les perspectives.`,
    },
    {
      categorie: "Organisation interne",
      titre: "Organisation de l'équipe et répartition France / back-office",
      ordre: 12,
      contenu: `## Répartition des tâches
- **Back-office** : saisie comptable courante, rapprochements bancaires, préparation des déclarations de TVA, classement documentaire.
- **Équipe France (collaborateurs référents)** : contrôle et validation des travaux du back-office, relation client, arbitrages fiscaux, préparation et présentation du bilan.
- **Direction / associés** : supervision des dossiers sensibles, validation finale des liasses fiscales, contrôle qualité global du cabinet.

## Principe de double contrôle
Aucun dossier n'est validé par la seule personne qui l'a saisi. Le collaborateur référent (France) contrôle systématiquement les travaux réalisés par le back-office avant transmission au client ou dépôt d'une déclaration.`,
    },
    {
      categorie: "Organisation interne",
      titre: "Contrôles obligatoires avant validation d'un dossier",
      ordre: 13,
      contenu: `## Avant validation d'une déclaration (TVA, IS, liasse)
1. Vérification de la complétude des pièces justificatives.
2. Contrôle de cohérence des montants déclarés avec la comptabilité.
3. Vérification du respect du délai légal de dépôt.
4. Contrôle croisé par un second collaborateur pour les déclarations à enjeu (liasse fiscale, IS, CVAE).
5. Mise à jour du statut correspondant dans le tableau R23 ou R10 et horodatage dans le journal d'audit.`,
    },
    {
      categorie: "Qualité",
      titre: "Méthodes de traitement des anomalies",
      ordre: 14,
      contenu: `## Démarche
1. **Détection** : consignation immédiate de l'anomalie (nature, montant, période concernée) dans le dossier client.
2. **Qualification** : anomalie bloquante (empêche le dépôt d'une déclaration) ou non bloquante (à régulariser au fil de l'eau).
3. **Plan d'action** : désignation d'un responsable et d'une date cible de résolution.
4. **Escalade** : toute anomalie non résolue sous 15 jours ou ayant un impact fiscal significatif est portée à la connaissance du collaborateur référent puis, si nécessaire, d'un associé.
5. **Clôture** : vérification de la correction effective avant classement de l'anomalie.`,
    },
    {
      categorie: "Relation client",
      titre: "Règles de relance pour documents manquants",
      ordre: 15,
      contenu: `## Cadence de relance
- **J+5** après la date attendue de transmission : relance automatique par message dans l'espace client.
- **J+10** : relance téléphonique ou email personnalisé du collaborateur référent.
- **J+20** : information à la direction si le retard menace le respect d'une échéance fiscale.

## Suivi
Chaque relance est tracée (date, canal, contenu) et le statut « documents manquants » du dossier reste visible sur le tableau de pilotage tant que les pièces ne sont pas reçues.`,
    },
    {
      categorie: "Qualité",
      titre: "Bonnes pratiques pour une qualité constante des dossiers",
      ordre: 16,
      contenu: `## Principes généraux
1. Mettre à jour les statuts (R23, R10, échéances) au fil de l'eau plutôt qu'en fin de mois.
2. Documenter systématiquement les choix de traitement comptable ou fiscal non standards.
3. Ne jamais transmettre un document au client sans contrôle préalable par un second collaborateur pour les documents à enjeu.
4. Utiliser les modèles et check-lists du cabinet plutôt que des méthodes personnelles non partagées.
5. Signaler toute difficulté récurrente sur un dossier pour ajuster l'organisation (répartition des tâches, formation, fréquence de suivi).
6. Relire cette base de connaissances à chaque évolution réglementaire significative et proposer sa mise à jour.`,
    },
  ];

  for (const p of procedures) {
    const created = await prisma.procedure.create({
      data: { categorie: p.categorie, titre: p.titre, ordre: p.ordre, contenu: p.contenu },
    });
    await prisma.procedureVersion.create({
      data: { procedureId: created.id, contenu: p.contenu, updatedById: authorId },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
