# Tutoriel rapide - Lancement de l'application Akoho

Ce guide explique comment lancer l'application sur Linux Mint et Windows 11.

## 1. Presentation rapide du fonctionnement

L'application est composee de 3 blocs principaux:

- Frontend: application Angular (`frontend/`) qui affiche les ecrans (dashboard, lots, ventes, achats, etc.).
- Backend: API REST Node.js + Express (`backend/`) qui expose les routes `/api/...` et applique la logique metier.
- Base de donnees: SQL Server (`database/`) initialise avec `script.sql` (creation de la base `akoho`, tables et donnees de base).

Flux global:

1. L'utilisateur agit dans le frontend Angular.
2. Le frontend appelle l'API backend sur `http://localhost:3000/api`.
3. Le backend lit/ecrit dans SQL Server (base `akoho`).
4. Le backend renvoie les resultats au frontend.

## 2. Prerequis

Installez ces outils:

- Node.js 20+ et npm
- Docker + Docker Compose
- Git (optionnel, mais recommande)

Notes OS:

- Linux Mint: Docker Engine + plugin Compose (`docker compose ...`).
- Windows 11: Docker Desktop (WSL2 active recommande).

## 3. Configuration du backend (.env)

Le backend utilise `backend/.env`.

Contenu attendu:

```env
PORT=3000
DB_SERVER=localhost
DB_DATABASE=akoho
DB_USER=sa
DB_PASSWORD=Akoho@Password123
DB_PORT=1433
```

Si votre fichier `backend/.env` contient d'autres lignes non liees a des variables (ex: commande `sqlcmd`), supprimez-les pour eviter les erreurs de parsing.

## 4. Demarrage de la base de donnees

Ouvrez un terminal dans le dossier racine du projet, puis lancez:

```bash
cd ".../akoho - v1/database"
docker compose up -d
```

Ce que fait la stack:

- demarre SQL Server 2022
- expose le port `1433`
- execute automatiquement `script.sql` (creation schema + donnees initiales)

Verification rapide:

```bash
docker compose ps
```

## 5. Demarrage du backend

Dans un 2e terminal:

```bash
cd ".../akoho - v1/backend"
npm install
npm run dev
```

Le backend demarre sur `http://localhost:3000`.

Test rapide:

- Ouvrir `http://localhost:3000/`
- Reponse attendue: message JSON de l'API Akoho.

## 6. Demarrage du frontend

Dans un 3e terminal:

```bash
cd ".../akoho - v1/frontend"
npm install
npm start
```

Angular demarre en local (generalement sur `http://localhost:4200`).

## 7. Lancement par OS

### Linux Mint

```bash
# Terminal 1
cd "/media/hp/Disque local/HP/Documents/S4/Projet Mr Tahina/Rattrapage/akoho - v1/database"
docker compose up -d

# Terminal 2
cd "/media/hp/Disque local/HP/Documents/S4/Projet Mr Tahina/Rattrapage/akoho - v1/backend"
npm install
npm run dev

# Terminal 3
cd "/media/hp/Disque local/HP/Documents/S4/Projet Mr Tahina/Rattrapage/akoho - v1/frontend"
npm install
npm start
```

### Windows 11 (PowerShell)

```powershell
# Terminal 1
Set-Location "C:\chemin\vers\akoho - v1\database"
docker compose up -d

# Terminal 2
Set-Location "C:\chemin\vers\akoho - v1\backend"
npm install
npm run dev

# Terminal 3
Set-Location "C:\chemin\vers\akoho - v1\frontend"
npm install
npm start
```

## 8. Arret des services

- Arreter frontend/backend: `Ctrl + C` dans leurs terminaux.
- Arreter SQL Server Docker:

```bash
cd ".../akoho - v1/database"
docker compose down
```

Si vous voulez aussi supprimer les donnees persistantes:

```bash
docker compose down -v
```

## 9. Depannage rapide

- Erreur CORS ou API inaccessible:
  - verifier que le backend tourne sur le port `3000`
  - verifier `frontend/src/app/services/api.service.ts` (`baseUrl = http://localhost:3000/api`)
- Erreur connexion SQL:
  - verifier que le conteneur SQL Server est `Up` (`docker compose ps`)
  - verifier les variables de `backend/.env`
- Port deja utilise:
  - changer le port backend (`PORT`) et adapter `baseUrl` frontend si necessaire.

## 10. Resume express

1. `docker compose up -d` dans `database/`
2. `npm run dev` dans `backend/`
3. `npm start` dans `frontend/`
4. Ouvrir l'URL du frontend dans le navigateur
