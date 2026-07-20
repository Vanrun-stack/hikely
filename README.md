# 🏔️ Hikely — Plateforme de Randonnée Collaborative

> Découvrez, planifiez et partagez vos randonnées avec la communauté.

[![CI/CD](https://github.com/YOUR_USERNAME/hikely/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/hikely/actions)

## 🚀 Stack Technique

| Technologie       | Version  | Usage                              |
| ----------------- | -------- | ---------------------------------- |
| **Next.js**       | 15+      | Full-Stack (App Router, RSC, SA)   |
| **React**         | 19       | UI Framework                       |
| **TypeScript**    | 5.5+     | Type Safety                        |
| **PostgreSQL**    | 17       | Base de données + PostGIS          |
| **Prisma**        | 5.x      | ORM + Migrations                   |
| **NextAuth v5**   | Beta     | Authentification (Credentials/OAuth)|
| **MapLibre GL JS**| 4.x      | Cartographie 3D                    |
| **Shadcn/ui**     | Latest   | Design System                      |
| **Docker**        | Latest   | Conteneurisation                   |

---

## 📦 Démarrage Rapide

### Prérequis

- **Node.js** ≥ 22
- **pnpm** ≥ 9
- **Docker** (pour la base de données)

### Installation

```bash
# 1. Cloner le repo
git clone https://github.com/YOUR_USERNAME/hikely.git
cd hikely

# 2. Copier le fichier d'environnement
cp .env.example .env

# 3. Installer les dépendances
pnpm install

# 4. Démarrer PostgreSQL/PostGIS
docker compose up -d

# 5. Synchroniser le schéma de la base de données
pnpm db:push

# 6. Générer le client Prisma
pnpm db:generate

# 7. Lancer le serveur de développement
pnpm dev
```

L'application est accessible sur **http://localhost:3000**

---

## 🐳 Déploiement Docker (Auto-Hébergé)

### Option 1 : Build Local

```bash
# 1. Préparer l'environnement de production
cp .env.example .env.production

# 2. ⚠️  ÉDITER .env.production — Changer impérativement :
#    - NEXTAUTH_SECRET (générer : openssl rand -base64 32)
#    - POSTGRES_PASSWORD
#    - NEXTAUTH_URL (votre domaine)

# 3. Builder et démarrer
docker compose -f docker-compose.prod.yml up -d --build

# 4. Vérifier les logs
docker compose -f docker-compose.prod.yml logs -f
```

### Option 2 : Image GHCR (CI/CD)

Si vous utilisez le pipeline CI/CD, l'image est automatiquement pushée sur GHCR :

```yaml
# docker-compose.prod.yml — remplacer la section build par :
services:
  app:
    image: ghcr.io/YOUR_USERNAME/hikely:latest
    # ... reste de la config
```

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

### Option 3 : VPS avec Reverse Proxy (Nginx/Caddy)

```bash
# Sur votre serveur
mkdir -p /opt/hikely && cd /opt/hikely

# Copier les fichiers nécessaires
# docker-compose.prod.yml, .env.production, infra/sql/init.sql

# Démarrer
docker compose -f docker-compose.prod.yml up -d
```

Exemple **Caddyfile** :
```
hikely.example.com {
    reverse_proxy localhost:3000
}
```

Exemple **Nginx** :
```nginx
server {
    listen 80;
    server_name hikely.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 🔧 Variables d'Environnement

| Variable                  | Requis | Description                                      |
| ------------------------- | ------ | ------------------------------------------------ |
| `DATABASE_URL`            | ✅     | URL de connexion PostgreSQL                      |
| `NEXTAUTH_SECRET`         | ✅     | Clé secrète NextAuth (min 32 chars)              |
| `NEXTAUTH_URL`            | ✅     | URL publique de l'application                    |
| `POSTGRES_PASSWORD`       | ✅     | Mot de passe PostgreSQL                          |
| `GOOGLE_CLIENT_ID`        | ❌     | OAuth Google (optionnel)                         |
| `GOOGLE_CLIENT_SECRET`    | ❌     | OAuth Google (optionnel)                         |
| `GITHUB_CLIENT_ID`        | ❌     | OAuth GitHub (optionnel)                         |
| `GITHUB_CLIENT_SECRET`    | ❌     | OAuth GitHub (optionnel)                         |
| `NEXT_PUBLIC_APP_URL`     | ✅     | URL publique (pour OpenGraph/SEO)                |

---

## 📂 Architecture

```
hikely/
├── apps/
│   └── web/                    # Next.js Full-Stack App
│       ├── prisma/
│       │   └── schema.prisma   # Schéma de base de données
│       ├── src/
│       │   ├── actions/        # Server Actions (CRUD, Auth)
│       │   ├── app/            # App Router (pages, layouts)
│       │   ├── components/     # Composants React (UI, Map, Hike)
│       │   ├── hooks/          # Custom React hooks
│       │   ├── lib/            # Utilitaires (auth, prisma, gpx)
│       │   └── stores/         # Zustand stores
│       └── public/             # Assets statiques, SW, manifest
├── infra/
│   └── sql/init.sql            # Extensions PostGIS
├── Dockerfile                  # Multi-stage build
├── docker-compose.yml          # Dev (DB only)
├── docker-compose.prod.yml     # Production (App + DB)
└── docker-entrypoint.sh        # Auto-migration au démarrage
```

---

## 🧪 Scripts Disponibles

```bash
pnpm dev           # Serveur de développement
pnpm build         # Build de production
pnpm start         # Démarrer la build de production
pnpm lint          # Linting ESLint
pnpm type-check    # Vérification TypeScript
pnpm db:push       # Synchroniser le schéma DB
pnpm db:studio     # Prisma Studio (GUI DB)
pnpm db:generate   # Regénérer le client Prisma
pnpm docker:dev    # Démarrer PostgreSQL (dev)
pnpm docker:prod   # Builder & démarrer en production
```

---

## 📄 Licence

MIT © Hikely
