# Microservices Management System - Technical Documentation

## 📋 Project Overview

**Universidad Pedagógica y Tecnológica de Colombia**  
**Facultad de Ingeniería - Escuela de Ingeniería de Sistemas**  
**Reto Primer Corte - Ingeniería de Software II**

### System Description
A microservices-based information system for managing customer orders at a national level, implementing DTO (Data Transfer Object) architecture pattern and modern containerization practices.

### Technology Stack

#### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS 3.4
- **Routing**: React Router DOM 6
- **HTTP Client**: Axios
- **State Management**: Zustand
- **UI Components**: Custom component library with Lucide React icons

#### Microservices
- **LoginMicroservice**: Go + Gin Framework + Redis
- **UserMgmtMicroservice**: Python + FastAPI + PostgreSQL  
- **OrderMgmtMicroservice**: Node.js + Express + MongoDB

#### Infrastructure
- **API Gateway**: Traefik v3.0
- **Service Discovery**: HashiCorp Consul
- **Containerization**: Docker + Docker Compose
- **Load Balancer**: Nginx (for frontend)

#### Databases
- **Relational**: PostgreSQL 15 (Customer data)
- **NoSQL**: MongoDB 7 (Order data)  
- **Cache**: Redis 7 (Authentication sessions)

### Architecture Patterns
- **Microservices Architecture**
- **DTO (Data Transfer Object) Pattern**
- **API Gateway Pattern**
- **Service Discovery Pattern**
- **Database per Service Pattern**

### Key Features
1. **User Authentication & Authorization**
2. **Customer Management (CRUD Operations)**
3. **Order Management with Status Tracking**
4. **Real-time Service Health Monitoring**
5. **Responsive Modern UI**
6. **Containerized Deployment**

---

## 🏗️ System Architecture

### Microservices Communication Flow
```
Frontend (React) 
    ↓ HTTP/REST
API Gateway (Traefik)
    ↓ Service Discovery
Consul Registry
    ↓ Load Balancing
Individual Microservices
    ↓ Data Persistence
Specialized Databases
```

### Port Configuration
- **Frontend**: 4200 (Development), 80 (Production)
- **API Gateway**: 8080 (Dashboard), 80 (Traffic)
- **Login Service**: 8081
- **User Service**: 8000  
- **Order Service**: 3000
- **Consul**: 8500
- **PostgreSQL**: 5432
- **MongoDB**: 27017
- **Redis**: 6379

---

## 📊 Functional Requirements Implementation

### 1. Authentication Module (LoginMicroservice)
- ✅ **User Registration**: `/login/createuser`
- ✅ **User Authentication**: `/login/authuser`
- **Technology**: Go + Gin + Redis
- **Security**: JWT Token-based authentication

### 2. Customer Management (UserMgmtMicroservice)  
- ✅ **Create Customer**: `/customer/createcustomer`
- ✅ **Find Customer by ID**: `/customer/findcustomerbyid`
- **Technology**: Python + FastAPI + PostgreSQL
- **Pattern**: DTO implementation with Pydantic models

### 3. Order Management (OrderMgmtMicroservice)
- ✅ **Create Order**: `/order/createorder`
- ✅ **Update Order Status**: `/order/updateorderstatus`
- ✅ **Find Orders by Customer**: `/order/findorderbycustomerid`
- **Technology**: Node.js + Express + MongoDB
- **Status Flow**: Received → In Progress → Sent

---

## 🗄️ Data Models

### Customer Entity (PostgreSQL)
```sql
CREATE TABLE Customer (
    document VARCHAR PRIMARY KEY,
    firstname VARCHAR NOT NULL,
    lastname VARCHAR NOT NULL,
    address VARCHAR NOT NULL,
    phone VARCHAR NOT NULL,
    email VARCHAR NOT NULL
);
```

### Order Entity (MongoDB)
```javascript
{
    customerID: String,    // Customer Document ID
    orderID: String,       // Unique Order Identifier
    status: String         // "Received", "In progress", "Sended"
}
```

---

## 🚀 Deployment Architecture

### Container Orchestration
All services are containerized using Docker and orchestrated with Docker Compose:

- **Modular Composition**: Separate compose files for databases, infrastructure, services, and frontend
- **Health Checks**: All services include health monitoring
- **Network Isolation**: Dedicated microservices network
- **Volume Persistence**: Data persistence for databases
- **Environment Configuration**: Centralized environment variables

### Service Discovery
- **Registry**: Consul automatically registers all microservices
- **Load Balancing**: Traefik distributes traffic based on service health
- **Auto-scaling Ready**: Infrastructure supports horizontal scaling

---

## 📱 Frontend Architecture

### Component Structure
```
src/
├── components/          # Reusable UI components
├── pages/              # Route-based page components
├── types/              # TypeScript interfaces
├── utils/              # Helper functions and API client
└── styles/             # Tailwind CSS configuration
```

### State Management
- **Authentication State**: localStorage + React Router guards
- **API State**: Axios interceptors for token management
- **UI State**: React hooks for component-level state

### Design System
- **Color Palette**: Microservices blue theme with semantic colors
- **Typography**: Inter font family for modern readability
- **Components**: Custom button, input, and layout components
- **Responsiveness**: Mobile-first responsive design

---

## 🔧 Development Workflow

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git

### Quick Start
```bash
# Clone repository
git clone <repository-url>
cd Project-Software-Engineering

# Start backend services
docker-compose up -d

# Start frontend development
cd frontend
npm install
npm run dev
```

### Testing Credentials
- **Username**: `testuser`
- **Password**: `password123`

---

## 📈 Performance & Monitoring

### Service Health Monitoring
- Real-time health checks for all microservices
- Dashboard display of service status
- Automatic unhealthy service detection

### Scalability Features
- Horizontal scaling support via Docker Compose
- Database connection pooling
- Redis session management
- Nginx static file optimization

---

## 🔒 Security Implementation

### Authentication Flow
1. User submits credentials to Login Service
2. Service validates against Redis session store  
3. JWT token generated and returned
4. Frontend stores token and includes in API requests
5. API Gateway validates token on protected routes

### Security Headers
- CORS configuration for cross-origin requests
- Security headers via Nginx and Traefik
- Environment variable management
- Input validation on all endpoints

---

*This documentation serves as the comprehensive guide for the Microservices Management System implementation.*