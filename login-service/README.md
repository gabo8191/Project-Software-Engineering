# Login Service

Microservicio de autenticación desarrollado en Go con Gin framework y Redis.

## 🏗️ Arquitectura

- **Framework**: Gin (Go)
- **Base de Datos**: Redis
- **Service Discovery**: Consul
- **Logging**: Logrus
- **Validación**: Gin binding

## 📁 Estructura del Proyecto

```
login-service/
├── internal/
│   ├── config/
│   │   └── config.go            # Configuración
│   ├── handlers/
│   │   ├── auth.go              # Handlers de autenticación
│   │   └── health.go            # Health checks
│   ├── middleware/
│   │   ├── cors.go              # CORS middleware
│   │   ├── logger.go            # Logging middleware
│   │   └── recovery.go          # Panic recovery
│   ├── models/
│   │   ├── user.go              # Modelos de usuario
│   │   └── request.go           # Modelos de request
│   ├── repository/
│   │   └── redis_repository.go  # Repositorio Redis
│   └── services/
│       ├── auth_service.go      # Lógica de autenticación
│       └── redis_service.go     # Servicios Redis
├── pkg/
│   ├── logger/
│   │   └── logger.go            # Logger personalizado
│   └── utils/
│       └── helpers.go           # Utilidades
├── api/
│   └── openapi.yaml             # Documentación API
├── Dockerfile
├── go.mod
├── go.sum
└── main.go                      # Punto de entrada
```

## 🚀 Endpoints

### Health Checks

- `GET /health` - Health check general
- `GET /ready` - Readiness check
- `GET /live` - Liveness check

### Autenticación

- `POST /login/createuser` - Crear usuario
- `POST /login/authuser` - Autenticar usuario

## 📋 Variables de Entorno

```bash
# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=redis_password_123
REDIS_DB=0

# Consul Configuration
CONSUL_HOST=consul
CONSUL_PORT=8500

# Service Configuration
SERVICE_NAME=login-service
SERVICE_PORT=8080

# Logging
LOG_LEVEL=info
```

## 🔧 Desarrollo Local

### **⚠️ Importante: Este servicio está diseñado para funcionar con Docker Compose**

El login-service está configurado para funcionar dentro del ecosistema Docker del proyecto. Para desarrollo local, necesitas levantar toda la infraestructura:

```bash
# Desde la raíz del proyecto
docker-compose up -d

# O solo las bases de datos
docker-compose -f docker-compose.databases.yml up -d
```

### **Ejecución Individual (Solo para Testing)**

```bash
# Instalar dependencias
go mod tidy

# Ejecutar (requiere Redis corriendo)
go run main.go

# Ejecutar tests
go test ./...

# Construir binario
go build -o login-service main.go
```

**Nota**: Para ejecutar individualmente, necesitas Redis corriendo en `localhost:6379` sin contraseña.

## 🐳 Docker

```bash
# Construir imagen
docker build -t login-service .

# Ejecutar contenedor
docker run -p 8080:8080 login-service
```

## 📊 Ejemplos de Uso

### Crear Usuario

```bash
curl -X POST http://localhost:8080/login/createuser \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "securepassword123",
    "email": "john.doe@example.com"
  }'
```

### Autenticar Usuario

```bash
curl -X POST http://localhost:8080/login/authuser \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "securepassword123"
  }'
```

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt
- Tokens de sesión seguros
- Validación de entrada
- Headers de seguridad
- CORS configurado

## 📈 Monitoreo

- Health checks para Kubernetes
- Logging estructurado con Logrus
- Métricas de Redis
- Registro en Consul (pendiente)
