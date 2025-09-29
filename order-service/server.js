/**
 * Order Management Microservice
 * Node.js + Express + MongoDB
 * 
 * This service handles order management operations including:
 * - Creating orders
 * - Updating order status
 * - Retrieving orders by customer ID
 * 
 * Technology Stack:
 * - Node.js & Express.js for REST API
 * - MongoDB & Mongoose for data persistence
 * - Consul for service discovery
 * - Docker for containerization
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Import configuration and services
const config = require('./src/config/environment');
const database = require('./src/config/database');
const consulService = require('./src/services/consulService');
const errorHandler = require('./src/middleware/errorHandler');
const setupRoutes = require('./src/routes');

/**
 * Express Application Setup
 */
class OrderServiceApp {
  constructor() {
    this.app = express();
    this.server = null;
    this.startTime = new Date();
  }

  /**
   * Initialize the application
   */
  async initialize() {
    console.log('🚀 Starting Order Management Microservice...');
    console.log(`📊 Environment: ${config.env}`);
    console.log(`🏷️  Service: ${config.server.name}`);
    console.log(`📍 Version: 1.0.0`);
    console.log(`⏰ Start time: ${this.startTime.toISOString()}`);

    try {
      // Setup middleware
      this.setupMiddleware();
      
      // Connect to database
      await this.connectDatabase();
      
      // Setup routes
      this.setupRoutes();
      
      // Setup error handling
      this.setupErrorHandling();
      
      // Setup Consul service discovery
      await this.setupConsul();
      
      // Start server
      await this.startServer();
      
      console.log('✅ Order Service initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize Order Service:', error.message);
      console.error('🔍 Full error:', error);
      process.exit(1);
    }
  }

  /**
   * Setup Express middleware
   */
  setupMiddleware() {
    console.log('⚙️  Setting up middleware...');

    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: false, // Disable CSP for API service
      crossOriginEmbedderPolicy: false
    }));

    // Compression middleware
    this.app.use(compression());

    // CORS middleware
    this.app.use(cors({
      origin: config.cors.origins,
      methods: config.cors.methods,
      allowedHeaders: config.cors.allowedHeaders,
      credentials: config.cors.credentials
    }));

    // Rate limiting middleware
    const limiter = rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.max,
      message: config.rateLimit.message,
      standardHeaders: true,
      legacyHeaders: false
    });
    this.app.use(limiter);

    // Request logging middleware
    if (config.env !== 'test') {
      this.app.use(morgan(config.logging.format));
    }

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request ID middleware (for tracing)
    this.app.use((req, res, next) => {
      req.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      res.setHeader('X-Request-ID', req.id);
      next();
    });

    // Request timestamp middleware
    this.app.use((req, res, next) => {
      req.timestamp = new Date().toISOString();
      next();
    });

    console.log('✅ Middleware configured');
  }

  /**
   * Connect to MongoDB database
   */
  async connectDatabase() {
    console.log('🔄 Connecting to database...');
    await database.connect();
    console.log('✅ Database connected');
  }

  /**
   * Setup application routes
   */
  setupRoutes() {
    console.log('🛣️  Setting up routes...');
    setupRoutes(this.app);
    console.log('✅ Routes configured');
  }

  /**
   * Setup error handling middleware
   */
  setupErrorHandling() {
    console.log('🛡️  Setting up error handling...');
    
    // 404 handler
    this.app.use(errorHandler.notFound);
    
    // Global error handler
    this.app.use(errorHandler.handle);
    
    console.log('✅ Error handling configured');
  }

  /**
   * Setup Consul service discovery
   */
  async setupConsul() {
    console.log('🔍 Setting up Consul service discovery...');
    
    try {
      // Wait for Consul to be available
      await consulService.waitForConsul(10, 2);
      
      // Register service with Consul
      await consulService.registerService();
      
      // Setup graceful shutdown
      consulService.setupGracefulShutdown();
      
      console.log('✅ Consul service discovery configured');
      
    } catch (error) {
      console.warn('⚠️  Consul setup failed, continuing without service discovery:', error.message);
      console.warn('🔍 This is normal in development environments without Consul');
    }
  }

  /**
   * Start Express server
   */
  async startServer() {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(config.server.port, config.server.host, () => {
          console.log('🌟 =================================');
          console.log('🚀 ORDER SERVICE STARTED');
          console.log('🌟 =================================');
          console.log(`📍 Host: ${config.server.host}`);
          console.log(`🔌 Port: ${config.server.port}`);
          console.log(`🌐 URL: http://${config.server.host}:${config.server.port}`);
          console.log(`🏥 Health: http://${config.server.host}:${config.server.port}/health`);
          console.log(`📋 Orders: http://${config.server.host}:${config.server.port}/order`);
          console.log(`⏰ Started: ${this.startTime.toISOString()}`);
          console.log(`🕐 Uptime: ${this.getUptime()}`);
          console.log('🌟 =================================');
          
          resolve();
        });

        // Handle server errors
        this.server.on('error', (error) => {
          console.error('❌ Server error:', error);
          reject(error);
        });

      } catch (error) {
        console.error('❌ Failed to start server:', error);
        reject(error);
      }
    });
  }

  /**
   * Graceful shutdown
   */
  async shutdown(signal = 'SIGTERM') {
    console.log(`📤 Received ${signal}, starting graceful shutdown...`);
    
    try {
      // Close server
      if (this.server) {
        console.log('🔌 Closing HTTP server...');
        await new Promise((resolve, reject) => {
          this.server.close((err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        console.log('✅ HTTP server closed');
      }

      // Disconnect from database
      console.log('🗄️  Disconnecting from database...');
      await database.disconnect();
      console.log('✅ Database disconnected');

      // Deregister from Consul (handled by consulService)
      
      console.log('👋 Graceful shutdown completed successfully');
      process.exit(0);
      
    } catch (error) {
      console.error('❌ Error during graceful shutdown:', error);
      process.exit(1);
    }
  }

  /**
   * Get application uptime
   */
  getUptime() {
    const uptime = Date.now() - this.startTime.getTime();
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
}

/**
 * Application startup
 */
async function startApplication() {
  const app = new OrderServiceApp();
  
  // Setup process event handlers
  process.on('SIGTERM', () => app.shutdown('SIGTERM'));
  process.on('SIGINT', () => app.shutdown('SIGINT'));
  process.on('SIGUSR2', () => app.shutdown('SIGUSR2')); // nodemon restart
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    app.shutdown('uncaughtException');
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    app.shutdown('unhandledRejection');
  });
  
  // Initialize application
  await app.initialize();
}

// Start the application
if (require.main === module) {
  startApplication().catch(error => {
    console.error('💥 Failed to start application:', error);
    process.exit(1);
  });
}

module.exports = { OrderServiceApp, startApplication };