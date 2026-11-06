# ==========================================
# Etapa 1: Compilación del Frontend (React + Vite)
# ==========================================
FROM node:20-slim AS frontend-builder

WORKDIR /app/frontend

# Copiar manifiestos de paquetes
COPY frontend/package*.json ./

# Instalar dependencias del frontend
RUN npm ci || npm install

# Copiar código fuente del frontend y compilar bundle de producción
COPY frontend/ ./
RUN npm run build

# ==========================================
# Etapa 2: Entorno Backend (FastAPI + Playwright)
# ==========================================
FROM python:3.11-slim

# Evitar prompts interactivos y buffers de Python
ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright \
    UVICORN_RELOAD=false

WORKDIR /app

# Instalar herramientas esenciales del sistema y librerías C
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Instalar dependencias Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Instalar navegador Chromium para Playwright con todas sus dependencias de Linux
RUN playwright install --with-deps chromium

# Copiar código de la plataforma
COPY . /app

# Copiar bundle optimizado del frontend desde la etapa 1
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Asegurar existencia de directorios de trabajo y almacenamiento
RUN mkdir -p /app/output /app/attachtments

# Exponer el puerto unificado (FastAPI + UI)
EXPOSE 8000

# Healthcheck HTTP para monitorear el contenedor
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

# Comando de inicio del servidor
CMD ["python", "run_backend.py"]

