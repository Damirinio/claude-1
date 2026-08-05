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
- Les documents téléversés sont stockés sur disque à l'emplacement défini par
  `DOCUMENTS_STORAGE_DIR` (par défaut `storage/documents/`, non versionné).

## Déploiement

L'application utilise SQLite en fichier local : elle a donc besoin d'un
hébergeur avec **disque persistant** (elle ne fonctionne pas telle quelle sur
une plateforme serverless comme Vercel, dont le système de fichiers est
éphémère, sans migrer la base vers un service hébergé type Postgres/Turso).

`npm run build` génère automatiquement le client Prisma (`postinstall`), et
`npm run start` applique les migrations en attente (`prisma migrate deploy`)
avant de démarrer le serveur — aucune étape manuelle n'est nécessaire à chaque
déploiement, hormis la création du jeu de données initial (une seule fois).

### Option recommandée : Railway

1. Sur [railway.com](https://railway.com), **New Project → Deploy from GitHub repo**
   et sélectionnez `Damirinio/claude-1`, branche `main` (ou celle que vous
   souhaitez mettre en production).
2. Railway détecte Next.js automatiquement (Nixpacks) et utilise les scripts
   `build`/`start` du `package.json`.
3. **Ajoutez un volume** (onglet *Volumes*) monté sur `/data`.
4. Renseignez les variables d'environnement du service :
   - `DATABASE_URL` = `file:/data/prod.db`
   - `DOCUMENTS_STORAGE_DIR` = `/data/documents`
   - `SESSION_SECRET` = une chaîne aléatoire longue (`openssl rand -base64 48`)
5. Déployez. Une fois le premier déploiement terminé, initialisez les données
   de démonstration (facultatif) en une seule fois avec le CLI Railway :
   ```bash
   railway run npx prisma db seed
   ```
6. Railway fournit un domaine public (`*.up.railway.app`) dans l'onglet
   *Settings → Networking*.

Coût indicatif : plan Hobby à 5 $/mois (crédit d'usage inclus, généralement
suffisant pour un usage interne de ce type) + un coût marginal de stockage du
volume ([tarifs Railway](https://docs.railway.com/pricing/plans)).

### Alternative : Render

Un blueprint `render.yaml` est fourni à la racine du projet (service web +
disque persistant de 1 Go monté sur `/data`). Sur
[render.com](https://render.com) : **New → Blueprint**, sélectionnez le repo,
Render lit `render.yaml` et propose la configuration prête à valider (le
`SESSION_SECRET` est généré automatiquement). Une fois déployé, lancez le
seed initial depuis l'onglet *Shell* du service :
```bash
npx prisma db seed
```

Coût indicatif : plan Starter à partir de ~7,25 $/mois (7 $ de calcul + disque
persistant 1 Go), car les disques persistants ne sont pas disponibles sur le
plan gratuit ([tarifs Render](https://render.com/articles/how-much-does-cloud-application-hosting-cost-for-small-businesses)).

### Après le déploiement

- Changez le mot de passe des comptes de démonstration (ou remplacez le jeu de
  données de seed par vos vrais utilisateurs) avant tout usage réel.
- Ne relancez jamais `prisma db seed` sur une base contenant déjà des données
  réelles : le script vide toutes les tables avant de les repeupler.
