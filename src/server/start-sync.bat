@echo off
chcp 65001 > nul
echo.
echo ========================================
echo    SMART CASH MU - SYSTÈME DE SYNC
echo ========================================
echo.

REM Vérifier si Node.js est installé
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ ERREUR : Node.js n'est pas installé !
    echo Téléchargez depuis : https://nodejs.org/
    pause
    exit /b 1
)

REM Vérifier si PostgreSQL est en cours d'exécution
sc query postgresql-x64-15 | find "RUNNING" >nul
if %errorlevel% neq 0 (
    echo ⚠️  PostgreSQL n'est pas en cours d'exécution...
    echo Tentative de démarrage...
    net start postgresql-x64-15
    timeout /t 5 /nobreak
)

REM Aller dans le dossier server
cd /d "%~dp0server"

REM Vérifier si les dépendances sont installées
if not exist "node_modules" (
    echo 📦 Installation des dépendances du serveur...
    call npm install
    echo ✅ Dépendances installées
) else (
    echo 📦 Dépendances déjà installées
)

REM Générer le client Prisma
echo 🔧 Génération du client Prisma...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ❌ Erreur lors de la génération de Prisma
    pause
    exit /b 1
)

REM Appliquer les migrations
echo 🗃️  Application des migrations de base de données...
call npx prisma migrate dev --name init
if %errorlevel% neq 0 (
    echo ❌ Erreur lors des migrations
    pause
    exit /b 1
)

REM Démarrer le serveur
echo 🚀 Démarrage du serveur de synchronisation...
echo 📡 Serveur accessible sur : http://localhost:3000
echo 📊 Interface admin : http://localhost:3000/health
echo.
echo ⚠️  NE FERMEZ PAS CETTE FENÊTRE !
echo.
call npm run dev
pause