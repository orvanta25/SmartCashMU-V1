@echo off
chcp 65001 > nul
title SmartCashMU - Système Complet

echo.
echo ╔══════════════════════════════════════════╗
echo ║   SMART CASH MU - SYSTÈME COMPLET        ║
echo ╚══════════════════════════════════════════╝
echo.

REM Démarrer le serveur dans une nouvelle fenêtre
echo 🚀 Démarrage du serveur central...
start "Serveur Sync" cmd /k "cd /d %~dp0server && npm run dev"

echo ⏳ Attente du démarrage du serveur (10s)...
timeout /t 10 /nobreak

REM Vérifier que le serveur est prêt
echo 🔍 Test de connexion au serveur...
curl -s -f http://localhost:3000/health >nul
if %errorlevel% neq 0 (
    echo ❌ Le serveur n'a pas démarré correctement
    pause
    exit /b 1
)

echo ✅ Serveur prêt !

REM Démarrer la première caisse
echo.
echo 🏪 Démarrage de la Caisse 1...
start "Caisse 1" cmd /k "cd /d %~dp0 && npm run electron:dev"

REM Optionnel : Démarrer une deuxième caisse
echo.
echo 🏪 Voulez-vous démarrer une deuxième caisse ? (O/N)
set /p choix=

if /i "%choix%"=="O" (
    echo 🏪 Démarrage de la Caisse 2...
    timeout /t 5 /nobreak
    start "Caisse 2" cmd /k "cd /d %~dp0 && npm run electron:dev"
)

echo.
echo ✅ Système complet démarré !
echo 📡 Serveur : http://localhost:3000
echo 🏪 Caisses : 2 instances en cours
echo.
echo 📋 Commandes utiles :
echo - Vérifier le statut : curl http://localhost:3000/health
echo - Voir les logs serveur : console "Serveur Sync"
echo - Interface admin : http://localhost:3000/admin (si implémenté)
echo.
pause