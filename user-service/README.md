# 🐍 User Service - Customer Management Microservice

## 📋 Descripción

El **User Service** es un microservicio desarrollado en **Python + FastAPI + PostgreSQL** que se encarga de la gestión completa de clientes en el sistema de pedidos. Este servicio forma parte de una arquitectura de microservicios y se integra con otros servicios a través de **Consul** para el service discovery y **Traefik** como API Gateway.

## 🎯 Funcionalidades

### Endpoints Principales

#### 1. **Crear Cliente** (`POST /customer/createcustomer`)
- **Descripción:** Crea un nuevo cliente en el sistema
- **Parámetros de entrada:**
  ```json
  {
    "document": "string",
    "firstname": "string", 
    "lastname": "string",
    "address": "string",
    "phone": "string",
    "email": "string"
  }
  ```
- **Respuesta:**
  ```json
  {
    "createCustomerValid": true/false
  }
  ```

#### 2. **Buscar Cliente por ID** (`GET /customer/findcustomerbyid`)
- **Descripción:** Busca un cliente por su documento de identidad
- **Parámetro:** `customerid` (string)
- **Respuesta:**
  ```json
  {
    "document": "string",
    "firstname": "string",
    "lastname": "string", 
    "address": "string",
    "phone": "string",
    "email": "string"
  }
  ```

#### 3. **Modificar Cliente** (`PUT /customer/updatecustomer`)
- **Descripción:** Actualiza la información de un cliente existente
- **Parámetros:** Todos los campos del cliente (opcionales)
- **Respuesta:**
  ```json
  {
    "updateCustomerValid": true/false
  }
  ```

#### 4. **Eliminar Cliente** (`DELETE /customer/deletecustomer/{customerid}`)
- **Descripción:** Elimina un cliente del sistema
- **Parámetro:** `customerid` (string)

#### 5. **Listar Clientes** (`GET /customer/customers`)
- **Descripción:** Obtiene una lista paginada de todos los clientes
- **Parámetros opcionales:** `skip` (int), `limit` (int)

#### 6. **Buscar Cliente por Email** (`GET /customer/customerbyemail/{email}`)
- **Descripción:** Busca un cliente por su dirección de email

### Health Checks

- **Health** (`GET /health/health`): Estado general del servicio
- **Ready** (`GET /health/ready`): Verifica dependencias (base de datos)
- **Live** (`GET /health/live`): Verifica que el servicio está corriendo

## 🏗️ Arquitectura Técnica

### Stack Tecnológico
- **Lenguaje:** Python 3.11+
- **Framework:** FastAPI
- **ORM:** SQLAlchemy 2.0
- **Base de Datos:** PostgreSQL
- **Validación:** Pydantic
- **Service Discovery:** Consul
- **API Gateway:** Traefik

### Patrón DTO (Data Transfer Object)
El servicio implementa el patrón DTO para separar:
- **Modelos de base de datos** (SQLAlchemy models)
- **DTOs de entrada** (Pydantic models para requests)
- **DTOs de salida** (Pydantic models para responses)
- **Mapeo automático** entre modelos y DTOs

### Estructura del Proyecto
```
user-service/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── models/
│   │   └── customer.py      # SQLAlchemy models
│   ├── schemas/
│   │   └── customer.py      # Pydantic DTOs
│   ├── crud/
│   │   └── customer.py      # Database operations
│   ├── api/
│   │   └── endpoints/
│   │       ├── customer.py   # Customer endpoints
│   │       └── health.py    # Health check endpoints
│   ├── core/
│   │   ├── config.py        # Configuration
│   │   └── database.py      # Database connection
│   └── utils/
│       └── consul.py         # Consul integration
├── requirements.txt
├── Dockerfile
└── README.md
```

## 🗄️ Base de Datos

### Tabla: `customer`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `document` | VARCHAR(50) | Documento de identidad (PK) |
| `firstname` | VARCHAR(100) | Nombre del cliente |
| `lastname` | VARCHAR(100) | Apellido del cliente |
| `address` | VARCHAR(500) | Dirección |
| `phone` | VARCHAR(20) | Teléfono |
| `email` | VARCHAR(100) | Correo electrónico (único) |
| `created_at` | TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | Fecha de última actualización |

## 🚀 Despliegue

### Requisitos
- Docker y Docker Compose
- PostgreSQL (configurado automáticamente)
- Consul (para service discovery)
- Traefik (como API Gateway)

### Comandos de Despliegue

1. **Construir y ejecutar el servicio:**
   ```bash
   docker-compose up --build user-service
   ```

2. **Ejecutar todos los servicios:**
   ```bash
   docker-compose up --build
   ```

3. **Ver logs del servicio:**
   ```bash
   docker-compose logs -f user-service
   ```

### Variables de Entorno
```bash
DATABASE_URL=postgresql://postgres_user:postgres_password_123@postgres:5432/customerdb
CONSUL_HOST=consul
CONSUL_PORT=8500
SERVICE_NAME=user-service
SERVICE_PORT=8000
LOG_LEVEL=INFO
```

## 🔧 Configuración

### Conexión a PostgreSQL
El servicio se conecta automáticamente a PostgreSQL usando la URL de conexión configurada en las variables de entorno.

### Integración con Consul
- **Registro automático:** El servicio se registra automáticamente en Consul al iniciar
- **Health checks:** Implementa checks de salud para Consul
- **Service discovery:** Otros servicios pueden descubrir este servicio a través de Consul

### Exposición a través de Traefik
- **Ruta:** `/customer/*`
- **Puerto interno:** 8000
- **CORS:** Configurado automáticamente

## 🧪 Testing

### Endpoints de Prueba

1. **Crear cliente:**
   ```bash
   curl -X POST "http://localhost/customer/createcustomer" \
        -H "Content-Type: application/json" \
        -d '{
          "document": "12345678",
          "firstname": "Juan",
          "lastname": "Pérez",
          "address": "Calle 123 #45-67",
          "phone": "+57-300-123-4567",
          "email": "juan.perez@email.com"
        }'
   ```

2. **Buscar cliente:**
   ```bash
   curl "http://localhost/customer/findcustomerbyid?customerid=12345678"
   ```

3. **Health check:**
   ```bash
   curl "http://localhost/customer/health"
   ```

### Documentación Automática
- **Swagger UI:** `http://localhost/customer/docs`
- **ReDoc:** `http://localhost/customer/redoc`

## 📊 Monitoreo

### Logs
El servicio genera logs estructurados con información sobre:
- Operaciones de base de datos
- Registro/deregistro en Consul
- Errores y excepciones
- Health checks

### Métricas
- **Health checks:** `/health/health`, `/health/ready`, `/health/live`
- **Service info:** `/info`
- **Database status:** Verificado en health checks

## 🔒 Validaciones

### Validaciones de Entrada
- **Documento:** Requerido, único, no vacío
- **Nombres:** Requeridos, capitalizados automáticamente
- **Email:** Formato válido, único en el sistema
- **Teléfono:** Longitud mínima de 7 caracteres
- **Dirección:** Requerida, no vacía

### Manejo de Errores
- **400:** Datos de entrada inválidos
- **404:** Cliente no encontrado
- **409:** Cliente ya existe (documento duplicado)
- **500:** Error interno del servidor

## 🔄 Integración con Otros Servicios

### Order Service
El Order Service puede consumir este servicio para:
- Verificar existencia de clientes
- Obtener información de clientes para pedidos
- Validar datos de clientes

### Login Service
El Login Service puede integrarse para:
- Autenticación de usuarios
- Validación de permisos
- Gestión de sesiones

## 📝 Notas de Desarrollo

### Patrones Implementados
- **DTO Pattern:** Separación clara entre modelos y DTOs
- **Repository Pattern:** Operaciones CRUD encapsuladas
- **Dependency Injection:** FastAPI dependency system
- **Service Discovery:** Integración automática con Consul

### Mejores Prácticas
- **Logging estructurado:** Para facilitar debugging
- **Manejo de errores:** Respuestas consistentes
- **Validación de datos:** Pydantic models
- **Health checks:** Para monitoreo
- **Documentación automática:** OpenAPI/Swagger

## 🚀 Próximos Pasos

1. **Testing:** Implementar tests unitarios y de integración
2. **Métricas:** Agregar Prometheus metrics
3. **Caching:** Implementar Redis para cache
4. **Rate Limiting:** Protección contra abuso
5. **Audit Log:** Registro de operaciones

---


