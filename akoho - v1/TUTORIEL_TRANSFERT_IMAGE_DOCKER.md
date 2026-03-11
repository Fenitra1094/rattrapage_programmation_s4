# Tutoriel - Exporter une image Docker et l'utiliser sur une autre machine (OS different)

Ce guide montre comment:

1. Extraire une image Docker depuis une machine source.
2. La transferer vers une autre machine.
3. L'importer et l'utiliser, meme si les OS sont differents (Linux, Windows).

Exemple utilise: image SQL Server du projet Akoho.

- Image: `mcr.microsoft.com/mssql/server:2022-latest`

## 1) Principe important: image vs donnees

- Une image Docker contient l'application et son environnement.
- Les donnees d'une base (fichiers de volume) ne sont pas inclues automatiquement dans l'image.

Pour votre projet:

- Transferer l'image SQL Server est possible tres facilement.
- Pour transferer aussi les donnees, il faut sauvegarder/restaurer la base (backup SQL) ou copier le volume a part.

## 2) Sur la machine source - Recuperer et exporter l'image

### Linux Mint (bash)

```bash
# 1) Telecharger l'image (si elle n'est pas deja locale)
docker pull mcr.microsoft.com/mssql/server:2022-latest

# 2) Exporter l'image en fichier tar
docker save -o sqlserver-2022.tar mcr.microsoft.com/mssql/server:2022-latest

# 3) (Optionnel) Compresser pour un envoi plus rapide
gzip sqlserver-2022.tar
# Fichier final: sqlserver-2022.tar.gz
```

### Windows 11 (PowerShell)

```powershell
# 1) Telecharger l'image
docker pull mcr.microsoft.com/mssql/server:2022-latest

# 2) Exporter l'image en tar
docker save -o sqlserver-2022.tar mcr.microsoft.com/mssql/server:2022-latest

# 3) (Optionnel) Compresser
Compress-Archive -Path .\sqlserver-2022.tar -DestinationPath .\sqlserver-2022.zip
```

## 3) Transferer le fichier vers l'autre machine

Methodes possibles:

- Cle USB
- Reseau local (SCP, partage SMB)
- Cloud (Drive, OneDrive, etc.)

Fichier a transferer:

- `sqlserver-2022.tar` (ou `sqlserver-2022.tar.gz` / `.zip`)

## 4) Sur la machine destination - Importer l'image

### Linux Mint (bash)

```bash
# Si fichier compresse .gz
gunzip sqlserver-2022.tar.gz

# Importer l'image
docker load -i sqlserver-2022.tar

# Verifier
docker images | grep mssql/server
```

### Windows 11 (PowerShell)

```powershell
# Si fichier .zip
Expand-Archive -Path .\sqlserver-2022.zip -DestinationPath .

# Importer
docker load -i .\sqlserver-2022.tar

# Verifier
docker images | findstr mssql/server
```

## 5) Lancer un conteneur depuis l'image importee

```bash
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=Akoho@Password123" -p 1433:1433 -d --name sqlserver-container mcr.microsoft.com/mssql/server:2022-latest
```

## 6) Cas de votre projet Akoho (recommande)

Dans ce projet, la base est preparee avec `database/docker-compose.yml` et `database/script.sql`.

Apres import de l'image, le plus simple est d'utiliser le compose du projet:

```bash
cd database
docker compose up -d
```

Ce compose:

- lance SQL Server
- mappe le port `1433`
- execute `script.sql` automatiquement

## 7) Compatibilite entre OS et architecture

Docker permet le transfert entre OS differents, mais attention a l'architecture CPU:

- `amd64` (x86_64): le plus courant (beaucoup de PC Windows/Linux)
- `arm64`: certaines machines (ex: Apple Silicon)

Conseil:

```bash
docker pull --platform linux/amd64 mcr.microsoft.com/mssql/server:2022-latest
```

Utilisez la meme architecture sur source et destination pour eviter les surprises.

## 8) Transferer aussi les donnees SQL (optionnel)

Si vous voulez deplacer les donnees (pas seulement l'image), faites en plus:

1. Backup SQL (`.bak`) sur la machine source.
2. Copie du `.bak` vers la destination.
3. Restore SQL sur la destination.

Sans backup/restore, vous transferez uniquement le moteur SQL Server, pas le contenu de la base.

## 9) Commandes de verification utiles

```bash
# Images locales
docker images

# Conteneurs en cours
docker ps

# Logs SQL Server
docker logs -f sqlserver-container
```

---

## 10) Scenario hors ligne - machine destination sans internet

Cas concret: vous etes dans une salle sans connexion internet et vous devez installer le projet sur une autre machine. Voici la procedure complete.

### 10.1) Ce qu'il faut preparer sur la machine qui a internet (machine source)

Avant de quitter le reseau:

```bash
# 1) Telecharger l'image SQL Server
docker pull mcr.microsoft.com/mssql/server:2022-latest

# 2) Exporter l'image
docker save -o sqlserver-2022.tar mcr.microsoft.com/mssql/server:2022-latest

# 3) Compresser (taille reduite, plus facile a copier)
gzip sqlserver-2022.tar
# → fichier final: sqlserver-2022.tar.gz (~1.5 Go)
```

Copiez aussi sur le support de transfert:

- `sqlserver-2022.tar.gz`
- Le dossier du projet complet (ou juste le dossier `database/`)

### 10.2) Installer Docker sur la machine destination sans internet

Docker lui-meme a besoin d'etre installe.

#### Linux Mint

Telechargez sur la machine connectee les paquets `.deb`:

- [https://download.docker.com/linux/ubuntu/dists/](https://download.docker.com) 
  (choisissez la version correspondante a votre distro - Ubuntu Focal ou Jammy pour Mint)

Paquets necessaires (dans l'ordre d'installation):

1. `containerd.io_<version>_amd64.deb`
2. `docker-buildx-plugin_<version>_amd64.deb`
3. `docker-ce-cli_<version>_amd64.deb`
4. `docker-ce_<version>_amd64.deb`
5. `docker-compose-plugin_<version>_amd64.deb`

Puis sur la machine sans internet:

```bash
sudo dpkg -i containerd.io_*.deb
sudo dpkg -i docker-ce-cli_*.deb
sudo dpkg -i docker-ce_*.deb
sudo dpkg -i docker-buildx-plugin_*.deb
sudo dpkg -i docker-compose-plugin_*.deb

# Demarrer Docker
sudo systemctl enable docker
sudo systemctl start docker

# Ajouter votre utilisateur au groupe docker
sudo usermod -aG docker $USER
newgrp docker
```

#### Windows 11

Telechargez l'installateur Docker Desktop:

- Fichier: `Docker Desktop Installer.exe`
- Source: [https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe](https://desktop.docker.com)

Double-cliquez pour l'installer normalement (Docker Desktop est autonome, pas besoin d'internet pour l'installation).

Activez WSL2 si demande (integration Windows Subsystem for Linux).

### 10.3) Importer l'image sur la machine destination (hors ligne)

Branchez votre cle USB / copie locale, puis:

#### Linux Mint

```bash
# Decompresser
gunzip sqlserver-2022.tar.gz

# Charger l'image dans Docker local
docker load -i sqlserver-2022.tar

# Verifier
docker images | grep mssql
```

#### Windows 11 (PowerShell)

```powershell
# Charger l'image
docker load -i .\sqlserver-2022.tar

# Verifier
docker images | findstr mssql
```

### 10.4) Lancer la base de donnees (hors ligne)

```bash
# Linux Mint
cd "/chemin/vers/akoho - v1/database"
docker compose up -d

# Windows 11 (PowerShell)
Set-Location "C:\chemin\vers\akoho - v1\database"
docker compose up -d
```

Docker n'a plus besoin d'internet: l'image `mcr.microsoft.com/mssql/server:2022-latest` est deja disponible en local.

### 10.5) Checklist rapide (hors ligne)

```
[Machine avec internet]
  ✓ docker pull mcr.microsoft.com/mssql/server:2022-latest
  ✓ docker save -o sqlserver-2022.tar mcr.microsoft.com/mssql/server:2022-latest
  ✓ gzip sqlserver-2022.tar
  ✓ Copier sqlserver-2022.tar.gz + dossier projet sur cle USB

[Machine sans internet]
  ✓ Installer Docker (depuis les paquets sur la cle USB)
  ✓ Ajouter utilisateur au groupe docker (Linux)
  ✓ gunzip sqlserver-2022.tar.gz
  ✓ docker load -i sqlserver-2022.tar
  ✓ cd database && docker compose up -d

[Puis lancer backend et frontend normalement]
  ✓ cd backend && npm install && npm run dev
  ✓ cd frontend && npm install && npm start
```

> Note: `npm install` telecharge les packages depuis internet par defaut.
> Si la destination est aussi sans internet pour npm, copiez les dossiers `node_modules/` depuis la machine source
> (dossier `backend/node_modules/` et `frontend/node_modules/`), et ne faites pas `npm install`.

---

## Resume rapide

1. `docker pull` l'image.
2. `docker save` vers un fichier `.tar`.
3. Transferer le fichier.
4. `docker load` sur l'autre machine.
5. Lancer le conteneur (ou `docker compose up -d` dans ce projet).
