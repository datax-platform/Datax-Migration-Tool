@echo off
title DATAX Migration Studio - Docker
echo ========================================================
echo       DATAX MIGRATION STUDIO V2 (Docker Container)
echo ========================================================
echo Verificando si Docker esta en ejecucion...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Desktop no esta iniciado o no responde.
    echo Por favor abre Docker Desktop y vuelve a intentar.
    pause
    exit /b 1
)

echo Construyendo e iniciando contenedor en segundo plano...
docker compose up -d --build

echo.
echo ========================================================
echo  DataX Migration Studio listo en: http://localhost:8000
echo ========================================================
echo.
echo  - Ver logs en vivo: docker compose logs -f
echo  - Detener contenedor: docker compose down
echo.
pause

