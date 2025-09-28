const orderService = require('../services/orderService');
const validationService = require('../services/validationService');

/**
 * Order Controller - HTTP request handlers for order operations
 * Implements the exact API specification from the project requirements
 */
class OrderController {
  /**
   * Create a new order
   * POST /order/createorder
   * Parameters: customerID, orderID (optional), status (optional)
   * Returns: { orderCreated: boolean }
   */
  async createOrder(req, res) {
    try {
      console.log('📦 Creating new order:', req.body);

      // Validate request data
      const validation = validationService.validateCreateOrder(req.body);
      
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      // Create order using service
      const result = await orderService.createOrder(validation.data);
      
      // Return response matching API specification
      res.status(201).json({
        orderCreated: result.orderCreated,
        order: result.order
      });

    } catch (error) {
      console.error('❌ Error in createOrder controller:', error.message);
      
      const statusCode = error.message.includes('already exists') ? 409 : 
                        error.message.includes('Validation') ? 400 : 500;
      
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to create order',
        orderCreated: false
      });
    }
  }

  /**
   * Update order status
   * PUT /order/updateorderstatus
   * Parameters: orderID, status
   * Returns: { orderStatusUpdated: boolean }
   */
  async updateOrderStatus(req, res) {
    try {
      console.log('🔄 Updating order status:', req.body);

      // Validate request data
      const validation = validationService.validateUpdateOrderStatus(req.body);
      
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      const { orderID, status } = validation.data;

      // Update order status using service
      const result = await orderService.updateOrderStatus(orderID, status);
      
      // Return response matching API specification
      res.status(200).json({
        orderStatusUpdated: result.orderStatusUpdated,
        order: result.order
      });

    } catch (error) {
      console.error('❌ Error in updateOrderStatus controller:', error.message);
      
      const statusCode = error.message.includes('not found') ? 404 : 
                        error.message.includes('Invalid') ? 400 : 500;
      
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to update order status',
        orderStatusUpdated: false
      });
    }
  }

  /**
   * Find orders by customer ID
   * GET /order/findorderbycustomerid
   * Parameters: customerID (query parameter)
   * Returns: [{ customerID, orderID, status }]
   */
  async findOrdersByCustomerID(req, res) {
    try {
      const customerID = req.query.customerid || req.query.customerID;
      
      console.log('🔍 Finding orders for customer:', customerID);

      // Validate request data
      const validation = validationService.validateFindOrdersByCustomerID({ customerID });
      
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      // Find orders using service
      const orders = await orderService.findOrdersByCustomerID(validation.data.customerID);
      
      // Return response matching API specification
      res.status(200).json(orders);

    } catch (error) {
      console.error('❌ Error in findOrdersByCustomerID controller:', error.message);
      
      const statusCode = error.message.includes('required') ? 400 : 500;
      
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to find orders',
        orders: []
      });
    }
  }

  /**
   * Get all orders with pagination (additional endpoint for admin)
   * GET /order/all
   * Parameters: page (optional), limit (optional)
   * Returns: { orders: [], pagination: {} }
   */
  async getAllOrders(req, res) {
    try {
      console.log('📋 Getting all orders with pagination:', req.query);

      // Validate pagination parameters
      const validation = validationService.validatePagination(req.query);
      
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      // Get orders using service
      const result = await orderService.getAllOrders(validation.data);
      
      res.status(200).json({
        success: true,
        data: result.orders,
        pagination: result.pagination
      });

    } catch (error) {
      console.error('❌ Error in getAllOrders controller:', error.message);
      
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get orders',
        data: []
      });
    }
  }

  /**
   * Get order statistics (additional endpoint for admin)
   * GET /order/stats
   * Returns: { total: number, statusCounts: [] }
   */
  async getOrderStats(req, res) {
    try {
      console.log('📊 Getting order statistics');

      const stats = await orderService.getOrderStats();
      
      res.status(200).json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('❌ Error in getOrderStats controller:', error.message);
      
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get order statistics',
        data: { total: 0, statusCounts: [] }
      });
    }
  }

  /**
   * Get order by ID (additional endpoint)
   * GET /order/:orderID
   * Parameters: orderID (path parameter)
   * Returns: { customerID, orderID, status }
   */
  async getOrderByID(req, res) {
    try {
      const { orderID } = req.params;
      
      console.log('🔍 Getting order by ID:', orderID);

      if (!orderID) {
        return res.status(400).json({
          success: false,
          message: 'Order ID is required'
        });
      }

      const order = await orderService.findOrderByID(orderID);
      
      res.status(200).json({
        success: true,
        data: order
      });

    } catch (error) {
      console.error('❌ Error in getOrderByID controller:', error.message);
      
      const statusCode = error.message.includes('not found') ? 404 : 500;
      
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to get order'
      });
    }
  }
}

module.exports = new OrderController();