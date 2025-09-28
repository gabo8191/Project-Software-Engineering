const Order = require('../models/Order');

/**
 * Order Service - Business logic for order operations
 */
class OrderService {
  /**
   * Create a new order
   * @param {Object} orderData - Order data
   * @param {string} orderData.customerID - Customer ID
   * @param {string} [orderData.orderID] - Order ID (auto-generated if not provided)
   * @param {string} [orderData.status] - Order status (defaults to 'Received')
   * @returns {Promise<Object>} Created order
   */
  async createOrder(orderData) {
    try {
      const { customerID, orderID, status = 'Received' } = orderData;

      // Validate required fields
      if (!customerID) {
        throw new Error('Customer ID is required');
      }

      // Check if orderID already exists (if provided)
      if (orderID) {
        const existingOrder = await Order.findByOrderID(orderID);
        if (existingOrder) {
          throw new Error(`Order with ID ${orderID} already exists`);
        }
      }

      // Create new order
      const order = new Order({
        customerID,
        orderID,
        status
      });

      const savedOrder = await order.save();
      
      console.log(`✅ Order created successfully: ${savedOrder.orderID}`);
      
      return {
        orderCreated: true,
        order: savedOrder.toJSON()
      };

    } catch (error) {
      console.error('❌ Error creating order:', error.message);
      
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }
      
      if (error.code === 11000) {
        throw new Error('Order ID already exists');
      }
      
      throw error;
    }
  }

  /**
   * Update order status
   * @param {string} orderID - Order ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated order
   */
  async updateOrderStatus(orderID, status) {
    try {
      // Validate inputs
      if (!orderID) {
        throw new Error('Order ID is required');
      }
      
      if (!status) {
        throw new Error('Status is required');
      }

      const validStatuses = ['Received', 'In progress', 'Sended'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }

      // Find and update order
      const updatedOrder = await Order.updateOrderStatus(orderID, status);
      
      if (!updatedOrder) {
        throw new Error(`Order with ID ${orderID} not found`);
      }

      console.log(`✅ Order status updated: ${orderID} -> ${status}`);
      
      return {
        orderStatusUpdated: true,
        order: updatedOrder.toJSON()
      };

    } catch (error) {
      console.error('❌ Error updating order status:', error.message);
      throw error;
    }
  }

  /**
   * Find orders by customer ID
   * @param {string} customerID - Customer ID
   * @returns {Promise<Array>} Array of orders
   */
  async findOrdersByCustomerID(customerID) {
    try {
      if (!customerID) {
        throw new Error('Customer ID is required');
      }

      const orders = await Order.findByCustomerID(customerID);
      
      console.log(`✅ Found ${orders.length} orders for customer: ${customerID}`);
      
      // Return in the format expected by the API specification
      const formattedOrders = orders.map(order => ({
        customerID: order.customerID,
        orderID: order.orderID,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }));
      
      return formattedOrders;

    } catch (error) {
      console.error('❌ Error finding orders by customer ID:', error.message);
      throw error;
    }
  }

  /**
   * Find order by order ID
   * @param {string} orderID - Order ID
   * @returns {Promise<Object>} Order object
   */
  async findOrderByID(orderID) {
    try {
      if (!orderID) {
        throw new Error('Order ID is required');
      }

      const order = await Order.findByOrderID(orderID);
      
      if (!order) {
        throw new Error(`Order with ID ${orderID} not found`);
      }

      console.log(`✅ Order found: ${orderID}`);
      
      return order.toJSON();

    } catch (error) {
      console.error('❌ Error finding order by ID:', error.message);
      throw error;
    }
  }

  /**
   * Get all orders with pagination
   * @param {Object} options - Pagination options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 10)
   * @returns {Promise<Object>} Paginated orders
   */
  async getAllOrders({ page = 1, limit = 10 } = {}) {
    try {
      const skip = (page - 1) * limit;
      
      const orders = await Order
        .find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const total = await Order.countDocuments({});
      const totalPages = Math.ceil(total / limit);
      
      console.log(`✅ Retrieved ${orders.length} orders (page ${page}/${totalPages})`);
      
      return {
        orders: orders.map(order => order.toJSON()),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };

    } catch (error) {
      console.error('❌ Error getting all orders:', error.message);
      throw error;
    }
  }

  /**
   * Get order statistics
   * @returns {Promise<Object>} Order statistics
   */
  async getOrderStats() {
    try {
      const stats = await Order.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$count' },
            statusCounts: {
              $push: {
                status: '$_id',
                count: '$count'
              }
            }
          }
        }
      ]);

      const result = stats[0] || { total: 0, statusCounts: [] };
      
      console.log(`✅ Order statistics retrieved - Total: ${result.total}`);
      
      return result;

    } catch (error) {
      console.error('❌ Error getting order statistics:', error.message);
      throw error;
    }
  }
}

module.exports = new OrderService();