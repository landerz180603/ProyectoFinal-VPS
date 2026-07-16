#!/bin/bash

# ========================================
# Script de diagnóstico
# ========================================

echo "🔍 ===== DIAGNÓSTICO TIENDA LOCORES ====="
echo ""

# Estado general
echo "📊 ESTADO DE CONTENEDORES:"
docker-compose ps
echo ""

# Verificar conectividad de red
echo "🌐 VERIFICAR RED INTERNA:"
echo -n "Frontend puede alcanzar Backend: "
docker-compose exec frontend ping -c 1 backend 2>&1 | grep -q "1 received" && echo "✅ Sí" || echo "❌ No"

echo -n "Backend puede alcanzar PostgreSQL: "
docker-compose exec backend ping -c 1 postgres 2>&1 | grep -q "1 received" && echo "✅ Sí" || echo "❌ No"

echo -n "pgAdmin puede alcanzar PostgreSQL: "
docker-compose exec pgadmin ping -c 1 postgres 2>&1 | grep -q "1 received" && echo "✅ Sí" || echo "❌ No"
echo ""

# Verificar conectividad a BD
echo "🗄️  VERIFICAR CONECTIVIDAD A BD:"
docker-compose exec postgres psql -U locores_user -d locores_db -c "SELECT 1;" > /dev/null 2>&1 && echo "✅ PostgreSQL conectado" || echo "❌ Error en PostgreSQL"
echo ""

# Verificar tabla de usuarios
echo "👥 USUARIOS EN BD:"
docker-compose exec postgres psql -U locores_user -d locores_db -c "SELECT COUNT(*) as total_usuarios FROM usuarios;"
echo ""

# Verificar logs recientes
echo "📝 ÚLTIMOS LOGS DE BACKEND:"
docker-compose logs --tail=5 backend
echo ""

echo "📝 ÚLTIMOS LOGS DE TRAEFIK:"
docker-compose logs --tail=5 traefik
echo ""

# Verificar uso de recursos
echo "💾 USO DE RECURSOS:"
docker stats --no-stream
echo ""

# Verificar puertos
echo "🔌 PUERTOS EN USO:"
netstat -tuln 2>/dev/null | grep LISTEN || ss -tuln 2>/dev/null | grep LISTEN
echo ""

echo "✅ Diagnóstico completado"
