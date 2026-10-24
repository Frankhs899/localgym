@echo off
REM LocalGym server launcher (D3, issue #3).
REM Starts Django under waitress, serving the compiled SPA and the API in a
REM single process on port 8000. Safe to run from any working directory:
REM all paths are resolved relative to this script's location.
REM User messages are plain-ASCII Spanish (no accents) on purpose: cmd.exe
REM codepages differ between Windows installs and would garble them.

setlocal
REM The script lives in <repo>\scripts\, so the repo root is its parent.
cd /d "%~dp0.."

if not exist "backend\.venv\Scripts\python.exe" (
    echo [LocalGym] Falta el entorno virtual del backend.
    echo [LocalGym] Segui la guia de instalacion: docs/installation.md
    pause
    exit /b 1
)

if not exist "backend\.env" (
    echo [LocalGym] Falta backend\.env con la configuracion.
    echo [LocalGym] Segui la guia de instalacion: docs/installation.md
    pause
    exit /b 1
)

echo [LocalGym] Preparando archivos estaticos...
backend\.venv\Scripts\python.exe backend\manage.py collectstatic --noinput --clear >nul
if errorlevel 1 (
    echo [LocalGym] collectstatic fallo. Revisa la guia: docs/installation.md
    pause
    exit /b 1
)

echo [LocalGym] Iniciando servidor en http://localhost:8000 ...
echo [LocalGym] Deja esta ventana abierta mientras uses el sistema.
echo.

cd backend
.venv\Scripts\python.exe -m waitress --listen=0.0.0.0:8000 config.wsgi:application
