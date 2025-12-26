# SmarCash

An Electron application with React and TypeScript

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

# 1. À la racine de SmartCashMU-V1/
npm install

# 2. Créer et configurer le serveur
mkdir server
cd server
npm init -y

# 3. Installer les dépendances du serveur
npm install express cors helmet compression dotenv winston @prisma/client
npm install -D typescript tsx @types/express @types/cors @types/node prisma

# 4. Copier tous les fichiers que je vous ai donnés dans le dossier server/

# 5. Configurer la base de données centrale
# Éditer server/.env avec vos infos de base de données

# 6. Générer les migrations Prisma
cd server
npx prisma migrate dev --name init

# 7. Démarrer en développement
# Dans un terminal : le serveur
npm run dev:server

# Dans un autre terminal : l'application caisse
npm run dev:caisse

# Ou les deux ensemble
npm run sync:all
