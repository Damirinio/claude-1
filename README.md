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
- [Prisma 7](https://www.prisma.io) + SQLite en local (`@prisma/adapter-better-sqlite3`)
  ou [Turso](https://turso.tech)/libSQL en production (`@prisma/adapter-libsql`)
- Authentification par session (cookie JWT signé, `jose` + `bcryptjs`)
- Documents stockés directement en base (colonne binaire) : aucun disque ni
  volume à gérer, quel que soit l'hébergeur.

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
- Les documents téléversés sont stockés directement en base de données (aucun
  fichier sur disque), ce qui permet de déployer sur un hébergeur sans disque
  persistant.

## Déploiement

### Option gratuite recommandée : Render + Turso

Cette combinaison ne coûte rien, n'exige pas de carte bancaire et autorise
l'usage professionnel. Contrepartie du plan gratuit : le service s'endort
après 15 minutes sans visite et met environ une minute à se réveiller au
prochain accès — acceptable pour un outil interne consulté quelques fois par
jour.

1. **Créer la base de données (Turso, gratuit) :**
   - Sur [turso.tech](https://turso.tech), créez un compte puis une base
     (aucune carte requise).
   - Récupérez son URL de connexion (`libsql://....turso.io`) et créez un
     jeton d'accès (« Create Token »).
2. **Déployer l'application (Render, gratuit) :**
   - Sur [render.com](https://render.com) : **New → Blueprint**, sélectionnez
     le dépôt `Damirinio/claude-1`. Render lit `render.yaml` à la racine du
     projet et propose la configuration (plan *Free*, `SESSION_SECRET` généré
     automatiquement).
   - Il vous demande deux valeurs : collez-y l'URL et le jeton Turso récupérés
     à l'étape précédente (`TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`).
   - Validez. Render construit et démarre l'application. `prisma migrate
     deploy` n'étant pas compatible avec Turso ([limitation connue de
     Prisma](https://www.prisma.io/docs/orm/overview/databases/turso#caveats)),
     le schéma est créé automatiquement au démarrage par un script maison
     (`scripts/apply-turso-migrations.mjs`) — aucune action manuelle requise,
     et donc pas besoin de l'onglet *Shell* de Render (qui nécessite un plan
     payant).
3. Le lien public de l'application est affiché en haut de la page du service
   sur Render (`https://<nom-du-service>.onrender.com`).

Sources : [tarifs Turso](https://turso.tech/pricing) (5 Go gratuits, sans
carte), [tarifs Render](https://render.com/docs/free) (750 h/mois gratuites,
usage commercial autorisé, sans carte).

### Données de démonstration (facultatif)

`npx prisma db seed` charge 12 clients fictifs et les comptes de test —
pratique pour explorer l'application, mais pas nécessaire pour l'utiliser.
Sans accès Shell (payant sur Render), un workflow GitHub Actions
(`.github/workflows/seed-turso.yml`, déjà inclus dans le dépôt) permet de le
lancer gratuitement :

1. Sur GitHub, dans le dépôt : **Settings → Secrets and variables → Actions →
   New repository secret**, ajoutez `TURSO_DATABASE_URL` et
   `TURSO_AUTH_TOKEN` (les mêmes valeurs que sur Render).
2. Onglet **Actions** du dépôt → workflow *Seed Turso database* → **Run
   workflow**.

Sans cette étape, l'application démarre avec une base vide : créez vos clients
réels via le bouton « Nouveau client ».

### Alternative payante (pas de mise en veille) : Railway

Si l'endormissement après inactivité est gênant, Railway (~5 $/mois, plan
Hobby) fonctionne avec le même dépôt sans aucune modification : **New Project
→ Deploy from GitHub repo** → `Damirinio/claude-1`, puis dans les
*Variables* du service, renseignez `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`
et `SESSION_SECRET` (les mêmes valeurs Turso que ci-dessus). Aucun volume à
créer, la base restant sur Turso.

### Après le déploiement

- Changez le mot de passe des comptes de démonstration (ou remplacez le jeu de
  données de seed par vos vrais utilisateurs) avant tout usage réel.
- Ne relancez jamais `prisma db seed` sur une base contenant déjà des données
  réelles : le script vide toutes les tables avant de les repeupler.
