#!/bin/bash

# ========================================
# Script de actualización y redeploy
# ========================================

set -e

echo "🔄 Actualizando Tienda Locores..."

# Detener contenedores actuales
echo "⛔ Deteniendo contenedores..."
docker-compose down

# Actualizar código
echo "📥 Actualizando código desde Git..."
git pull origin main

# Actualizar imágenes
echo "🐳 Descargando nuevas imágenes..."
docker-compose pull

# Reconstruir si es necesario
echo "🔨 Reconstruyendo contenedores..."
docker-compose build --no-cache

# Iniciar nuevamente
echo "✅ Iniciando servicios..."
docker-compose up -d

# Mostrar estado
echo ""
echo "📊 Estado actual:"
docker-compose ps

echo ""
echo "✨ ¡Actualización completada!"
