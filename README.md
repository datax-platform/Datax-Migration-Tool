# 🚀 DATAX Migration Studio V2

Plataforma web unificada para la **migración, estandarización, prueba, auditoría y despliegue** de robots de datos (`V1 ➔ V2`) en el ecosistema **DATAX** (Descarga, Conversión, Migración a PostgreSQL, AutoGenerate con IA y Métricas).

---

## 📋 Prerrequisitos

Antes de iniciar, asegúrate de tener instalado en tu equipo:

1. **Docker Desktop** (incluye Docker Compose v2).
   - En Windows, asegúrate de que Docker Desktop esté **iniciado** antes de ejecutar los comandos.
2. **Git** para clonar este proyecto y los repositorios de robots.
3. **Clones locales de los repositorios de robots:**
   - **Fábrica Vieja (V1):** repositorio legado (ej. `data-processing-platform`).
   - **Fábrica Nueva (V2):** repositorio destino (ej. `data-processing-platform-dev` o `data-processing-modules`).
4. **Acceso a la red / VPN** hacia el servidor de base de datos y Airflow (`10.0.0.16`, si aplica en tu entorno).

*(No necesitas instalar Python ni Node.js en tu máquina si ejecutas el proyecto con Docker).*

---

## ⚙️ Configuración Inicial (Paso a Paso)

### 1. Clonar el repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd Datax-Migration-Tool
```

### 2. Configurar las variables de entorno (`.env`)
Copia el archivo de plantilla `.env.example` a `.env`:

**En PowerShell (Windows):**
```powershell
Copy-Item .env.example .env
```

**En Bash (Linux/Mac):**
```bash
cp .env.example .env
```

Abre `.env` y completa **tus rutas locales** y credenciales:

```env
# ===============================================================
# Rutas absolutas en TU computadora (las que monta Docker)
# ===============================================================
OLD_REPO_PATH=E:\DATAX\data-processing-platform\
NEW_REPO_PATH=E:\DATAX\data-processing-platform-dev\

# Puerto local donde abrirás la web (por defecto 8000)
APP_PORT=8000

# ===============================================================
# Servidor Remoto (SSH / Despliegue SFTP / Airflow)
# ===============================================================
SSH_HOST=10.0.0.16
SSH_PORT=22
SSH_USER=datax-pds
SSH_PASS=tu_contrasenia_ssh

# ===============================================================
# Base de Datos PostgreSQL (platform_db)
# ===============================================================
DB_HOST=10.0.0.16
DB_PORT=5434
DB_USER=postgres
DB_PASS=datax
DB_NAME=platform_db

# ===============================================================
# Integración GitHub, Gemini IA y Taiga
# ===============================================================
GITHUB_REPO=datax-platform/data-processing-modules
GITHUB_TOKEN=tu_github_pat
GEMINI_API_KEY=tu_gemini_api_key
TAIGA_HOST=https://investigaciontaiga.datax.com.bo
TAIGA_USER=tu_usuario
TAIGA_PASS=tu_contrasenia
TAIGA_PROJECT_SLUG=procesamiento-de-archivos-2
```

> **Importante:** Nunca subas tu archivo `.env` a Git (ya está protegido en `.gitignore`).
> Si en algún momento cambias `OLD_REPO_PATH` o `NEW_REPO_PATH` en `.env`, recrea el contenedor con `docker compose up -d` para que Docker actualice el montaje de carpetas.

---

## 🐳 Cómo Ejecutar el Sistema (Recomendado)

### Primera vez (construir imagen e iniciar)
Ejecuta en la raíz del proyecto:

```bash
docker compose up -d --build
```

La primera compilación descarga Python, dependencias, Chromium (Playwright) y compila el frontend React. Una vez terminada, quedará lista en tu Docker local.

### Uso diario (arranque en segundos)
Los días siguientes **no necesitas volver a compilar**; solo ejecuta:

```bash
docker compose up -d
```

*(O haz doble clic en `run_docker.bat` en Windows).*

### Accesos
* **Plataforma Web:** [http://localhost:8000](http://localhost:8000)
* **API Swagger / OpenAPI:** [http://localhost:8000/docs](http://localhost:8000/docs)

### Comandos útiles de Docker
```bash
# Ver logs en tiempo real
docker compose logs -f

# Reiniciar el backend (si editaste código en core/ o server/)
docker compose restart

# Reconstruir (solo si cambiaste requirements.txt o Dockerfile)
docker compose up -d --build

# Detener el contenedor
docker compose down
```

---

## 💻 Ejecución Local Sin Docker (Solo Desarrollo)

Si prefieres correr Backend y Frontend por separado sin Docker (requiere **Python 3.11+** y **Node.js 20+**):

1. **Instalar dependencias Backend:**
   ```bash
   pip install -r requirements.txt
   playwright install chromium
   ```
2. **Instalar dependencias Frontend:**
   ```bash
   cd frontend
   npm install
   cd ..
   ```
3. **Levantar ambos servicios:**
   * En Windows: doble clic en `run.bat` o `.\run.ps1` en PowerShell.
   * Manual:
     * Terminal 1: `python run_backend.py` (puerto `8000`)
     * Terminal 2: `cd frontend && npm run dev` (puerto `5173`)

---

## 🏛️ Arquitectura y Módulos

```text
┌────────────────────────────────────────────────────────┐
│               FRONTEND (React + Vite)                  │
│  - Tailwind CSS v4 + Monaco Editor                     │
│  - Notificaciones Toast, ConfirmModal y Consola        │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP REST (/api) + WebSocket (/ws/logs)
┌───────────────────────────▼────────────────────────────┐
│              BACKEND API (FastAPI - Puerto 8000)       │
│  - server/routers/: config, download, conversion,      │
│    migration, autogenerate, metrics                    │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│               CORE ENGINE (core/)                      │
│  - migrator_download.py    - migrator_conversion.py    │
│  - migrator_migration.py   - agent_analyzer.py         │
│  - agent_generator.py      - deployer.py               │
└────────────────────────────────────────────────────────┘
```

### Módulos principales
1. **📥 Robots de Descarga (`D_...`)**: Migración desde V1 o validación V2 (Tipos I, II, III y IV), selector de `updated_to` de prueba, ejecución de `unittest`, generación de DAG y despliegue SSH.
2. **🔄 Robots de Conversión (`C_...`)**: Wizard por pasos para selección, refactorización V2, pruebas unitarias (`test_conversion.py`), inspección de SQLite (`data_melted`), edición de reemplazos en `DATA_DB_BO_AUX`, configuración de `columns_to_review` y despliegue.
3. **🚚 Robots de Migración (`M_... / PostgreSQL`)**: Análisis inteligente de SQLite con Gemini / motor heurístico, vista previa simulada (`metrica_preview` y `unidad_preview`), generación de DDL `.sql` y script `.py`, guardado en V2 y despliegue.
4. **🤖 AutoGenerate (IA + Taiga)**: Lectura de historias de Taiga, descarga de adjuntos y generación asistida de robots siguiendo los estándares DATAX.
5. **📊 Métricas**: Auditoría y seguimiento del avance de robots (descarga, conversión, migración) con exportación a CSV y JSON.

---

## 🛠️ Solución de Problemas Frecuentes

* **No aparecen mis robots en las listas de Descarga o Conversión:**
  Verifica en `.env` que `OLD_REPO_PATH` y `NEW_REPO_PATH` apunten a las carpetas correctas y que ejecutaste `docker compose up -d` después de editar `.env`.
* **Error `ModuleNotFoundError` al correr un test (ej. `rapidfuzz`):**
  La imagen Docker está desactualizada respecto a `requirements.txt`. Ejecuta `docker compose up -d --build`.
* **Error de conexión a PostgreSQL (`10.0.0.16:5434`):**
  Verifica que estés conectado a la red/VPN de la oficina y usa el botón **Probar DB** dentro del modal **Configuración .env** en la esquina superior derecha.
* **Test de descarga excede los 240 segundos (timeout):**
  En reportes diarios o con mucho histórico, usa una `fecha de prueba (updated_to)` reciente (de hace unos días) en la pestaña de pruebas unitarias para validar el scraping rápidamente.
