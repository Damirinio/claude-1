# CYS PRO CONSEIL — Application de gestion comptable et fiscale

Application interne de pilotage comptable et fiscal pour le cabinet CYS PRO CONSEIL.
Elle centralise les dossiers clients, le calendrier fiscal, les tableaux de suivi
Excel historiques (R23, R10), la gestion documentaire et les procédures internes
du service comptabilité.

## Fonctionnalités

- **Pilotage** (page d'accueil) : indicateurs clés (clients suivis, avancement des
  travaux, échéances à venir, dossiers en retard, documents manquants, déclarations
  en attente, situations particulières, actions prioritaires).
- **Calendrier fiscal 2026** : échéances TVA, IS, CFE, CVAE, liasse fiscale, dépôt
  des comptes annuels, DAS2... reliées à chaque client, avec suivi de statut et
  alertes automatiques configurables (J-30 / J-15 / J-7 / J-1).
- **Tableau R23** : reprise numérique du suivi comptable Excel du cabinet
  (saisie, rapprochement bancaire, situation, TVA, bilan), avec recherche et
  filtres par client, collaborateur, période, statut et type d'opération.
- **Tableau R10** : suivi mensuel de la TVA (collectée, déductible, à payer /
  crédit), vue de synthèse et filtres par mois, client, collaborateur, statut.
- **Gestion documentaire** : classement des documents par client / exercice /
  catégorie, versioning automatique, téléchargement, journal d'audit.
- **Clients** : fiche par dossier avec échéances, suivi R23/R10 et documents liés.
- **Procédures internes** : base de connaissances éditable directement depuis
  l'application, avec historique des versions.

Toute action de mise à jour (statuts, montants, documents, procédures) est
journalisée dans un journal d'audit (utilisateur, date, heure, action).

## Stack technique

- [Next.js 16](https://nextjs.org) (App Router, Server Actions, Turbopack)
- TypeScript, Tailwind CSS
- [Prisma 7](https://www.prisma.io) + SQLite (via `@prisma/adapter-better-sqlite3`)
- Authentification par session (cookie JWT signé, `jose` + `bcryptjs`)

## Démarrage

```bash
npm install
cp .env.example .env   # renseigner SESSION_SECRET en production
npx prisma migrate dev
npx prisma db seed
npm run dev
```

L'application est disponible sur [http://localhost:3000](http://localhost:3000).

### Comptes de démonstration

Le jeu de données de démonstration (`prisma/seed.ts`) crée 12 clients fictifs et
les collaborateurs suivants (mot de passe commun : `CysPro2026!`) :

| Nom            | Rôle           | E-mail                                  |
| -------------- | -------------- | ---------------------------------------- |
| Sophie Martin  | Administrateur | sophie.martin@cysproconseil.fr           |
| Marc Dubois    | Direction      | marc.dubois@cysproconseil.fr             |
| Julien Bernard | Collaborateur  | julien.bernard@cysproconseil.fr          |
| Amina Diallo   | Collaborateur  | amina.diallo@cysproconseil.fr            |

### Notes

- Les dates du calendrier fiscal 2026 sont des échéances de référence utilisées
  par le cabinet pour son suivi interne ; elles doivent être vérifiées au cas par
  cas avec le calendrier officiel de la DGFiP.
- Le client Prisma est généré dans `src/generated/prisma` (non versionné) : lancez
  `npx prisma generate` après chaque `npm install` si le dossier est absent.
- Les documents téléversés sont stockés sur disque dans `storage/documents/`
  (non versionné).
