# 📡 API Documentation

## Overview
Complete REST API documentation for the Microservices Management System. All endpoints are accessible through the Traefik API Gateway at `http://localhost` (local) or your domain (production).

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 🔐 Authentication Service (Login Service)

### Base URL: `/login`

#### POST /login/registeruser
**Description**: Register a new user in the system  
**Authentication**: None required  
**Content-Type**: `application/json`

**Request Body**:
```json
{
  "username": "string",
  "password": "string", 
  "email": "string"
}
```

**Response 201 (Success)**:
```json
{
  "message": "User registered successfully",
  "userCreated": true
}
```

**Response 400 (Error)**:
```json
{
  "error": "Username already exists"
}
```

**Response 500 (Server Error)**:
```json
{
  "error": "Internal server error"
}
```

**Example**:
```bash
curl -X POST http://localhost/login/registeruser \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "securepass123",
    "email": "john@example.com"
  }'
```

---

#### POST /login/authuser
**Description**: Authenticate user and receive JWT token  
**Authentication**: None required  
**Content-Type**: `application/json`

**Request Body**:
```json
{
  "username": "string",
  "password": "string"
}
```

**Response 200 (Success)**:
```json
{
  "message": "Authentication successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "username": "johndoe",
    "email": "john@example.com"
  },
  "authValid": true
}
```

**Response 401 (Unauthorized)**:
```json
{
  "error": "Invalid credentials",
  "authValid": false
}
```

**Example**:
```bash
curl -X POST http://localhost/login/authuser \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "securepass123"
  }'
```

---

#### GET /login/health
**Description**: Health check for login service  
**Authentication**: None required

**Response 200 (Success)**:
```json
{
  "status": "healthy",
  "service": "login-service",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 👥 Customer Management Service (User Service)

### Base URL: `/customer`

#### POST /customer/createcustomer
**Description**: Create a new customer in the system  
**Authentication**: JWT Token Required  
**Content-Type**: `application/json`

**Request Body**:
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

**Response 201 (Success)**:
```json
{
  "message": "Customer created successfully",
  "createCustomerValid": true,
  "customer": {
    "document": "12345678",
    "firstname": "John",
    "lastname": "Doe",
    "address": "123 Main St",
    "phone": "+1234567890",
    "email": "john@example.com",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Response 400 (Validation Error)**:
```json
{
  "error": "Document already exists",
  "createCustomerValid": false
}
```

**Response 401 (Unauthorized)**:
```json
{
  "error": "Invalid or expired token"
}
```

**Example**:
```bash
curl -X POST http://localhost/customer/createcustomer \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "document": "12345678",
    "firstname": "John",
    "lastname": "Doe",
    "address": "123 Main Street",
    "phone": "+1234567890",
    "email": "john@example.com"
  }'
```

---

#### GET /customer/searchcustomer/{document}
**Description**: Search for a customer by document ID  
**Authentication**: JWT Token Required  
**Parameters**: `document` (path parameter)

**Response 200 (Found)**:
```json
{
  "message": "Customer found",
  "customer": {
    "document": "12345678",
    "firstname": "John",
    "lastname": "Doe",
    "address": "123 Main St",
    "phone": "+1234567890", 
    "email": "john@example.com",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  "searchCustomerValid": true
}
```

**Response 404 (Not Found)**:
```json
{
  "error": "Customer not found",
  "searchCustomerValid": false
}
```

**Example**:
```bash
curl -X GET http://localhost/customer/searchcustomer/12345678 \
  -H "Authorization: Bearer <jwt_token>"
```

---

#### GET /customer/health
**Description**: Health check for customer service  
**Authentication**: None required

**Response 200 (Success)**:
```json
{
  "status": "healthy",
  "service": "user-service", 
  "database": "connected",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 📦 Order Management Service (Order Service)

### Base URL: `/order`

#### POST /order/createorder
**Description**: Create a new order in the system  
**Authentication**: JWT Token Required  
**Content-Type**: `application/json`

**Request Body**:
```json
{
  "customerID": "string",
  "orderID": "string"
}
```

**Response 201 (Success)**:
```json
{
  "message": "Order created successfully",
  "orderCreated": true,
  "order": {
    "customerID": "12345678",
    "orderID": "ORD-001",
    "status": "Received",
    "created_at": "2024-01-15T10:30:00Z",
    "_id": "65a5f1234567890abcdef123"
  }
}
```

**Response 400 (Validation Error)**:
```json
{
  "error": "Order ID already exists",
  "orderCreated": false
}
```

**Example**:
```bash
curl -X POST http://localhost/order/createorder \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "customerID": "12345678",
    "orderID": "ORD-001"
  }'
```

---

#### PUT /order/updateorderstatus
**Description**: Update the status of an existing order  
**Authentication**: JWT Token Required  
**Content-Type**: `application/json`

**Request Body**:
```json
{
  "orderID": "string",
  "status": "InProgress" | "Sent"
}
```

**Response 200 (Success)**:
```json
{
  "message": "Order status updated successfully",
  "orderStatusUpdated": true,
  "order": {
    "customerID": "12345678",
    "orderID": "ORD-001", 
    "status": "InProgress",
    "updated_at": "2024-01-15T11:00:00Z"
  }
}
```

**Response 404 (Not Found)**:
```json
{
  "error": "Order not found",
  "orderStatusUpdated": false
}
```

**Response 400 (Invalid Status)**:
```json
{
  "error": "Invalid status. Must be 'InProgress' or 'Sent'",
  "orderStatusUpdated": false
}
```

**Example**:
```bash
curl -X PUT http://localhost/order/updateorderstatus \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "orderID": "ORD-001",
    "status": "InProgress"
  }'
```

---

#### GET /order/searchordersbycustomer/{customerID}
**Description**: Search all orders for a specific customer  
**Authentication**: JWT Token Required  
**Parameters**: `customerID` (path parameter)

**Response 200 (Success)**:
```json
{
  "message": "Orders found",
  "orders": [
    {
      "customerID": "12345678",
      "orderID": "ORD-001",
      "status": "InProgress", 
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T11:00:00Z"
    },
    {
      "customerID": "12345678", 
      "orderID": "ORD-002",
      "status": "Sent",
      "created_at": "2024-01-15T12:00:00Z",
      "updated_at": "2024-01-15T14:30:00Z"
    }
  ],
  "searchOrdersValid": true,
  "count": 2
}
```

**Response 404 (No Orders Found)**:
```json
{
  "message": "No orders found for customer",
  "orders": [],
  "searchOrdersValid": false,
  "count": 0
}
```

**Example**:
```bash
curl -X GET http://localhost/order/searchordersbycustomer/12345678 \
  -H "Authorization: Bearer <jwt_token>"
```

---

#### GET /order/health
**Description**: Health check for order service  
**Authentication**: None required

**Response 200 (Success)**:
```json
{
  "status": "healthy",
  "service": "order-service",
  "database": "connected",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 📊 Service Discovery & Health

#### GET /health (Global Health Check)
**Description**: Check health status of all services through API Gateway  
**Authentication**: None required

**Response 200 (All Services Healthy)**:
```json
{
  "status": "healthy",
  "services": {
    "login-service": "healthy",
    "user-service": "healthy", 
    "order-service": "healthy"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 🚨 Error Handling

### Standard Error Response Format
All API errors follow this consistent format:

```json
{
  "error": "Description of what went wrong",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/endpoint"
}
```

### Common HTTP Status Codes

| Status Code | Description | When Used |
|-------------|-------------|-----------|
| 200 | OK | Successful GET, PUT requests |
| 201 | Created | Successful POST requests |
| 400 | Bad Request | Invalid request body or parameters |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Valid token but insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists (duplicate) |
| 422 | Unprocessable Entity | Validation errors |
| 500 | Internal Server Error | Server-side errors |

---

## 🔄 Data Models

### User Model (Login Service)
```json
{
  "username": "string",
  "email": "string", 
  "password": "string (hashed)",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Customer Model (User Service)
```json
{
  "document": "string (primary key)",
  "firstname": "string",
  "lastname": "string",
  "address": "string",
  "phone": "string",
  "email": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Order Model (Order Service)
```json
{
  "_id": "ObjectId",
  "customerID": "string",
  "orderID": "string (unique)",
  "status": "Received" | "InProgress" | "Sent",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

---

## 🧪 Testing Examples

### Complete Workflow Example
```bash
#!/bin/bash
# Complete API Testing Workflow

BASE_URL="http://localhost"

echo "=== 1. Register New User ==="
curl -X POST $BASE_URL/login/registeruser \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpass123",
    "email": "test@example.com"
  }'

echo -e "\n\n=== 2. Authenticate User ==="
AUTH_RESPONSE=$(curl -s -X POST $BASE_URL/login/authuser \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpass123"
  }')

echo $AUTH_RESPONSE

# Extract JWT token
TOKEN=$(echo $AUTH_RESPONSE | jq -r '.token')
echo "Token: $TOKEN"

echo -e "\n\n=== 3. Create Customer ==="
curl -X POST $BASE_URL/customer/createcustomer \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "document": "12345678",
    "firstname": "Juan", 
    "lastname": "Pérez",
    "address": "Calle 123 #45-67",
    "phone": "+57300123456",
    "email": "juan.perez@email.com"
  }'

echo -e "\n\n=== 4. Search Customer ==="
curl -X GET $BASE_URL/customer/searchcustomer/12345678 \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n\n=== 5. Create Order ==="
curl -X POST $BASE_URL/order/createorder \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerID": "12345678",
    "orderID": "ORD-001"
  }'

echo -e "\n\n=== 6. Update Order Status ==="
curl -X PUT $BASE_URL/order/updateorderstatus \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderID": "ORD-001",
    "status": "InProgress"
  }'

echo -e "\n\n=== 7. Search Orders by Customer ==="
curl -X GET $BASE_URL/order/searchordersbycustomer/12345678 \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n\n=== Workflow Complete ==="
```

### Postman Collection
```json
{
  "info": {
    "name": "Microservices API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost"
    },
    {
      "key": "token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Register User",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"testuser\",\n  \"password\": \"testpass123\",\n  \"email\": \"test@example.com\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/login/registeruser",
              "host": ["{{baseUrl}}"],
              "path": ["login", "registeruser"]
            }
          }
        },
        {
          "name": "Login User",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type", 
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"testuser\",\n  \"password\": \"testpass123\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/login/authuser",
              "host": ["{{baseUrl}}"],
              "path": ["login", "authuser"]
            }
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "const response = pm.response.json();",
                  "if (response.token) {",
                  "    pm.collectionVariables.set('token', response.token);",
                  "}"
                ]
              }
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 🔐 Security Considerations

### JWT Token Validation
- **Expiration**: Tokens expire after 24 hours by default
- **Algorithm**: HS256 (HMAC with SHA-256)
- **Claims**: Include username, email, and issued/expiration timestamps

### Rate Limiting
- Currently not implemented but recommended for production
- Suggested limits:
  - Authentication: 5 requests/minute per IP
  - API calls: 100 requests/minute per user

### Input Validation
- All endpoints validate input data types
- SQL injection prevention through parameterized queries
- NoSQL injection prevention through proper sanitization

### CORS Policy
```javascript
// Current CORS configuration
{
  "origin": ["http://localhost:4200", "http://localhost:3000"],
  "credentials": true,
  "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}
```

---

*This API documentation provides comprehensive information for integrating with the Microservices Management System. All endpoints are designed to be RESTful and follow standard HTTP conventions.*
    "userCreated": true
  }
  ```

---

## 👥 Customer Microservice

### **Crear Cliente**

- **Endpoint**: `POST /customer/createcustomer`
- **Descripción**: Crea un nuevo cliente en el sistema
- **Parámetros**:
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
- **Respuesta**:
  ```json
  {
    "createCustomerValid": true
  }
  ```

### **Buscar Cliente por ID**

- **Endpoint**: `GET /customer/findcustomerbyid`
- **Descripción**: Busca un cliente por su ID (documento)
- **Parámetros**:
  ```json
  {
    "customerid": "string"
  }
  ```
- **Respuesta**:
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

---

## 📦 Order Microservice

### **Crear Pedido**

- **Endpoint**: `POST /order/createorder`
- **Descripción**: Crea un nuevo pedido en el sistema
- **Parámetros**:
  ```json
  {
    "customerid": "string",
    "orderID": "string",
    "status": "string"
  }
  ```
- **Respuesta**:
  ```json
  {
    "orderCreated": true
  }
  ```

### **Modificar Estado del Pedido**

- **Endpoint**: `PUT /order/updateorderstatus`
- **Descripción**: Actualiza el estado de un pedido existente
- **Parámetros**:
  ```json
  {
    "orderID": "string",
    "status": "string"
  }
  ```
- **Respuesta**:
  ```json
  {
    "orderStatusUpdated": true
  }
  ```

### **Buscar Pedidos por Cliente**

- **Endpoint**: `GET /order/findorderbycustomerid`
- **Descripción**: Busca todos los pedidos de un cliente específico
- **Parámetros**:
  ```json
  {
    "customerid": "string"
  }
  ```
- **Respuesta**:
  ```json
  [
    {
      "customerid": "string",
      "orderID": "string",
      "status": "string"
    }
  ]
  ```

---

## 🔄 Estados de Pedidos

Los pedidos pueden tener los siguientes estados:

- **"Received"** - Pedido recibido
- **"In progress"** - Pedido en progreso
- **"Sended"** - Pedido enviado

---

## 🌐 URLs de Acceso

### **API Gateway (Traefik)**

- **URL Base**: `http://localhost`
- **Dashboard**: `http://localhost:8080`

### **Microservicios Directos**

- **Login Service**: `http://localhost:8080`
- **User Service**: `http://localhost:8000`
- **Order Service**: `http://localhost:3000`

### **Frontend**

- **Angular App**: `http://localhost:4200`

### **Service Discovery**

- **Consul UI**: `http://localhost:8500`

---

## 📝 Ejemplos de Uso

### **Flujo Completo de Creación de Pedido**

1. **Crear Cliente**:

   ```bash
   curl -X POST http://localhost/customer/createcustomer \
     -H "Content-Type: application/json" \
     -d '{
       "document": "12345678",
       "firstname": "Juan",
       "lastname": "Pérez",
       "address": "Calle 123 #45-67, Bogotá",
       "phone": "+57-300-123-4567",
       "email": "juan.perez@email.com"
     }'
   ```

2. **Registrar Usuario**:

   ```bash
   curl -X POST http://localhost/login/createuser \
     -H "Content-Type: application/json" \
     -d '{
       "customerid": "12345678",
       "password": "password123"
     }'
   ```

3. **Crear Pedido**:

   ```bash
   curl -X POST http://localhost/order/createorder \
     -H "Content-Type: application/json" \
     -d '{
       "customerid": "12345678",
       "orderID": "ORD-001-2024",
       "status": "Received"
     }'
   ```

4. **Buscar Pedidos del Cliente**:
   ```bash
   curl -X GET "http://localhost/order/findorderbycustomerid?customerid=12345678"
   ```

---

## ⚠️ Notas Importantes

- Todos los endpoints requieren `Content-Type: application/json`
- Los IDs de cliente deben ser únicos
- Los estados de pedidos son case-sensitive
- El sistema utiliza service discovery con Consul
- Todas las respuestas incluyen validación de operación
