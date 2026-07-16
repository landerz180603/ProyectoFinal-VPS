#!/bin/bash

# ========================================
# Script de instalación rápida
# Tienda Locores - Proyecto Final DevOps
# ========================================

set -e

echo "🍭 ========== INSTALACIÓN TIENDA LOCORES =========="
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Verificar si Docker está instalado
print_status "Verificando Docker..."
if ! command -v docker &> /dev/null; then
    print_error "Docker no está instalado"
    echo "Instálalo con: curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh"
    exit 1
fi
print_success "Docker encontrado: $(docker --version)"

# Verificar si Docker Compose está instalado
print_status "Verificando Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose no está instalado"
    echo "Instálalo con: sudo curl -L https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m) -o /usr/local/bin/docker-compose && sudo chmod +x /usr/local/bin/docker-compose"
    exit 1
fi
print_success "Docker Compose encontrado: $(docker-compose --version)"

# Crear archivo .env
print_status "Configurando variables de entorno..."
if [ ! -f .env ]; then
    cp .env.example .env
    print_success ".env creado desde .env.example"
    
    # Leer dominio del usuario
    read -p "📍 Ingresa tu dominio (ej: landerzgalloerazo.duckdns.org): " DOMAIN
    sed -i "s/landerzgalloerazo.duckdns.org/$DOMAIN/g" .env
    
    # Leer contraseña de Traefik
    read -p "🔐 Contraseña para Traefik (enter para usar default): " TRAEFIK_PASS
    if [ ! -z "$TRAEFIK_PASS" ]; then
        sed -i "s/changeme123/$TRAEFIK_PASS/g" .env
    fi
    
    print_success "Variables configuradas"
else
    print_warning ".env ya existe, usando valores existentes"
fi

# Crear directorios necesarios
print_status "Creando directorios..."
mkdir -p traefik postgres backend/src frontend
touch traefik/acme.json
chmod 600 traefik/acme.json
print_success "Directorios creados"

# Iniciar servicios
print_status "Iniciando contenedores Docker..."
docker-compose up -d

echo ""
print_success "¡Instalación completada! 🎉"
echo ""
echo "📊 Estado de los contenedores:"
docker-compose ps
echo ""
echo "🌐 Accede a los servicios en:"
DOMAIN=$(grep "^DOMAIN=" .env | cut -d'=' -f2)
echo "  📱 App:       http://$DOMAIN"
echo "  🔌 API:       http://api.$DOMAIN"
echo "  🎛️  Portainer: http://portainer.$DOMAIN"
echo "  🗄️  pgAdmin:   http://pgadmin.$DOMAIN"
echo "  📊 Traefik:   http://traefik.$DOMAIN"
echo ""
echo "⏱️  Espera 10-20 segundos para que todos los servicios se inicien completamente"
echo ""
print_status "Verificando salud de servicios..."
sleep 10
docker-compose ps
echo ""
print_success "¡Listo para trabajar!"
