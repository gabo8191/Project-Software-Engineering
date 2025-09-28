# Order Service

Microservicio de gestión de pedidos desarrollado en Node.js con Express.js y MongoDB.

## 🏗️ Arquitectura

- **Framework**: Express.js (Node.js)
- **Base de Datos**: MongoDB
- **ODM**: Mongoose
- **Service Discovery**: Consul
- **Validación**: Joi
- **Logging**: Morgan
- **Seguridad**: Helmet, CORS

## 📁 Estructura del Proyecto

```
order-service/
├── src/
│   ├── config/
│   │   ├── database.js          # Configuración MongoDB
│   │   └── environment.js       # Variables de entorno
│   ├── controllers/
│   │   ├── orderController.js   # Controladores de pedidos
│   │   └── healthController.js  # Health checks
│   ├── middleware/
│   │   └── errorHandler.js      # Manejo de errores
│   ├── models/
│   │   └── Order.js             # Modelo Mongoose
│   ├── routes/
│   │   ├── orderRoutes.js       # Rutas de pedidos
│   │   ├── healthRoutes.js      # Rutas de salud
│   │   └── index.js             # Router principal
│   └── services/
│       ├── orderService.js      # Lógica de negocio
│       ├── validationService.js # Validaciones
│       └── consulService.js     # Service Discovery
├── Dockerfile
├── package.json
└── server.js                    # Punto de entrada
```

## 🚀 Endpoints

### Endpoints Requeridos (según especificación)

- `POST /order/createorder` - Crear pedido
- `PUT /order/updateorderstatus` - Modificar estado del pedido  
- `GET /order/findorderbycustomerid` - Buscar pedidos por cliente

### Health Checks

- `GET /health` - Health check general
- `GET /ready` - Readiness check
- `GET /live` - Liveness check
- `GET /status` - Estado detallado

### Endpoints Adicionales

- `GET /order/all` - Todos los pedidos (paginado)
- `GET /order/stats` - Estadísticas de pedidos
- `GET /order/:orderID` - Pedido específico

## 📋 Variables de Entorno

```bash
# MongoDB Configuration
MONGODB_URI=mongodb://mongo_admin:mongo_password_123@mongodb:27017/OrderDB?authSource=admin

# Server Configuration  
PORT=3000
SERVICE_NAME=order-service
SERVICE_HOST=order-service

# Consul Configuration
CONSUL_HOST=consul
CONSUL_PORT=8500

# Logging
NODE_ENV=development
LOG_LEVEL=info
```

## 🗄️ Estructura de Datos

### Colección: Order (MongoDB)

```javascript
{
  customerID: String,     // ID del cliente (requerido)
  orderID: String,        // ID del pedido (único, auto-generado si no se proporciona)
  status: String,         // Estado: 'Received', 'In progress', 'Sended'
  createdAt: Date,        // Fecha de creación (automático)
  updatedAt: Date         // Fecha de actualización (automático)
}
```

## 📊 Estados de Pedidos

- **"Received"** - Pedido recibido
- **"In progress"** - Pedido en progreso  
- **"Sended"** - Pedido enviado

## 🔧 Desarrollo Local

### **⚠️ Importante: Este servicio funciona con Docker Compose**

```bash
# Desde la raíz del proyecto
docker-compose up -d

# Solo bases de datos
docker-compose -f docker-compose.databases.yml up -d
```

### **Ejecución Individual (Solo para Testing)**

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo (requiere MongoDB)
npm run dev

# Ejecutar en producción
npm start

# Ejecutar tests
npm test
```

## 🐳 Docker

```bash
# Construir imagen
docker build -t order-service .

# Ejecutar contenedor
docker run -p 3000:3000 order-service
```

## 📊 Ejemplos de Uso

### Crear Pedido

```bash
curl -X POST http://localhost/order/createorder \
  -H "Content-Type: application/json" \
  -d '{
    "customerID": "12345678",
    "orderID": "ORD-001-2024",
    "status": "Received"
  }'
```

**Respuesta:**
```json
{
  "orderCreated": true,
  "order": {
    "customerID": "12345678",
    "orderID": "ORD-001-2024", 
    "status": "Received",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Actualizar Estado del Pedido

```bash
curl -X PUT http://localhost/order/updateorderstatus \
  -H "Content-Type: application/json" \
  -d '{
    "orderID": "ORD-001-2024",
    "status": "In progress"
  }'
```

**Respuesta:**
```json
{
  "orderStatusUpdated": true,
  "order": {
    "customerID": "12345678",
    "orderID": "ORD-001-2024",
    "status": "In progress",
    "updatedAt": "2024-01-15T11:15:00.000Z"
  }
}
```

### Buscar Pedidos por Cliente

```bash
curl "http://localhost/order/findorderbycustomerid?customerid=12345678"
```

**Respuesta:**
```json
[
  {
    "customerID": "12345678",
    "orderID": "ORD-001-2024",
    "status": "In progress",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:15:00.000Z"
  }
]
```

## 🔒 Seguridad

- Validación de entrada con Joi
- Rate limiting configurado
- Headers de seguridad con Helmet
- CORS configurado
- Manejo centralizado de errores
- Sanitización de datos

## 📈 Monitoreo

- Health checks para Kubernetes
- Logging estructurado con Morgan
- Métricas de MongoDB
- Registro automático en Consul
- Request ID para trazabilidad

## 🚀 Características

- ✅ **API REST completa** según especificación
- ✅ **Validación robusta** con Joi
- ✅ **Manejo de errores** centralizado
- ✅ **Service Discovery** con Consul
- ✅ **Health Checks** múltiples
- ✅ **Logging** estructurado
- ✅ **Docker** optimizado
- ✅ **Graceful Shutdown**
- ✅ **Rate Limiting**
- ✅ **Security Headers**