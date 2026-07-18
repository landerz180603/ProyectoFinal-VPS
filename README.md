# 🍭 Tienda Lícores - Proyecto Final DevOps

> Despliegue completo de una aplicación web en VPS con Docker, Traefik y PostgreSQL

## 📋 Características

✅ **Infraestructura Docker Compose** - Orquestación completa de servicios  
✅ **Traefik** - Proxy inverso con enrutamiento de subdominios  
✅ **Portainer** - Gestión gráfica de contenedores  
✅ **Backend PHP** - API REST funcional  
✅ **Frontend JavaScript** - Aplicación SPA con HTML/CSS/JS  
✅ **PostgreSQL** - Base de datos persistente  
✅ **pgAdmin** - Administración de BD  
✅ **GitHub Actions** - CI/CD automatizado  

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────┐
│            jorge.byronrm.com                |
└──────────────────┬──────────────────────────┘
                   │
           ┌───────▼────────┐
           │    TRAEFIK     │ (Proxy Inverso)
           │  puerto 80/443 │
           └───────┬────────┘
                   │
    ┌──────────────┼──────────────┬─────────────┐
    │              │              │             │
    ▼              ▼              ▼             ▼
┌────────┐    ┌────────┐    ┌──────────┐  ┌─────────┐
│Frontend│    │Backend │    │Portainer │  │ pgAdmin │
│ (app/) │    │(api/)  │    │(portainer)  │(pgadmin)│
└────────┘    └───┬────┘    └──────────┘  └────┬────┘
                   │                             │
                   └──────────┬──────────────────┘
                              │
                         ┌────▼────┐
                         │PostgreSQL│
                         │(BD)      │
                         └──────────┘
```

---

## 🚀 Instalación y Despliegue

### Requisitos Previos

- VPS con Ubuntu 20.04+
- Docker y Docker Compose instalados
- Acceso SSH
- Dominio o subdominio 

### 1️⃣ Clonar el repositorio en el VPS

```bash
ssh usuario@tu-vps.com
cd /home/usuario
git clone https://github.com/landerz180603/ProyectoFinal-VPS.git
cd ProyectoFinal-VPS
```

### 2️⃣ Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env` con tus valores:

```bash
DOMAIN=jorge.byronrm.com
TRAEFIK_USER=admin
TRAEFIK_PASSWORD=tu_contraseña_segura
DB_USER=locores_user
DB_PASSWORD=tu_contraseña_bd
DB_NAME=locores_db
PGADMIN_EMAIL=tu_email@gmail.com
PGADMIN_PASSWORD=tu_contraseña_pgadmin
```

### 3️⃣ Inicializar Traefik

```bash
touch traefik/acme.json
chmod 600 traefik/acme.json
```

### 4️⃣ Lanzar los contenedores

```bash
docker compose up -d
```

Verificar estado:

```bash
docker compose ps
```

### 5️⃣ Acceder a los servicios

| Servicio | URL | Usuario | Contraseña |
|----------|-----|---------|-----------|
| **Aplicación** | `http://jorge.byronrm.com` | - | - |
| **API Backend** | `http://backjr.byronrm.com` | - | - |
| **Portainer** | `http://portainerjr.byronrm.com` | - | (crear al acceder) |
| **pgAdmin** | `http://dbyugsi,byronrm.com` | admin@locores.com | (ver .env) |
| **Traefik Dashboard** | `http://traefikjr.byronrm.com` | admin | (ver .env) |

---

## 📝 Funcionalidades de la Aplicación

### Registro de Usuarios ✅

La aplicación incluye un formulario de registro completo que:

1. **Captura datos:** Email, nombre y contraseña
2. **Valida campos:** Antes de enviar
3. **Encripta contraseña:** Con bcrypt en el backend
4. **Guarda en BD:** Persiste en PostgreSQL
5. **Confirma al usuario:** Mensaje de éxito/error
6. **Lista usuarios:** Muestra todos los registrados

### Comunicación Frontend-Backend ✅

```javascript
// Frontend envía datos
POST /api/users
Content-Type: application/json
{
  "email": "usuario@ejemplo.com",
  "nombre": "Juan Perez",
  "password": "123456"
}

// Backend responde
{
  "message": "Usuario creado exitosamente",
  "id": 1
}
```

---

## 🐳 Estructura de Contenedores

```yaml
traefik       → Proxy inverso (puerto 80/443)
portainer     → Gestor de contenedores (9000)
postgres      → Base de datos (5432)
pgadmin       → Admin BD (80)
backend       → API PHP (9000)
frontend      → App JavaScript (80)
```

Cada contenedor está en la red `traefik` para comunicación interna.

---

## 🔧 Comandos Útiles

```bash
# Ver logs de un servicio
docker compose logs -f backend

# Entrar a un contenedor
docker compose exec backend bash

# Acceder a PostgreSQL
docker compose exec postgres psql -U locores_user -d locores_db

# Detener todos los servicios
docker compose down

# Reconstruir un contenedor
docker compose up -d --build backend

# Ver uso de recursos
docker stats

# Limpiar volúmenes (⚠️ borra datos)
docker compose down -v
```

---

## 🔐 Seguridad

### Consideraciones Implementadas

- ✅ Variables de entorno para credenciales
- ✅ Contraseñas hasheadas con bcrypt
- ✅ CORS habilitado en Traefik
- ✅ Redes internas aisladas
- ✅ Contenedores sin privilegios root

### Mejoras Recomendadas

- [ ] Implementar HTTPS con Let's Encrypt
- [ ] Autenticación JWT en API
- [ ] Rate limiting en Traefik
- [ ] WAF (Web Application Firewall)
- [ ] Backups automatizados de BD

---

## 📊 Base de Datos

### Tabla `usuarios`

```sql
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Acceder a pgAdmin

1. Abrir: `http://pgadmin.landerzgalloerazo.duckdns.org`
2. Login: `admin@locores.com` / contraseña del .env
3. Agregar servidor:
   - **Hostname:** `postgres`
   - **Username:** `locores_user`
   - **Password:** (ver .env)
   - **Database:** `locores_db`

---

## 🚀 CI/CD con GitHub Actions

El workflow `.github/workflows/deploy.yml` ejecuta:

1. **Build:** Construcción de imágenes Docker
2. **Tests:** Validación de configuración
3. **Deploy:** Actualización automática en VPS (rama `main`)

### Configurar Secrets en GitHub

Ir a: **Settings → Secrets and variables → Actions**

Agregar:

```
VPS_HOST           = tu.vps.ip
VPS_USER           = usuario_ssh
VPS_SSH_KEY        = contenido_de_tu_private_key
DOMAIN             = jorge.byronrm.com
```

Obtener tu SSH key:

```bash
cat ~/.ssh/id_rsa
```

---

## 🔍 Troubleshooting

### ❌ Los subdominios no resuelven

```bash
# Verificar DuckDNS
nslookup landerzgalloerazo.duckdns.org

# Reiniciar Traefik
docker compose restart traefik
```

### ❌ Error de conexión a BD

```bash
# Ver logs de PostgreSQL
docker compose logs postgres

# Verificar credenciales en .env
cat .env | grep DB_
```

### ❌ Portainer no se carga

```bash
# Recrear volumen
docker compose down portainer
docker compose up -d portainer
```

### ❌ Frontend no conecta con Backend

```bash
# Verificar CORS en backend
curl -H "Origin: http://localhost" http://api.dominio.com

# Ver logs del backend
docker compose logs backend
```

---

## 📚 Recursos Adicionales

- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Traefik Documentation](https://doc.traefik.io/)
- [Portainer Docs](https://docs.portainer.io/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [PHP-FPM](https://www.php.net/manual/en/install.fpm.php)

---

## 👥 Equipo

**Proyecto Final - DevOps VPS**

- Integrante 1:Paul Andres Gallo Erazo
- Integrante 2:Jorge Rafael Yugsi Yugsi

---

## 📝 Licencia

Proyecto educativo - Licencia MIT

---

## 🎯 Checklist de Entrega

- [ ] ✅ Repositorio GitHub con código completo
- [ ] ✅ README con documentación
- [ ] ✅ Docker Compose funcional
- [ ] ✅ Traefik configurado con subdominios
- [ ] ✅ Portainer accesible
- [ ] ✅ Frontend desplegado y funcionando
- [ ] ✅ Backend API operativo
- [ ] ✅ Base de datos con administrador
- [ ] ✅ Formulario de registro completo
- [ ] ✅ GitHub Actions CI/CD
- [ ] ✅ Todos los servicios funcionando el día de defensa

---

**Proyecto** 🚀
