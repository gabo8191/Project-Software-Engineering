// API Base URL - always use API Gateway (Traefik)
export const API_BASE_URL = 'http://localhost:8090';

// All services accessed through API Gateway
export const SERVICE_URLS = {
  USER_SERVICE: 'http://localhost:8090',
  LOGIN_SERVICE: 'http://localhost:8090', 
  ORDER_SERVICE: 'http://localhost:8090',
  CUSTOMER_SERVICE: 'http://localhost:8090',
} as const;

// API Endpoints mapping to your microservices
export const API_ENDPOINTS = {
  // Login Service endpoints (Go service)
  login: {
    createUser: '/login/createuser',
    authUser: '/login/authuser', 
    validateToken: '/auth/validate',
    health: '/login/health',
  },
  
  // User Service endpoints (Python FastAPI) - Actually customer endpoints
  user: {
    createUser: '/customer/createcustomer',
    getUser: '/customer/findcustomerbyid',
    updateUser: '/customer/updatecustomer',
    deleteUser: '/customer/deletecustomer',
    getAllUsers: '/customer/customers',
    getUserByEmail: '/customer/customerbyemail',
    validateCredentials: '/auth/validate',
    health: '/health',
  },
  
  // Customer Service endpoints (Legacy - for backward compatibility)
  customer: {
    createCustomer: '/customer/createcustomer',
    updateCustomer: '/customer/updatecustomer', 
    findCustomerById: '/customer/findcustomerbyid',
    getCustomers: '/customer/customers',
    getCustomerByEmail: '/customer/customerbyemail',
    health: '/customer/health',
  },
  
  // Order Service endpoints (Node.js TypeScript)
  order: {
    createOrder: '/order/createorder',
    updateOrderStatus: '/order/updateorderstatus',
    getOrdersByCustomerId: '/order/getordersbycustomerid',
    getOrderById: '/order/getorderbyid',
    getAllOrders: '/order/getallorders',
    deleteOrder: '/order/deleteorder',
    getStats: '/order/stats',
    health: '/health',
    // Test endpoints for service communication
    testUserService: '/test/user-service',
    testLoginService: '/test/login-service',
    testServicesHealth: '/test/services/health',
    testOrderWorkflow: '/test/order-workflow',
  },
} as const;

// Service Communication Configuration
export const SERVICE_CONFIG = {
  // Timeout for API requests (ms)
  REQUEST_TIMEOUT: 30000,
  
  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  
  // Service discovery
  USE_CONSUL: true,
  CONSUL_URL: 'http://localhost:8500',
} as const;