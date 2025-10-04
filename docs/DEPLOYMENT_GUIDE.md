# 🚀 Guía Completa de Despliegue

## Índice
1. [Prerequisitos](#prerequisitos)
2. [Despliegue Local con Docker](#despliegue-local-con-docker)
3. [Configuración de Servicios](#configuración-de-servicios)
4. [Verificación de Despliegue](#verificación-de-despliegue)
5. [Monitoreo y Logging](#monitoreo-y-logging)
6. [Troubleshooting](#troubleshooting)
7. [Despliegue en Producción](#despliegue-en-producción)

---

## Prerequisitos

### Software Requerido
- **Docker**: v20.10+ 
- **Docker Compose**: v2.0+
- **Node.js**: v18+ (para desarrollo)
- **Git**: Para clonar el repositorio

### Verificar Instalación
```bash
# Verificar versiones
docker --version
docker-compose --version
node --version
git --version

# Verificar que Docker esté ejecutándose
docker ps
```

### Puertos Requeridos
Asegúrate de que estos puertos estén disponibles:
- **80**: Traefik HTTP
- **3000**: Order Service
- **4200**: Frontend React
- **5432**: PostgreSQL
- **6379**: Redis
- **8000**: User Service  
- **8080**: Traefik Dashboard
- **8081**: Login Service
- **8500**: Consul UI
- **27017**: MongoDB

---

## Despliegue Local con Docker

### 1. Clonar y Configurar Proyecto
```bash
# Clonar repositorio
git clone <repository-url>
cd Project-Software-Engineering

# Copiar variables de entorno
cp env.example .env

# Verificar estructura
ls -la
```

### 2. Configurar Variables de Entorno
Editar el archivo `.env`:
```bash
# Database Configuration
POSTGRES_DB=user_management
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin123
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

# MongoDB Configuration  
MONGODB_URI=mongodb://mongodb:27017/orders
MONGODB_DATABASE=orders

# Redis Configuration
REDIS_URL=redis://redis:6379
REDIS_HOST=redis
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRATION=24h

# Service Ports
LOGIN_SERVICE_PORT=8081
USER_SERVICE_PORT=8000
ORDER_SERVICE_PORT=3000
FRONTEND_PORT=4200

# Consul Configuration
CONSUL_URL=http://consul:8500

# Environment
NODE_ENV=development
```

### 3. Construir y Ejecutar Servicios

#### Opción A: Despliegue Completo
```bash
# Construir todas las imágenes
docker-compose build

# Ejecutar todos los servicios
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f
```

#### Opción B: Despliegue por Capas
```bash
# 1. Iniciar bases de datos
docker-compose up -d postgres mongodb redis consul

# 2. Esperar inicialización (30 segundos)
sleep 30

# 3. Iniciar servicios backend
docker-compose up -d login-service user-service order-service

# 4. Iniciar API Gateway
docker-compose up -d traefik

# 5. Iniciar frontend
docker-compose up -d frontend
```

### 4. Verificar Estado de Servicios
```bash
# Ver estado de contenedores
docker-compose ps

# Verificar logs específicos
docker-compose logs login-service
docker-compose logs user-service  
docker-compose logs order-service
docker-compose logs frontend

# Verificar conectividad de red
docker network ls
docker network inspect project-software-engineering_microservices-network
```

---

## Configuración de Servicios

### Inicialización de Bases de Datos

#### PostgreSQL - User Service
```bash
# Conectar a PostgreSQL
docker-compose exec postgres psql -U admin -d user_management

# Verificar tabla de usuarios
\dt
SELECT * FROM users LIMIT 5;
\q
```

#### MongoDB - Order Service  
```bash
# Conectar a MongoDB
docker-compose exec mongodb mongosh

# Usar base de datos
use orders

# Verificar colección
show collections
db.orders.find().limit(5)
exit
```

#### Redis - Login Service
```bash
# Conectar a Redis
docker-compose exec redis redis-cli

# Verificar funcionamiento
ping
keys *
exit
```

### Service Discovery con Consul

#### Verificar Registro de Servicios
```bash
# Ver servicios registrados
curl http://localhost:8500/v1/agent/services

# Verificar health checks
curl http://localhost:8500/v1/health/checks/in-state/passing
```

#### Acceder a Consul UI
- URL: http://localhost:8500
- Verificar que todos los servicios estén "healthy"

### API Gateway con Traefik

#### Verificar Dashboard
- URL: http://localhost:8080
- Ver rutas configuradas y servicios activos

#### Verificar Rutas API
```bash
# Test login endpoint
curl -X POST http://localhost/login/authuser \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}'

# Test user service health
curl http://localhost/customer/health

# Test order service health  
curl http://localhost/order/health
```

---

## Verificación de Despliegue

### Tests de Conectividad

#### 1. Frontend Access
```bash
# Verificar frontend
curl -I http://localhost:4200
# Debe retornar 200 OK

# Verificar en browser
open http://localhost:4200
```

#### 2. API Endpoints
```bash
# Crear usuario de prueba
curl -X POST http://localhost/login/registeruser \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpass123",
    "email": "test@example.com"
  }'

# Autenticar usuario
curl -X POST http://localhost/login/authuser \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser", 
    "password": "testpass123"
  }'

# Crear cliente (necesita token JWT)
TOKEN="<jwt-token-from-login>"
curl -X POST http://localhost/customer/createcustomer \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "document": "12345678",
    "firstname": "Juan",
    "lastname": "Pérez", 
    "address": "Calle 123",
    "phone": "+57300123456",
    "email": "juan@example.com"
  }'

# Crear pedido
curl -X POST http://localhost/order/createorder \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerID": "12345678",
    "orderID": "ORD-001"
  }'
```

### Health Checks Automáticos
```bash
#!/bin/bash
# Script: health_check.sh

echo "=== Verificación de Salud de Servicios ==="

services=("login-service:8081" "user-service:8000" "order-service:3000")

for service in "${services[@]}"; do
    name=$(echo $service | cut -d':' -f1)
    port=$(echo $service | cut -d':' -f2)
    
    echo "Verificando $name..."
    if curl -f -s "http://localhost:$port/health" > /dev/null; then
        echo "✅ $name - Saludable"
    else
        echo "❌ $name - No responde"
    fi
done

echo "=== Verificación de Bases de Datos ==="

# PostgreSQL
if docker-compose exec -T postgres pg_isready -U admin > /dev/null 2>&1; then
    echo "✅ PostgreSQL - Conectado"
else
    echo "❌ PostgreSQL - Error de conexión"
fi

# Redis
if docker-compose exec -T redis redis-cli ping | grep -q "PONG"; then
    echo "✅ Redis - Conectado"
else  
    echo "❌ Redis - Error de conexión"
fi

# MongoDB
if docker-compose exec -T mongodb mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then
    echo "✅ MongoDB - Conectado"
else
    echo "❌ MongoDB - Error de conexión"
fi

echo "=== Verificación Completa ==="
```

```bash
# Hacer ejecutable y correr
chmod +x health_check.sh
./health_check.sh
```

---

## Monitoreo y Logging

### Centralized Logging

#### Configurar ELK Stack (Opcional)
```yaml
# docker-compose.monitoring.yml
version: '3.8'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.8.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    
  logstash:
    image: docker.elastic.co/logstash/logstash:8.8.0
    ports:
      - "5000:5000"
    volumes:
      - ./logstash/logstash.conf:/usr/share/logstash/pipeline/logstash.conf
      
  kibana:
    image: docker.elastic.co/kibana/kibana:8.8.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch
```

#### Ver Logs por Servicio
```bash
# Logs en tiempo real
docker-compose logs -f login-service
docker-compose logs -f user-service
docker-compose logs -f order-service

# Logs con timestamp
docker-compose logs -t --since="1h" frontend

# Filtrar logs por nivel
docker-compose logs login-service | grep ERROR
```

### Métricas y Monitoreo

#### Prometheus + Grafana (Opcional)
```yaml
# docker-compose.metrics.yml
version: '3.8'
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      
  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

#### Dashboard de Servicios
El frontend incluye un dashboard básico en `/dashboard` que muestra:
- Estado de servicios (Online/Offline)
- Última verificación de health
- Métricas básicas

---

## Troubleshooting

### Problemas Comunes

#### 1. Puerto Ya en Uso
```bash
# Verificar qué proceso usa el puerto
lsof -i :8080
sudo lsof -i :80

# Matar proceso si es necesario
kill -9 <PID>

# Cambiar puerto en docker-compose.yml si persiste
```

#### 2. Contenedor No Inicia
```bash
# Ver logs detallados
docker-compose logs <service-name>

# Inspeccionar contenedor
docker inspect <container-id>

# Ejecutar shell dentro del contenedor
docker-compose exec <service-name> sh
```

#### 3. Problemas de Red
```bash
# Recrear red
docker-compose down
docker network prune
docker-compose up -d

# Verificar conectividad entre contenedores
docker-compose exec login-service ping postgres
docker-compose exec user-service ping consul
```

#### 4. Base de Datos No Conecta
```bash
# PostgreSQL
docker-compose exec postgres pg_isready -U admin
docker-compose logs postgres

# MongoDB  
docker-compose exec mongodb mongosh --eval "db.runCommand('ping')"
docker-compose logs mongodb

# Redis
docker-compose exec redis redis-cli ping
docker-compose logs redis
```

#### 5. JWT Token Inválido
```bash
# Verificar configuración JWT
docker-compose exec login-service env | grep JWT

# Regenerar token
curl -X POST http://localhost/login/authuser \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}'
```

### Scripts de Diagnóstico

#### Diagnóstico Completo
```bash
#!/bin/bash
# Script: diagnose.sh

echo "=== Diagnóstico del Sistema ==="

echo "1. Estado de Contenedores:"
docker-compose ps

echo -e "\n2. Uso de Red:"
docker network ls | grep microservices

echo -e "\n3. Verificación de Puertos:"
netstat -tlnp | grep -E "(80|3000|4200|5432|6379|8000|8080|8081|8500|27017)"

echo -e "\n4. Logs de Errores Recientes:"
docker-compose logs --since="10m" 2>&1 | grep -i error | tail -10

echo -e "\n5. Espacio en Disco:"
df -h | head -2
docker system df

echo -e "\n6. Memoria RAM:"
free -h

echo "=== Fin del Diagnóstico ==="
```

### Recovery Procedures

#### Reinicio Limpio
```bash
# Parar todos los servicios
docker-compose down

# Limpiar volúmenes (CUIDADO: borra datos)
docker-compose down -v

# Limpiar caché de build
docker system prune -f

# Reconstruir e iniciar
docker-compose build --no-cache
docker-compose up -d
```

#### Backup de Datos
```bash
# Backup PostgreSQL
docker-compose exec postgres pg_dump -U admin user_management > backup_postgres.sql

# Backup MongoDB
docker-compose exec mongodb mongodump --db orders --out /backup
docker cp $(docker-compose ps -q mongodb):/backup ./backup_mongodb

# Backup Redis (si tiene datos persistentes)
docker-compose exec redis redis-cli --rdb /backup/redis_backup.rdb
```

---

## Despliegue en Producción

### Consideraciones de Seguridad

#### 1. Variables de Entorno
```bash
# Usar secrets manager en producción
export JWT_SECRET=$(openssl rand -base64 32)
export POSTGRES_PASSWORD=$(openssl rand -base64 16)
```

#### 2. HTTPS/TLS
```yaml
# traefik/traefik.yml - Configuración SSL
entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entrypoint:
          to: websecure
          scheme: https
  websecure:
    address: ":443"

certificatesResolvers:
  letsencrypt:
    acme:
      email: admin@yourdomain.com
      storage: acme.json
      httpChallenge:
        entryPoint: web
```

#### 3. Firewall y Networking
```bash
# Solo exponer puertos necesarios
# 80, 443 para web traffic
# Bloquear acceso directo a bases de datos desde internet
```

### Escalabilidad

#### 1. Réplicas de Servicios
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  login-service:
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

#### 2. Load Balancing
```yaml
# traefik/dynamic.yml
http:
  services:
    login-service:
      loadBalancer:
        servers:
          - url: "http://login-service-1:8081"
          - url: "http://login-service-2:8081" 
          - url: "http://login-service-3:8081"
        healthCheck:
          path: "/health"
          interval: "30s"
```

### Monitoreo en Producción

#### 1. Alertas Automáticas
```yaml
# alertmanager/config.yml
global:
  smtp_smarthost: 'localhost:587'
  smtp_from: 'alerts@yourdomain.com'

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'

receivers:
- name: 'web.hook'
  email_configs:
  - to: 'admin@yourdomain.com'
    subject: 'Alert: {{ .GroupLabels.alertname }}'
```

#### 2. Health Checks Avanzados
```bash
#!/bin/bash
# health_check_prod.sh

# Verificar endpoints críticos
endpoints=(
  "http://localhost/login/health"
  "http://localhost/customer/health" 
  "http://localhost/order/health"
)

for endpoint in "${endpoints[@]}"; do
  if ! curl -f -s --max-time 5 "$endpoint" > /dev/null; then
    echo "CRITICAL: $endpoint no responde" | mail -s "Servicio Caído" admin@yourdomain.com
  fi
done
```

---

*Esta guía proporciona instrucciones completas para desplegar y mantener el sistema de microservicios en cualquier ambiente, desde desarrollo local hasta producción empresarial.*