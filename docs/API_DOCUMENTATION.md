# Documentación de APIs - Sistema de Gestión de Pedidos

## 📋 Resumen de Endpoints

| Microservicio | Endpoint                       | Método | Descripción                 |
| ------------- | ------------------------------ | ------ | --------------------------- |
| Login         | `/login/createuser`            | POST   | Registrar usuario           |
| Login         | `/login/authuser`              | POST   | Autenticar usuario          |
| Customer      | `/customer/createcustomer`     | POST   | Crear cliente               |
| Customer      | `/customer/findcustomerbyid`   | GET    | Buscar cliente por ID       |
| Order         | `/order/createorder`           | POST   | Crear pedido                |
| Order         | `/order/updateorderstatus`     | PUT    | Modificar estado del pedido |
| Order         | `/order/findorderbycustomerid` | GET    | Buscar pedidos por cliente  |

---

## 🔐 Login Microservice

### **Registrar Usuario**

- **Endpoint**: `POST /login/createuser`
- **Descripción**: Registra un nuevo usuario en el sistema
- **Parámetros**:
  ```json
  {
    "customerid": "string",
    "password": "string"
  }
  ```
- **Respuesta**:
  ```json
  {
    "userCreated": true
  }
  ```

### **Autenticar Usuario**

- **Endpoint**: `POST /login/authuser`
- **Descripción**: Autentica un usuario existente
- **Parámetros**:
  ```json
  {
    "customerid": "string",
    "password": "string"
  }
  ```
- **Respuesta**:
  ```json
  {
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
