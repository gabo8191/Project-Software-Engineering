# Microservices Project

Este proyecto implementa una arquitectura de microservicios con las siguientes tecnologías:

## 🏗️ Arquitectura

### Servicios

- **Login Service**: Go + Gin + Redis
- **User Service**: Python + FastAPI + PostgreSQL
- **Order Service**: Node.js + Express + MongoDB
- **Frontend**: Angular + Nginx

### Infraestructura

- **Service Discovery**: Consul
- **API Gateway**: Traefik
- **Monitoring**: Prometheus + Grafana
- **Tracing**: Jaeger

## 🚀 Inicio Rápido

### Prerrequisitos

- Docker
- Docker Compose
- Git

### Configuración

1. **Clonar el repositorio**

   ```bash
   git clone <repository-url>
   cd Project-Software-Engineering
   ```

2. **Configurar variables de entorno**

   ```bash
   cp env.example .env
   # Las credenciales por defecto están configuradas para desarrollo local
   ```

3. **Levantar toda la infraestructura**

   ```bash
   docker-compose up -d
   ```

4. **Verificar servicios**

   ```bash
   docker-compose ps
   ```

5. **Ver logs si hay problemas**
   ```bash
   docker-compose logs -f
   ```

> 📋 **Instrucciones detalladas**: Ver [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md) para configuración completa

## 📊 Servicios y Puertos

| Servicio          | Puerto | Descripción          |
| ----------------- | ------ | -------------------- |
| Frontend          | 4200   | Angular App          |
| Traefik Dashboard | 8080   | API Gateway UI       |
| Login Service     | 8080   | Auth API             |
| User Service      | 8000   | Users API            |
| Order Service     | 3000   | Orders API           |
| Consul UI         | 8500   | Service Discovery    |
| Grafana           | 3001   | Monitoring Dashboard |
| Prometheus        | 9090   | Metrics              |
| Jaeger UI         | 16686  | Distributed Tracing  |

## 🗄️ Bases de Datos

| Base de Datos | Puerto | Servicio      |
| ------------- | ------ | ------------- |
| Redis         | 6379   | Login Service |
| PostgreSQL    | 5432   | User Service  |
| MongoDB       | 27017  | Order Service |

## 🔧 Comandos Útiles

### Levantar servicios individuales

```bash
# Solo bases de datos
docker-compose -f docker-compose.databases.yml up -d

# Solo infraestructura
docker-compose -f docker-compose.infrastructure.yml up -d

# Solo microservicios
docker-compose -f docker-compose.services.yml up -d

# Solo frontend
docker-compose -f docker-compose.frontend.yml up -d
```

### Ver logs

```bash
# Todos los servicios
docker-compose logs -f

# Servicio específico
docker-compose logs -f login-service
```

### Reiniciar servicios

```bash
# Reiniciar un servicio
docker-compose restart login-service

# Reconstruir y reiniciar
docker-compose up -d --build login-service
```

### Limpiar todo

```bash
# Parar y eliminar contenedores
docker-compose down

# Eliminar también volúmenes
docker-compose down -v

# Eliminar imágenes también
docker-compose down -v --rmi all
```

## 🏥 Health Checks

Todos los servicios incluyen health checks. Puedes verificar el estado con:

```bash
# Estado de todos los servicios
docker-compose ps

# Health check específico
curl http://localhost:8080/health  # Login Service
curl http://localhost:8000/health  # User Service
curl http://localhost:3000/health  # Order Service
curl http://localhost:4200/health  # Frontend
```

## 🔍 Monitoreo

### Grafana

- URL: http://localhost:3001
- Usuario: admin
- Contraseña: admin (configurable en .env)

### Prometheus

- URL: http://localhost:9090

### Jaeger

- URL: http://localhost:16686

### Consul

- URL: http://localhost:8500

## 🛠️ Desarrollo

### Estructura del Proyecto

```
Project-Software-Engineering/
├── consul/                 # Configuración de Consul
├── traefik/               # Configuración de Traefik
├── prometheus/            # Configuración de Prometheus
├── grafana/               # Configuración de Grafana
├── postgres/              # Scripts de inicialización de PostgreSQL
├── mongodb/               # Scripts de inicialización de MongoDB
├── frontend/              # Aplicación Angular
├── login-service/         # Servicio de autenticación (Go)
├── user-service/          # Servicio de usuarios (Python)
├── order-service/         # Servicio de órdenes (Node.js)
├── docker-compose.yml     # Orquestación principal
└── README.md
```

### Agregar un nuevo servicio

1. Crear directorio del servicio
2. Agregar Dockerfile
3. Actualizar docker-compose.yml
4. Configurar Traefik labels
5. Agregar health checks

## 🔒 Seguridad

- Todos los contenedores corren como usuarios no-root
- Variables de entorno para credenciales sensibles
- Headers de seguridad configurados en Traefik
- CORS configurado para desarrollo

## 📝 Notas

- Los puertos están configurados para desarrollo local
- Para producción, cambiar puertos y configuraciones de seguridad
- Los health checks pueden tardar unos minutos en pasar al inicio
- Las bases de datos persisten datos en volúmenes Docker

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abrir un Pull Request
