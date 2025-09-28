const express = require('express');
const orderController = require('../controllers/orderController');
const validationService = require('../services/validationService');

const router = express.Router();

/**
 * Order Routes
 * Implements the exact API specification from project requirements
 */

// ========================================
// REQUIRED ENDPOINTS (from specification)
// ========================================

/**
 * @route POST /order/createorder
 * @desc Create a new order
 * @access Public
 * @param {string} customerid - Customer ID (required)
 * @param {string} orderID - Order ID (optional, auto-generated if not provided)
 * @param {string} status - Order status (optional, defaults to 'Received')
 * @returns {Object} { orderCreated: boolean }
 */
router.post('/createorder', orderController.createOrder);

/**
 * @route PUT /order/updateorderstatus
 * @desc Update order status
 * @access Public
 * @param {string} orderID - Order ID (required)
 * @param {string} status - New status: 'Received', 'In progress', 'Sended' (required)
 * @returns {Object} { orderStatusUpdated: boolean }
 */
router.put('/updateorderstatus', orderController.updateOrderStatus);

/**
 * @route GET /order/findorderbycustomerid
 * @desc Find all orders by customer ID
 * @access Public
 * @param {string} customerid - Customer ID (query parameter, required)
 * @returns {Array} [{ customerid: string, orderID: string, status: string }]
 */
router.get('/findorderbycustomerid', orderController.findOrdersByCustomerID);

// ========================================
// ADDITIONAL ENDPOINTS (for completeness)
// ========================================

/**
 * @route GET /order/all
 * @desc Get all orders with pagination
 * @access Public
 * @param {number} page - Page number (optional, default: 1)
 * @param {number} limit - Items per page (optional, default: 10)
 * @returns {Object} { orders: [], pagination: {} }
 */
router.get('/all', orderController.getAllOrders);

/**
 * @route GET /order/stats
 * @desc Get order statistics
 * @access Public
 * @returns {Object} { total: number, statusCounts: [] }
 */
router.get('/stats', orderController.getOrderStats);

/**
 * @route GET /order/:orderID
 * @desc Get specific order by ID
 * @access Public
 * @param {string} orderID - Order ID (path parameter)
 * @returns {Object} Order details
 */
router.get('/:orderID', orderController.getOrderByID);

// ========================================
// ROUTE MIDDLEWARE (if needed)
// ========================================

// Example: Add validation middleware to specific routes
// router.post('/createorder', 
//   validationService.validateMiddleware('createOrder'),
//   orderController.createOrder
// );

// ========================================
// ERROR HANDLING
// ========================================

// Handle 404 for undefined routes within /order
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found in Order Service`,
    availableRoutes: [
      'POST /order/createorder',
      'PUT /order/updateorderstatus',
      'GET /order/findorderbycustomerid?customerid=<ID>',
      'GET /order/all',
      'GET /order/stats',
      'GET /order/:orderID'
    ]
  });
});

module.exports = router;