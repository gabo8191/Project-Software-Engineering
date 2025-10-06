# MANUAL TÉCNICO — Sistema de Gestión de Pedidos

Versión: 1.0.0  
Fecha: 2025-10-06

Autores / Integrantes:
- Gabriel Castillo Mendieta
- Sebastian Cañón Castellanos   
- Jhon Castro Mancipe

Proyecto: Microservicios (Login, User, Order) + API Gateway (Traefik) + Service Discovery (Consul) + Frontend

---

## 1. Introducción

1.1 Objetivo  
Implementar un sistema de gestión de pedidos basado en microservicios con separación de responsabilidades, alta cohesión, comunicación vía HTTP y descubrimiento de servicios mediante Consul, exponiendo los endpoints a través de un API Gateway (Traefik).

1.2 Alcance  
- Gestión de clientes (crear, actualizar, consultar, eliminar).  
- Gestión de pedidos (crear, actualizar estado, consultar por cliente).  
- Autenticación básica (registro y autenticación de usuarios).  
- Monitoreo, health checks y dashboards (Traefik, Consul).  
- Frontend para visualización del estado del sistema y prueba funcional.

1.3 Propósito  
Servir como guía técnica para instalación, despliegue, configuración, operación y pruebas del sistema, incluyendo vistas arquitectónicas 4+1.

---

## 2. Requisitos Técnicos del Entorno

2.1 Lenguajes y Frameworks  
- Go (Login Service) + Gin  
- Python 3.11+ (User Service) + FastAPI + SQLAlchemy + Pydantic  
- Node.js (Order Service) + Express + Mongoose + Joi  
- Frontend (TypeScript + React; ver código en `frontend/src/pages`)  
- API Gateway: Traefik  
- Service Discovery: Consul

2.2 Bases de Datos  
- Redis (Login Service)  
- PostgreSQL (User Service)  
- MongoDB (Order Service)

2.3 Versiones y herramientas recomendadas  
- Docker 20.10+ / Docker Compose 2.0+  
- Git  
- Node.js LTS (para desarrollo local del order-service si se usa fuera de Docker)  
- Python 3.11 (para desarrollo local del user-service si se usa fuera de Docker)  
- Go 1.20+ (para desarrollo local del login-service si se usa fuera de Docker)

2.4 Puertos y endpoints clave  
- API Gateway (Traefik): 8090  
- Traefik Dashboard: 8080  
- Consul UI: 8500  
- Login Service (externo por Compose): 8081 (el servicio escucha 8080 internamente)  
- User Service: 8000  
- Order Service: 3000  
- Frontend: 4200

Ref.: `README.md` — Servicios y Puertos, `docs/API_DOCUMENTATION.md`

---

## 3. Estructura del Proyecto

Árbol general: ver `PROJECT_STRUCTURE.md`

Carpetas principales:
- Infraestructura:  
  - `consul/`  
  - `traefik/`  
  - `postgres/`  
  - `mongodb/`  
- Microservicios:  
  - `login-service/`  
  - `user-service/`  
  - `order-service/`  
- Frontend:  
  - `frontend/`  
- Orquestación:  
  - `docker-compose.yml`  
  - `docker-compose.databases.yml`  
  - `docker-compose.infrastructure.yml`  
  - `docker-compose.services.yml`  
  - `docker-compose.frontend.yml`  
- Documentación:  
  - `README.md`  
  - `PROJECT_STRUCTURE.md`  
  - `docs/API_DOCUMENTATION.md`

---

## 4. Descripción de Servicios y Componentes

4.1 API Gateway — Traefik  
- Enrutamiento de todas las APIs por http://localhost:8090  
- Dashboard: http://localhost:8080  
- Configuración: ver `traefik/`

4.2 Service Discovery — Consul  
- Registro y descubrimiento automático de servicios  
- UI: http://localhost:8500  
- Configuración: `consul/consul.json`

4.3 Login Service (Go + Gin + Redis)  
- Función: registro y autenticación de usuarios  
- Endpoints: ver `login-service/README.md` y `docs/API_DOCUMENTATION.md`  
  - POST /login/createuser  
  - POST /login/authuser  
  - GET /health, /ready, /live  
- Puertos: externo 8081 (compose), interno/servicio 8080  
- Variables: ver `login-service/README.md` (p. ej. REDIS_HOST, REDIS_PASSWORD, SERVICE_PORT=8080)

4.4 User Service (Python + FastAPI + PostgreSQL)  
- Función: gestión de clientes  
- Código principal: `user-service/app/main.py` (endpoint /info)  
- Configuración: `user-service/app/core/config.py` (clase Settings)  
- Endpoints: ver `user-service/README.md` y `docs/API_DOCUMENTATION.md`  
  - POST /customer/createcustomer  
  - GET /customer/findcustomerbyid  
  - PUT /customer/updatecustomer  
  - DELETE /customer/deletecustomer/{customerid}  
  - GET /customer/customers  
  - GET /customer/customerbyemail/{email}  
  - GET /health/health, /health/ready, /health/live  
  - GET /info  
- DB: tabla customer (ver `user-service/README.md`)  
- Inicialización DB: `user-service/init_db.py`  
- Script de pruebas: `user-service/test_service.py`

4.5 Order Service (Node.js + Express + MongoDB)  
- Función: gestión de pedidos  
- Endpoints: ver `order-service/README.md` y `docs/API_DOCUMENTATION.md`  
  - POST /order/createorder  
  - PUT /order/updateorderstatus  
  - GET /order/findorderbycustomerid  
  - GET /health (y status detallado)  
- Variables: ver `order-service/README.md`

4.6 Frontend (React + TypeScript)  
- Panel y páginas: `frontend/src/pages/` (p. ej. `Dashboard.tsx`, `LandingPage.tsx`)  
- Config API Gateway: `frontend/src/config/api.ts` (constantes API_BASE_URL, API_ENDPOINTS)

---

## 5. Instrucciones de Despliegue

5.1 Despliegue completo (recomendado)

1) Copiar variables de entorno:

```powershell
Copy-Item -Path env.example -Destination .env -Force
```

2) Levantar toda la infraestructura y servicios:

```powershell
docker compose up -d

docker compose ps
```

5.2 Despliegue modular

```powershell
# Solo bases de datos
docker compose -f docker-compose.databases.yml up -d

# Solo infraestructura (Consul, Traefik)
docker compose -f docker-compose.infrastructure.yml up -d

# Solo microservicios (Login, User, Order)
docker compose -f docker-compose.services.yml up -d

# Solo frontend
docker compose -f docker-compose.frontend.yml up -d
```

5.3 Logs y verificación

```powershell
docker compose logs -f

docker compose logs -f login-service

docker compose logs -f user-service

docker compose logs -f order-service

docker compose logs -f traefik

docker compose logs -f consul
```

5.4 Reinicio/limpieza

```powershell
# Reiniciar un servicio
docker compose restart <service>

# Recompilar y levantar un servicio
docker compose up -d --build <service>

# Bajar todo
docker compose down

# Bajar y eliminar volúmenes (datos)
docker compose down -v

# Limpieza completa (imágenes, volúmenes)
docker compose down -v --rmi all
```

Notas:  
- Los servicios realizan health checks; el readiness puede tardar unos minutos tras el arranque.  
- El acceso a servicios debe realizarse vía API Gateway: http://localhost:8090

---

## 6. Configuración del Entorno

6.1 Archivo .env (ejemplos desde documentación)

```dotenv
REDIS_PASSWORD=redis_password_123
POSTGRES_PASSWORD=postgres_password_123
MONGO_ROOT_PASSWORD=mongo_password_123
```

6.2 Variables por servicio (documentadas en cada README)

- Login Service (`login-service/README.md`):  
  - REDIS_HOST=redis  
  - REDIS_PORT=6379  
  - REDIS_PASSWORD=redis_password_123  
  - SERVICE_NAME=login-service  
  - SERVICE_PORT=8080  
  - CONSUL_HOST=consul, CONSUL_PORT=8500

- User Service (`user-service/README.md`, `user-service/app/core/config.py`):  
  - DATABASE_URL=postgresql://postgres_user:postgres_password_123@postgres:5432/customerdb  
  - SERVICE_NAME=user-service  
  - SERVICE_PORT=8000  
  - CONSUL_HOST=consul, CONSUL_PORT=8500  
  - LOG_LEVEL=INFO  
  - CORS permitido (localhost)

- Order Service (`order-service/README.md`):  
  - MONGODB_URI=mongodb://mongo_admin:mongo_password_123@mongodb:27017/OrderDB?authSource=admin  
  - PORT=3000  
  - SERVICE_NAME=order-service  
  - SERVICE_HOST=order-service  
  - CONSUL_HOST=consul, CONSUL_PORT=8500  
  - NODE_ENV=development, LOG_LEVEL=info

6.3 Puertos, hosts y accesos  
- API Gateway: http://localhost:8090  
  - Login: http://localhost:8090/login/*  
  - Customer (User): http://localhost:8090/customer/*  
  - Order: http://localhost:8090/order/*  
- Dashboards:  
  - Traefik: http://localhost:8080  
  - Consul: http://localhost:8500  
- Accesos directos (debug):  
  - Login: http://localhost:8081  
  - User: http://localhost:8000  
  - Order: http://localhost:3000  
  - Frontend: http://localhost:4200

Credenciales y contraseñas (solo ejemplos provistos en documentación):  
- Redis: redis_password_123  
- PostgreSQL: postgres_password_123  
- MongoDB root: mongo_password_123  
- User Service DB URL: incluye postgres_user/postgres_password_123  
Nota: Cambiar en producción.

---

## 7. Guía de Pruebas

7.1 Verificación de health checks (vía API Gateway)

```powershell
# Login
Invoke-WebRequest http://localhost:8090/login/health | Select-Object -ExpandProperty Content
# User
Invoke-WebRequest http://localhost:8090/customer/health | Select-Object -ExpandProperty Content
# Order
Invoke-WebRequest http://localhost:8090/order/health | Select-Object -ExpandProperty Content
```

7.2 Accesos directos (debug)

```powershell
Invoke-WebRequest http://localhost:8081/health | Select-Object -ExpandProperty Content
Invoke-WebRequest http://localhost:8000/health | Select-Object -ExpandProperty Content
Invoke-WebRequest http://localhost:3000/health | Select-Object -ExpandProperty Content
```

7.3 Flujo completo vía API Gateway (ejemplos)

- Crear cliente:

```powershell
$body = '{
  "document": "12345678",
  "firstname": "Juan",
  "lastname": "Pérez",
  "email": "juan@example.com",
  "address": "Calle 123",
  "phone": "555-0123"
}'
Invoke-RestMethod -Uri "http://localhost:8090/customer/createcustomer" -Method Post -ContentType "application/json" -Body $body
```

- Crear orden:

```powershell
$body = '{
  "customerID": "12345678",
  "products": [{"name": "Product 1", "quantity": 2, "price": 25.99}],
  "status": "Received"
}'
Invoke-RestMethod -Uri "http://localhost:8090/order/createorder" -Method Post -ContentType "application/json" -Body $body
```

- Actualizar estado de orden:

```powershell
$body = '{
  "orderID":"ORD-001",
  "status":"In progress"
}'
Invoke-RestMethod -Uri "http://localhost:8090/order/updateorderstatus" -Method Put -ContentType "application/json" -Body $body
```

7.4 Pruebas específicas del User Service  
Ejecutar script de prueba: `user-service/test_service.py`

```powershell
Set-Location user-service
python .\test_service.py
Set-Location ..
```

7.5 Panel Frontend  
- Abrir http://localhost:4200  
- Ver tarjetas de estado en `frontend/src/pages/Dashboard.tsx`.  
- Config de API en `frontend/src/config/api.ts`.

7.6 Dashboards  
- Traefik Dashboard: http://localhost:8080 (rutas y estado)  
- Consul UI: http://localhost:8500 (servicios y health)

---

## 8. Imágenes del Funcionamiento — Galería Completa

A continuación se incluyen todas las capturas disponibles en la carpeta `Fotos Frontend/`. Los nombres de archivo se mantienen para trazabilidad.

8.1 Captura 1  
![Captura 1 — Screenshot 2025-10-06 at 8.43.26 AM](Fotos%20Frontend/Screenshot%202025-10-06%20at%208.43.26%E2%80%AFAM.png)

8.2 Captura 2  
![Captura 2 — Screenshot 2025-10-06 at 8.43.40 AM](Fotos%20Frontend/Screenshot%202025-10-06%20at%208.43.40%E2%80%AFAM.png)

8.3 Captura 3  
![Captura 3 — Screenshot 2025-10-06 at 8.43.46 AM](Fotos%20Frontend/Screenshot%202025-10-06%20at%208.43.46%E2%80%AFAM.png)

8.4 Captura 4  
![Captura 4 — Screenshot 2025-10-06 at 8.43.53 AM](Fotos%20Frontend/Screenshot%202025-10-06%20at%208.43.53%E2%80%AFAM.png)

8.5 Captura 5  
![Captura 5 — Screenshot 2025-10-06 at 8.44.06 AM](Fotos%20Frontend/Screenshot%202025-10-06%20at%208.44.06%E2%80%AFAM.png)

8.6 Captura 6  
![Captura 6 — Screenshot 2025-10-06 at 8.44.13 AM](Fotos%20Frontend/Screenshot%202025-10-06%20at%208.44.13%E2%80%AFAM.png)

8.7 Captura 7  
![Captura 7 — Screenshot 2025-10-06 at 8.44.20 AM](Fotos%20Frontend/Screenshot%202025-10-06%20at%208.44.20%E2%80%AFAM.png)

8.8 Captura 8  
![Captura 8 — Screenshot 2025-10-06 at 8.44.27 AM](Fotos%20Frontend/Screenshot%202025-10-06%20at%208.44.27%E2%80%AFAM.png)

8.9 Captura 9  
![Captura 9 — Screenshot 2025-10-06 at 8.44.37 AM](Fotos%20Frontend/Screenshot%202025-10-06%20at%208.44.37%E2%80%AFAM.png)

8.10 Captura 10  
![Captura 10 — Screenshot 2025-10-06 at 8.44.44 AM](Fotos%20Frontend/Screenshot%202025-10-06%20at%208.44.44%E2%80%AFAM.png)

8.11 Captura 11  
![Captura 11 — Screenshot 2025-10-06 at 9.07.15 AM](Fotos%20Frontend/Screenshot%202025-10-06%20at%209.07.15%E2%80%AFAM.png)

8.12 Captura 12  
![Captura 12 — Screenshot 2025-10-06 at 9.07.31 AM](Fotos%20Frontend/Screenshot%202025-10-06%20at%209.07.31%E2%80%AFAM.png)

> Si la previsualización de alguna imagen falla por el carácter especial entre la hora y "AM", verifique en el visor Markdown del IDE o reemplace ese carácter por un espacio estándar en el nombre del archivo (o use el path ya codificado en este documento).

---

## 9. Operación y Mantenimiento

9.1 Logs y monitoreo  
- Revisar logs con `docker compose logs -f`  
- Health checks expuestos en cada servicio (Login, User, Order)  
- Service info del User Service: endpoint `/info`

9.2 Seguridad y mejores prácticas (resumen)  
- Contenedores no-root cuando sea posible  
- Secrets por variables de entorno  
- CORS y headers de seguridad en Traefik  
- Rate limiting en Traefik  
- Cambiar contraseñas por defecto en producción

---

## 10. Vistas 4+1 (Philippe Kruchten)

A continuación se presentan descripciones técnicas completas para cada vista, más las imágenes adjuntas en `docs/` como referencia visual para la Vista Lógica (Componentes) y la Vista Física (Despliegue).

### 10.1 Vista Lógica — Componentes y relaciones

![Diagrama de Componentes](Diagrama_Componentes.jpg)

Componentes principales:
- Frontend (React + TypeScript): UI, páginas principales en `frontend/src/pages` (Dashboard, Landing, Login, Customers, Orders).
- API Gateway (Traefik): expone el punto de entrada único (8090) y enruta solicitudes por prefijos.
- Service Discovery (Consul): catálogo/registro de servicios y health checks, UI en 8500.
- Login Service (Go + Gin + Redis): autenticación y gestión simple de usuarios/sesiones.
- User Service (FastAPI + PostgreSQL): CRUD de clientes (Customer), DTOs y validaciones.
- Order Service (Node.js + Express + MongoDB): CRUD de pedidos (Order), validación de cliente vía User Service.
- Bases de datos: Redis (sesiones), PostgreSQL (clientes), MongoDB (pedidos).

Relaciones y reglas de enrutamiento (lazo principal):
- Frontend → Traefik (8090) → microservicios por prefijo:
  - `/login/*` → Login Service
  - `/customer/*` → User Service
  - `/order/*` → Order Service
- Order Service → User Service: verificación de existencia del cliente antes de persistir un pedido.
- Todos los servicios → Consul: registro/descubrimiento y salud.
- Cada servicio → su base de datos correspondiente para persistencia.

### 10.2 Vista Física — Despliegue, nodos y puertos

![Diagrama de Despliegue](Diagrama%20Despliegue.jpg)

Contenedores (Docker) y puertos expuestos:
- Traefik (API Gateway): 8090 (entrante HTTP), 8080 (dashboard).
- Consul (Service Discovery): 8500 (UI).
- Login Service: 8081 externo (8080 interno); depende de Redis:6379.
- User Service: 8000; depende de PostgreSQL:5432.
- Order Service: 3000; depende de MongoDB:27017.
- Frontend: 4200; consume API Gateway (8090).

Red y dependencias:
- Red interna de Docker para tráfico este-oeste (servicios ↔ DB ↔ Consul ↔ Traefik).
- Traefik como punto de entrada norte-sur.
- Volúmenes para persistencia en PostgreSQL y MongoDB (y/o Redis según configuración).

Despliegue por capas (Compose):
- Bases de datos → Infraestructura (Traefik/Consul) → Microservicios → Frontend.

---

## 11. Anexos y Referencias

- Documentación de APIs: `docs/API_DOCUMENTATION.md`  
- Estructura del proyecto: `PROJECT_STRUCTURE.md`  
- Manuales específicos:  
  - Login Service: `login-service/README.md`  
  - User Service: `user-service/README.md`  
  - Order Service: `order-service/README.md`  
- Frontend:  
  - API Config: `frontend/src/config/api.ts`  
  - Dashboard: `frontend/src/pages/Dashboard.tsx`  
  - Landing: `frontend/src/pages/LandingPage.tsx`

---