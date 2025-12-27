@echo off
chcp 65001 > nul
echo.
echo ========================================
echo       SMART CASH MU - CAISSE
echo ========================================
echo.

REM Vérifier si le serveur est en cours d'exécution
echo 🔍 Vérification du serveur de synchronisation...
curl -s -f http://localhost:3000/health >nul
if %errorlevel% neq 0 (
    echo ❌ Le serveur n'est pas démarré !
    echo Lancez d'abord start-sync.bat
    pause
    exit /b 1
)

echo ✅ Serveur de synchronisation actif
echo 📊 Récupération du statut du serveur...
curl http://localhost:3000/health

echo.
echo 🏪 Démarrage de la caisse...
echo 📍 Caisse ID sera généré automatiquement
echo 🔄 Synchronisation automatique toutes les 30 secondes
echo.

REM Démarrer l'application Electron
call npm run electron:dev
if %errorlevel% neq 0 (
    echo ❌ Erreur lors du démarrage de l'application
    echo Vérifiez que les dépendances sont installées
    pause
)