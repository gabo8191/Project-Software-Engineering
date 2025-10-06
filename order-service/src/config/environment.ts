/**
 * Environment configuration for Order Service - TypeScript Version
 */
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Configuration Interfaces
 */
interface ServerConfig {
  port: number;
  host: string;
  name: string;
}

interface DatabaseConfig {
  mongoURI: string;
  options: {
    maxPoolSize: number;
    serverSelectionTimeoutMS: number;
    socketTimeoutMS: number;
  };
}

interface ConsulConfig {
  host: string;
  port: number;
  serviceName: string;
  servicePort: number;
  serviceHost: string;
  healthCheckPath: string;
  tags: string[];
}

interface LoggingConfig {
  level: string;
  format: string;
}

interface CorsConfig {
  origins: string[];
  methods: string[];
  allowedHeaders: string[];
  credentials: boolean;
}

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: {
    error: string;
    retryAfter: string;
  };
}

interface AppConfig {
  server: ServerConfig;
  database: DatabaseConfig;
  consul: ConsulConfig;
  logging: LoggingConfig;
  cors: CorsConfig;
  rateLimit: RateLimitConfig;
  env: string;
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;
}

const config: AppConfig = {
  // Server configuration
  server: {
    port: parseInt(process.env.PORT || process.env.SERVICE_PORT || '3000'),
    host: process.env.HOST || '0.0.0.0',
    name: process.env.SERVICE_NAME || 'order-service-ts'
  },

  // Database configuration
  database: {
    mongoURI: process.env.MONGODB_URI || 'mongodb://mongo_admin:mongo_password_123@mongodb:27017/OrderDB?authSource=admin',
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    }
  },

  // Consul configuration
  consul: {
    host: process.env.CONSUL_HOST || 'consul',
    port: parseInt(process.env.CONSUL_PORT || '8500'),
    serviceName: process.env.SERVICE_NAME || 'order-service-ts',
    servicePort: parseInt(process.env.SERVICE_PORT || '3000'),
    serviceHost: process.env.SERVICE_HOST || 'order-service',
    healthCheckPath: '/health',
    tags: ['order', 'api', 'microservice', 'nodejs', 'express', 'mongodb', 'typescript']
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

  // Rate limiting - More reasonable limits for microservices
  rateLimit: {
    windowMs: 60 * 1000, // 1 minute window
    max: parseInt(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE || '1000'), // 1000 requests per minute (much more reasonable)
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '1 minute'
    }
  },

  // Environment
  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test'
};

/**
 * Validation function
 */
const validateConfig = (): void => {
  const required = ['database.mongoURI'];
  
  for (const path of required) {
    const value = path.split('.').reduce((obj: any, key: string) => obj?.[key], config);
    if (!value) {
      throw new Error(`Missing required configuration: ${path}`);
    }
  }
  
  console.log('✅ Configuration validated successfully (TypeScript)');
};

// Validate on load
try {
  validateConfig();
} catch (error) {
  console.error('❌ Configuration validation failed:', (error as Error).message);
  process.exit(1);
}

export default config;
export { AppConfig, ServerConfig, DatabaseConfig, ConsulConfig, LoggingConfig, CorsConfig, RateLimitConfig };