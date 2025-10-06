import express, { Request, Response } from 'express';
import orderRoutes from './orderRoutes';
import healthRoutes from './healthRoutes';
import testRoutes from './testRoutes';

const router = express.Router();

/**
 * Main Routes Index - TypeScript implementation
 * Centralized route configuration for the Order Service API
 */

// Health and monitoring endpoints
router.use('/', healthRoutes);

// Order management endpoints (without /order prefix since Traefik strips it)
router.use('/', orderRoutes);

// Service communication test endpoints
router.use('/test', testRoutes);

// API Documentation endpoint
router.get('/', (req: Request, res: Response) => {
  res.json({
    service: 'Order Service - TypeScript',
    version: '2.0.0',
    description: 'Order Management Microservice with TypeScript',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: {
        'GET /health': 'Service health check',
        'GET /ready': 'Service readiness check',
        'GET /live': 'Service liveness check',
        'GET /status': 'Detailed service status',
        'GET /ping': 'Simple ping endpoint'
      },
      orders: {
        'POST /order/createorder': 'Create a new order',
        'PUT /order/updateorderstatus': 'Update order status',
        'GET /order/getordersbycustomerid/:customerID': 'Get orders by customer ID',
        'GET /order/getorderbyid/:orderID': 'Get order by ID',
        'GET /order/getallorders': 'Get all orders with pagination',
        'DELETE /order/deleteorder/:orderID': 'Delete order by ID',
        'GET /order/stats': 'Get order statistics'
      },
      test: {
        'GET /test/services/health': 'Test all services health',
        'GET /test/user-service/:userId': 'Test user service connection',
        'POST /test/login-service': 'Test login service connection',
        'GET /test/user-preferences/:userId': 'Test user preferences',
        'POST /test/order-workflow': 'Test complete order workflow'
      }
    },
    technologies: {
      language: 'TypeScript',
      runtime: 'Node.js',
      framework: 'Express.js',
      database: 'MongoDB',
      odm: 'Mongoose',
      validation: 'Joi'
    }
  });
});

// Catch-all route for undefined endpoints
router.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      'GET /',
      'GET /health',
      'GET /ready', 
      'GET /live',
      'GET /status',
      'GET /ping',
      'POST /order/createorder',
      'PUT /order/updateorderstatus',
      'GET /order/getordersbycustomerid/:customerID',
      'GET /order/getorderbyid/:orderID',
      'GET /order/getallorders',
      'DELETE /order/deleteorder/:orderID',
      'GET /order/stats',
      'GET /test/services/health',
      'GET /test/user-service/:userId',
      'POST /test/login-service',
      'GET /test/user-preferences/:userId',
      'POST /test/order-workflow'
    ]
  });
});

export default router;