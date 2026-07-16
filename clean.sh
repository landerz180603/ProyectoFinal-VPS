#!/bin/bash

# ========================================
# Script para limpiar todo y empezar de cero
# ¡CUIDADO! Esto elimina TODOS los datos
# ========================================

read -p "⚠️  ADVERTENCIA: Esto eliminará TODOS los datos. Escribe 'YES' para continuar: " CONFIRM

if [ "$CONFIRM" != "YES" ]; then
    echo "Operación cancelada"
    exit 0
fi

echo "🗑️  Limpiando contenedores y volúmenes..."

docker-compose down -v

echo "🧹 Limpiando directorios..."
rm -f traefik/acme.json
mkdir -p traefik

echo "✅ Todo limpio. Puedes ejecutar './install.sh' para empezar de nuevo"
