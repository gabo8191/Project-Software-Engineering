# Estructura del Proyecto - Sistema de Gestión de Pedidos

## 📁 Estructura de Directorios

```
Project-Software-Engineering/
├── 📄 README.md                           # Documentación principal
├── 📄 PROJECT_STRUCTURE.md               # Este archivo
├── 📄 env.example                        # Variables de entorno
├── 📄 docker-compose.yml                 # Orquestación principal
├── 📄 docker-compose.databases.yml       # Bases de datos
├── 📄 docker-compose.infrastructure.yml  # Infraestructura
├── 📄 docker-compose.services.yml        # Microservicios
├── 📄 docker-compose.frontend.yml        # Frontend
│
├── 📁 login-service/                     # LoginMicroservice (Go + Gin + Redis)
│   ├── 📄 Dockerfile
│   ├── 📄 go.mod
│   ├── 📄 go.sum
│   ├── 📄 main.go                        # Punto de entrada
│   ├── 📁 cmd/                           # Comandos de aplicación
│   │   └── 📁 server/
│   │       └── 📄 main.go
│   ├── 📁 internal/                      # Código privado de la aplicación
│   │   ├── 📁 handlers/                  # Controladores HTTP (Gin)
│   │   │   ├── 📄 auth.go
│   │   │   └── 📄 health.go
│   │   ├── 📁 models/                    # DTOs y estructuras
│   │   │   ├── 📄 user.go
│   │   │   └── 📄 request.go
│   │   ├── 📁 services/                  # Lógica de negocio
│   │   │   ├── 📄 auth_service.go
│   │   │   └── 📄 redis_service.go
│   │   ├── 📁 repository/                # Acceso a datos
│   │   │   └── 📄 redis_repository.go
│   │   ├── 📁 config/                    # Configuración
│   │   │   └── 📄 config.go
│   │   └── 📁 middleware/                # Middleware personalizado
│   │       └── 📄 cors.go
│   ├── 📁 pkg/                           # Código reutilizable
│   │   ├── 📁 utils/
│   │   └── 📁 logger/
│   └── 📁 api/                           # Especificaciones API
│       └── 📄 openapi.yaml
│
├── 📁 user-service/                      # UserMgmtMicroservice (Python + FastAPI + PostgreSQL)
│   ├── 📄 Dockerfile
│   ├── 📄 requirements.txt
│   ├── 📄 main.py                        # Punto de entrada FastAPI
│   ├── 📁 app/                           # Aplicación principal
│   │   ├── 📄 __init__.py
│   │   ├── 📄 dependencies.py            # Dependencias FastAPI
│   │   ├── 📁 api/                       # Routers de FastAPI
│   │   │   ├── 📄 __init__.py
│   │   │   ├── 📄 v1/
│   │   │   │   ├── 📄 __init__.py
│   │   │   │   ├── 📄 customer.py        # Endpoints de customer
│   │   │   │   └── 📄 health.py          # Health check
│   │   │   └── 📄 deps.py               # Dependencias de API
│   │   ├── 📁 core/                      # Configuración central
│   │   │   ├── 📄 __init__.py
│   │   │   ├── 📄 config.py             # Settings con Pydantic
│   │   │   ├── 📄 security.py           # JWT, hashing
│   │   │   └── 📄 database.py           # Conexión DB
│   │   ├── 📁 models/                    # Modelos SQLAlchemy
│   │   │   ├── 📄 __init__.py
│   │   │   └── 📄 customer.py           # Modelo Customer
│   │   ├── 📁 schemas/                   # Pydantic schemas (DTOs)
│   │   │   ├── 📄 __init__.py
│   │   │   ├── 📄 customer.py           # DTOs de Customer
│   │   │   └── 📄 base.py               # Schemas base
│   │   ├── 📁 services/                  # Lógica de negocio
│   │   │   ├── 📄 __init__.py
│   │   │   └── 📄 customer_service.py   # Servicio de Customer
│   │   ├── 📁 crud/                      # Operaciones CRUD
│   │   │   ├── 📄 __init__.py
│   │   │   └── 📄 customer.py           # CRUD Customer
│   │   └── 📁 tests/                     # Tests unitarios
│   │       ├── 📄 __init__.py
│   │       └── 📄 test_customer.py
│   └── 📁 alembic/                       # Migraciones de DB
│       ├── 📄 env.py
│       └── 📁 versions/
│
├── 📁 order-service/                     # OrderMgmtMicroservice (Node.js + Express + MongoDB)
│   ├── 📄 Dockerfile
│   ├── 📄 package.json
│   ├── 📄 server.js                      # Punto de entrada Express
│   ├── 📁 src/                           # Código fuente
│   │   ├── 📁 controllers/               # Controladores Express
│   │   │   ├── 📄 orderController.js
│   │   │   └── 📄 healthController.js
│   │   ├── 📁 models/                    # Modelos Mongoose
│   │   │   ├── 📄 Order.js
│   │   │   └── 📄 index.js
│   │   ├── 📁 routes/                    # Rutas Express
│   │   │   ├── 📄 orderRoutes.js
│   │   │   ├── 📄 healthRoutes.js
│   │   │   └── 📄 index.js
│   │   ├── 📁 services/                  # Lógica de negocio
│   │   │   ├── 📄 orderService.js
│   │   │   └── 📄 validationService.js
│   │   ├── 📁 middleware/                # Middleware Express
│   │   │   ├── 📄 auth.js
│   │   │   ├── 📄 errorHandler.js
│   │   │   └── 📄 validation.js
│   │   ├── 📁 config/                    # Configuración
│   │   │   ├── 📄 database.js
│   │   │   ├── 📄 environment.js
│   │   │   └── 📄 logger.js
│   │   ├── 📁 utils/                     # Utilidades
│   │   │   ├── 📄 helpers.js
│   │   │   └── 📄 constants.js
│   │   └── 📁 types/                     # TypeScript types (opcional)
│   │       └── 📄 order.types.ts
│   ├── 📁 tests/                         # Tests
│   │   ├── 📄 order.test.js
│   │   └── 📄 setup.js
│   └── 📁 docs/                          # Documentación específica
│       └── 📄 api.md
│
├── 📁 frontend/                          # Frontend (Angular + Nginx)
│   ├── 📄 Dockerfile
│   ├── 📄 nginx.conf
│   ├── 📄 package.json
│   ├── 📁 src/
│   │   ├── 📁 app/
│   │   │   ├── 📁 components/            # Componentes Angular
│   │   │   ├── 📁 services/              # Servicios Angular
│   │   │   ├── 📁 models/                # Interfaces TypeScript
│   │   │   └── 📁 guards/                # Guards de autenticación
│   │   └── 📁 assets/                    # Recursos estáticos
│   └── 📁 dist/                          # Build de producción
│
├── 📁 consul/                            # Service Discovery
│   └── 📄 consul.json
│
├── 📁 traefik/                           # API Gateway
│   ├── 📄 traefik.yml
│   └── 📄 dynamic.yml
│
├── 📁 postgres/                          # Base de datos PostgreSQL
│   └── 📄 init.sql
│
├── 📁 mongodb/                           # Base de datos MongoDB
│   └── 📄 init-mongo.js
│
└── 📁 docs/                              # Documentación del proyecto
    ├── 📄 SDD.md                         # Software Design Document
    ├── 📄 API_DOCUMENTATION.md           # Documentación de APIs
    ├── 📄 DEPLOYMENT_GUIDE.md            # Guía de despliegue
    └── 📁 diagrams/                      # Diagramas UML
        ├── 📄 deployment_diagram.md      # Diagrama de despliegue
        ├── 📄 component_diagram.md       # Diagrama de componentes
        └── 📄 sequence_diagrams.md       # Diagramas de secuencia
```

## 🏗️ Arquitectura del Sistema

### **📋 Estructura por Framework - Mejores Prácticas**

#### **🔵 Go + Gin (LoginMicroservice)**

- **`internal/`**: Código privado que no se puede importar desde fuera
- **`cmd/`**: Puntos de entrada de la aplicación (patrón estándar Go)
- **`pkg/`**: Código reutilizable que puede ser importado por otros proyectos
- **`handlers/`**: Controladores HTTP específicos de Gin
- **`repository/`**: Patrón Repository para acceso a datos
- **Ventajas**: Separación clara entre código público/privado, fácil testing

#### **🐍 Python + FastAPI (UserMgmtMicroservice)**

- **`app/`**: Estructura modular de FastAPI
- **`schemas/`**: Pydantic models para validación (DTOs)
- **`models/`**: SQLAlchemy models para ORM
- **`crud/`**: Operaciones CRUD separadas de la lógica de negocio
- **`alembic/`**: Migraciones de base de datos
- **Ventajas**: Separación clara entre DTOs y modelos, migraciones automáticas

#### **🟨 Node.js + Express (OrderMgmtMicroservice)**

- **`src/`**: Código fuente organizado
- **`controllers/`**: Controladores Express (MVC pattern)
- **`models/`**: Modelos Mongoose para MongoDB
- **`middleware/`**: Middleware personalizado de Express
- **`services/`**: Lógica de negocio separada
- **Ventajas**: Estructura familiar para desarrolladores web, fácil escalabilidad

### **Microservicios:**

1. **LoginMicroservice** (Go + Gin + Redis)

   - **Puerto**: 8080
   - **Endpoints**: `/login/createuser`, `/login/authuser`
   - **Base de datos**: Redis (para sesiones)

2. **UserMgmtMicroservice** (Python + FastAPI + PostgreSQL)

   - **Puerto**: 8000
   - **Endpoints**: `/customer/createcustomer`, `/customer/findcustomerbyid`
   - **Base de datos**: PostgreSQL (CustomerDB)

3. **OrderMgmtMicroservice** (Node.js + Express + MongoDB)
   - **Puerto**: 3000
   - **Endpoints**: `/order/createorder`, `/order/updateorderstatus`, `/order/findorderbycustomerid`
   - **Base de datos**: MongoDB (OrderDB)

### **Infraestructura:**

- **Frontend**: Angular + Nginx (Puerto 4200)
- **API Gateway**: Traefik (Puerto 80/443/8080)
- **Service Discovery**: Consul (Puerto 8500)

## 📊 Endpoints del Sistema

### **Login Microservice** (`/login`)

- `POST /login/createuser` - Registrar usuario
- `POST /login/authuser` - Autenticar usuario

### **Customer Microservice** (`/customer`)

- `POST /customer/createcustomer` - Crear cliente
- `GET /customer/findcustomerbyid` - Buscar cliente por ID

### **Order Microservice** (`/order`)

- `POST /order/createorder` - Crear pedido
- `PUT /order/updateorderstatus` - Modificar estado del pedido
- `GET /order/findorderbycustomerid` - Buscar pedidos por cliente

## 🗄️ Estructura de Datos

### **CustomerDB (PostgreSQL)**

```sql
Table: Customer
- document (VARCHAR) - PK
- firstname (VARCHAR)
- lastname (VARCHAR)
- address (TEXT)
- phone (VARCHAR)
- email (VARCHAR)
```

### **OrderDB (MongoDB)**

```javascript
Collection: Order -
  customerID(String) -
  orderID(String) -
  status(String) -
  ['Received', 'In progress', 'Sended'];
```

## 🚀 Comandos de Despliegue

```bash
# Levantar toda la infraestructura
docker-compose up -d

# Levantar solo bases de datos
docker-compose -f docker-compose.databases.yml up -d

# Levantar solo microservicios
docker-compose -f docker-compose.services.yml up -d

# Ver logs
docker-compose logs -f [service-name]
```

## 💻 Ejemplos de Estructura de Código

### **🔵 Go + Gin - Ejemplo de Handler**

```go
// internal/handlers/auth.go
package handlers

import (
    "net/http"
    "github.com/gin-gonic/gin"
)

type AuthHandler struct {
    authService services.AuthService
}

func (h *AuthHandler) CreateUser(c *gin.Context) {
    var req models.CreateUserRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    result := h.authService.CreateUser(req)
    c.JSON(http.StatusOK, result)
}
```

### **🐍 Python + FastAPI - Ejemplo de Router**

```python
# app/api/v1/customer.py
from fastapi import APIRouter, Depends
from app.schemas.customer import CustomerCreate, CustomerResponse
from app.services.customer_service import CustomerService

router = APIRouter()

@router.post("/createcustomer", response_model=CustomerResponse)
async def create_customer(
    customer: CustomerCreate,
    service: CustomerService = Depends()
):
    return await service.create_customer(customer)
```

### **🟨 Node.js + Express - Ejemplo de Controller**

```javascript
// src/controllers/orderController.js
const orderService = require('../services/orderService');

const createOrder = async (req, res) => {
  try {
    const { customerid, orderID, status } = req.body;
    const result = await orderService.createOrder({
      customerid,
      orderID,
      status,
    });
    res.json({ orderCreated: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createOrder };
```

## 📋 Checklist de Implementación

- [x] Infraestructura Docker configurada
- [x] Esquemas de base de datos definidos
- [x] Routing de Traefik configurado
- [x] Estructura de directorios creada
- [x] Estructura optimizada por framework
- [ ] Implementación de microservicios
- [ ] Implementación de frontend
- [ ] Documentación técnica
- [ ] Diagramas UML
- [ ] Manual de despliegue
