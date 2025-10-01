const express = require('express');

// Import route modules
const orderRoutes = require('./orderRoutes');
const healthRoutes = require('./healthRoutes');

/**
 * Main router configuration
 * Combines all route modules and sets up the API structure
 */
const setupRoutes = (app) => {
  console.log('🛣️  Setting up routes...');

  // ========================================
  // HEALTH CHECK ROUTES (root level)
  // ========================================

  // Mount health routes at root level for direct access
  app.use('/', healthRoutes);

  // ========================================
  // ORDER SERVICE ROUTES
  // ========================================

  // Mount health routes under /order prefix FIRST (before parameterized routes)
  app.use('/order', healthRoutes);

  // Mount order routes with /order prefix to match API specification
  app.use('/order', orderRoutes);

  // ========================================
  // ROOT ENDPOINT
  // ========================================

  // Root endpoint with service information
  app.get('/', (req, res) => {
    res.json({
      service: 'Order Management Microservice',
      version: '1.0.0',
      description:
        'Node.js + Express + MongoDB microservice for order management',
      author: 'Software Engineering Team',
      endpoints: {
        health: {
          '/health': 'Basic health check',
          '/ready': 'Readiness probe',
          '/live': 'Liveness probe',
          '/status': 'Detailed service status',
          '/ping': 'Simple ping',
        },
        orders: {
          'POST /order/createorder': 'Create new order',
          'PUT /order/updateorderstatus': 'Update order status',
          'GET /order/findorderbycustomerid': 'Find orders by customer ID',
          'GET /order/all': 'Get all orders (paginated)',
          'GET /order/stats': 'Get order statistics',
          'GET /order/:orderID': 'Get order by ID',
        },
      },
      documentation: {
        swagger: '/api-docs',
        postman: 'Available on request',
      },
      timestamp: new Date().toISOString(),
    });
  });

  // ========================================
  // API DOCUMENTATION (if Swagger is added later)
  // ========================================

  // Placeholder for Swagger documentation
  app.get('/api-docs', (req, res) => {
    res.json({
      message: 'API documentation will be available here',
      service: 'order-service',
      version: '1.0.0',
      endpoints: [
        {
          method: 'POST',
          path: '/order/createorder',
          description: 'Create a new order',
          parameters: ['customerid', 'orderID (optional)', 'status (optional)'],
          returns: '{ orderCreated: boolean }',
        },
        {
          method: 'PUT',
          path: '/order/updateorderstatus',
          description: 'Update order status',
          parameters: ['orderID', 'status'],
          returns: '{ orderStatusUpdated: boolean }',
        },
        {
          method: 'GET',
          path: '/order/findorderbycustomerid',
          description: 'Find orders by customer ID',
          parameters: ['customerid (query)'],
          returns: '[{ customerid, orderID, status }]',
        },
      ],
    });
  });

  // ========================================
  // CATCH ALL - 404 HANDLER
  // ========================================

  // Handle all undefined routes
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      message: `Route ${req.originalUrl} not found`,
      service: 'order-service',
      availableEndpoints: [
        'GET /',
        'GET /health',
        'GET /ready',
        'GET /live',
        'GET /status',
        'GET /ping',
        'POST /order/createorder',
        'PUT /order/updateorderstatus',
        'GET /order/findorderbycustomerid',
        'GET /order/all',
        'GET /order/stats',
        'GET /order/:orderID',
      ],
      timestamp: new Date().toISOString(),
    });
  });

  console.log('✅ Routes configured successfully');
  console.log('📋 Available endpoints:');
  console.log('   Health: GET /health, /ready, /live, /status, /ping');
  console.log('   Orders: POST /order/createorder');
  console.log('   Orders: PUT /order/updateorderstatus');
  console.log('   Orders: GET /order/findorderbycustomerid');
  console.log('   Orders: GET /order/all, /order/stats, /order/:id');
};

module.exports = setupRoutes;
