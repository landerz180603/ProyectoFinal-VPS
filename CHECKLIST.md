## 📋 Checklist de Despliegue

### Preparación Previa
- [ ] VPS configurado con Ubuntu 20.04+
- [ ] Docker instalado: `docker --version`
- [ ] Docker Compose instalado: `docker-compose --version`
- [ ] Acceso SSH verificado
- [ ] DuckDNS configurado y actualizado
- [ ] Repositorio clonado en el VPS

### Configuración
- [ ] Archivo `.env` creado desde `.env.example`
- [ ] Dominio configurado en `.env`: `landerzgalloerazo.duckdns.org`
- [ ] Contraseña de Traefik cambiada
- [ ] Contraseña de BD cambiada
- [ ] Permisos en `traefik/acme.json`: `chmod 600`

### Lanzamiento Inicial
- [ ] Directorios creados: `mkdir -p traefik postgres backend/src frontend`
- [ ] Comando: `docker-compose up -d`
- [ ] Todos los contenedores corriendo: `docker-compose ps`
- [ ] Esperar 15-20 segundos para inicialización completa

### Verificación de Servicios
- [ ] **Frontend**: `curl http://landerzgalloerazo.duckdns.org` → HTTP 200
- [ ] **Backend**: `curl http://api.landerzgalloerazo.duckdns.org/api` → JSON response
- [ ] **Portainer**: `curl http://portainer.landerzgalloerazo.duckdns.org` → HTTP 200
- [ ] **pgAdmin**: `curl http://pgadmin.landerzgalloerazo.duckdns.org` → HTTP 200
- [ ] **Traefik Dashboard**: `curl http://traefik.landerzgalloerazo.duckdns.org` → HTTP 401 (auth)

### Base de Datos
- [ ] PostgreSQL iniciado sin errores
- [ ] Tabla `usuarios` creada: `docker-compose exec postgres psql -U locores_user -d locores_db -c "\dt"`
- [ ] pgAdmin configurado con credenciales correctas

### Aplicación
- [ ] Formulario de registro carga sin errores
- [ ] Registro de usuario funciona (POST /api/usuarios)
- [ ] Usuario guardado en BD (verificar en pgAdmin)
- [ ] Lista de usuarios se actualiza después del registro

### CI/CD
- [ ] Secrets de GitHub configurados (VPS_HOST, VPS_USER, VPS_SSH_KEY)
- [ ] Workflow `.github/workflows/deploy.yml` presente
- [ ] Push a rama `main` dispara el workflow
- [ ] Despliegue automático funciona

### Documentación
- [ ] README.md completo con instrucciones
- [ ] ARCHITECTURE.md con diagramas
- [ ] TROUBLESHOOTING.md con soluciones comunes
- [ ] Scripts de utilidad: install.sh, update.sh, diagnose.sh, clean.sh

### Pre-Defensa
- [ ] Todos los servicios funcionando sin errores
- [ ] URLs de cada servicio documentadas
- [ ] Formulario de registro completamente funcional
- [ ] Datos persistentes entre reinicios
- [ ] Logs limpios sin errores críticos

### Durante la Defensa
- [ ] Verificar estado: `docker-compose ps`
- [ ] Mostrar Frontend funcionando
- [ ] Demostrar registro de usuario
- [ ] Mostrar datos en pgAdmin
- [ ] Acceder a Portainer
- [ ] Explicar arquitectura desde ARCHITECTURE.md
- [ ] Responder preguntas sobre:
  - Configuración de Traefik
  - Comunicación entre servicios
  - Persistencia de datos
  - Variables de entorno
  - Seguridad implementada
  - CI/CD workflow

### Post-Defensa
- [ ] Hacer commit de cualquier cambio realizado durante defensa
- [ ] Documentar feedback recibido
- [ ] Realizar mejoras sugeridas
- [ ] Actualizar README si es necesario

---

**Estado:** [ ] Listo para defensa  
**Fecha de revisión:** _____________
