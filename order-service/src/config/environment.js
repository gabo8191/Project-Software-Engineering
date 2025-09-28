/**
 * Environment configuration for Order Service
 */
require('dotenv').config();

const config = {
  // Server configuration
  server: {
    port: process.env.PORT || process.env.SERVICE_PORT || 3000,
    host: process.env.HOST || '0.0.0.0',
    name: process.env.SERVICE_NAME || 'order-service'
  },

  // Database configuration
  database: {
    mongoURI: process.env.MONGODB_URI || 'mongodb://mongo_admin:mongo_password_123@mongodb:27017/OrderDB?authSource=admin',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    }
  },

  // Consul configuration
  consul: {
    host: process.env.CONSUL_HOST || 'consul',
    port: parseInt(process.env.CONSUL_PORT) || 8500,
    serviceName: process.env.SERVICE_NAME || 'order-service',
    servicePort: parseInt(process.env.SERVICE_PORT) || 3000,
    serviceHost: process.env.SERVICE_HOST || 'order-service',
    healthCheckPath: '/health',
    tags: ['order', 'api', 'microservice', 'nodejs', 'express', 'mongodb']
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined'
  },

  // CORS configuration
  cors: {
    origins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['*'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
  },

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT_REQUESTS_PER_MINUTE || 100,
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    }
  },

  // Environment
  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test'
};

// Validation
const validateConfig = () => {
  const required = ['database.mongoURI'];
  
  for (const path of required) {
    const value = path.split('.').reduce((obj, key) => obj?.[key], config);
    if (!value) {
      throw new Error(`Missing required configuration: ${path}`);
    }
  }
  
  console.log('✅ Configuration validated successfully');
};

// Validate on load
try {
  validateConfig();
} catch (error) {
  console.error('❌ Configuration validation failed:', error.message);
  process.exit(1);
}

module.exports = config;