import orderService from '../services/orderService';
import validationService from '../services/validationService';
import {
  CreateOrderReq,
  CreateOrderRes,
  UpdateOrderReq, 
  UpdateOrderRes,
  GetOrderReq,
  GetOrderRes,
  GetAllOrdersReq,
  GetAllOrdersRes,
  DeleteOrderReq,
  DeleteOrderRes
} from '../types/express.types';
import { OrderStatus } from '../types/order.types';

/**
 * Order Controller - HTTP request handlers for order operations
 * TypeScript implementation with strong typing for Express endpoints
 */
class OrderController {
  /**
   * Create a new order
   * POST /order/createorder
   */
  async createOrder(req: CreateOrderReq, res: CreateOrderRes): Promise<void> {
    try {
      console.log('📦 Creating new order:', req.body);

      // Validate request data
      const validation = validationService.validateCreateOrder(req.body);
      
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
        return;
      }

      // Create order using service
      const result = await orderService.createOrder(validation.data);

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        orderCreated: result.orderCreated,
        data: result.order
      });

    } catch (error) {
      console.error('❌ Controller error creating order:', (error as Error).message);
      
      res.status(500).json({
        success: false,
        message: 'Internal server error while creating order',
        errors: [(error as Error).message]
      });
    }
  }

  /**
   * Update order status
   * PUT /order/updateorderstatus
   */
  async updateOrderStatus(req: UpdateOrderReq, res: UpdateOrderRes): Promise<void> {
    try {
      console.log('🔄 Updating order status:', req.body);

      // Validate request data
      const validation = validationService.validateUpdateOrderStatus(req.body);
      
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
        return;
      }

      const { orderID, status } = validation.data;

      // Update order status using service
      const result = await orderService.updateOrderStatus(orderID, status as OrderStatus);

      res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
        orderUpdated: result.orderStatusUpdated,
        data: result.order
      });

    } catch (error) {
      console.error('❌ Controller error updating order status:', (error as Error).message);
      
      if ((error as Error).message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: 'Order not found',
          errors: [(error as Error).message]
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error while updating order status',
        errors: [(error as Error).message]
      });
    }
  }

  /**
   * Get orders by customer ID
   * GET /order/getordersbycustomerid/:customerID
   */
  async getOrdersByCustomerID(req: GetOrderReq, res: GetOrderRes): Promise<void> {
    try {
      const { customerID } = req.params;
      console.log('🔍 Getting orders for customer:', customerID);

      // Validate customer ID
      if (!validationService.isValidCustomerID(customerID)) {
        res.status(400).json({
          success: false,
          message: 'Invalid customer ID format',
          errors: ['Customer ID must be a string with maximum 50 characters']
        });
        return;
      }

      // Get orders using service
      const orders = await orderService.findOrdersByCustomerID(customerID);

      res.status(200).json({
        success: true,
        message: `Found ${orders.length} orders for customer ${customerID}`,
        data: orders
      });

    } catch (error) {
      console.error('❌ Controller error getting orders by customer ID:', (error as Error).message);
      
      res.status(500).json({
        success: false,
        message: 'Internal server error while getting orders',
        errors: [(error as Error).message]
      });
    }
  }

  /**
   * Get order by ID
   * GET /order/getorderbyid/:orderID
   */
  async getOrderByID(req: GetOrderReq, res: GetOrderRes): Promise<void> {
    try {
      const { orderID } = req.params;
      console.log('🔍 Getting order by ID:', orderID);

      // Validate order ID
      if (!validationService.isValidOrderID(orderID)) {
        res.status(400).json({
          success: false,
          message: 'Invalid order ID format',
          errors: ['Order ID must be a string with maximum 100 characters']
        });
        return;
      }

      // Get order using service
      const order = await orderService.findOrderByID(orderID);

      res.status(200).json({
        success: true,
        message: 'Order found successfully',
        data: order
      });

    } catch (error) {
      console.error('❌ Controller error getting order by ID:', (error as Error).message);
      
      if ((error as Error).message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: 'Order not found',
          errors: [(error as Error).message]
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error while getting order',
        errors: [(error as Error).message]
      });
    }
  }

  /**
   * Get all orders with pagination
   * GET /order/getallorders
   */
  async getAllOrders(req: GetAllOrdersReq, res: GetAllOrdersRes): Promise<void> {
    try {
      console.log('📋 Getting all orders with pagination:', req.query);

      // Validate pagination parameters
      const validation = validationService.validatePagination(req.query);
      
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          message: 'Invalid pagination parameters',
          errors: validation.errors
        });
        return;
      }

      const { page, limit } = validation.data;

      // Get orders using service
      const result = await orderService.getAllOrders({ page, limit });

      res.status(200).json({
        success: true,
        message: `Retrieved ${result.orders.length} orders`,
        data: result.orders,
        pagination: result.pagination
      });

    } catch (error) {
      console.error('❌ Controller error getting all orders:', (error as Error).message);
      
      res.status(500).json({
        success: false,
        message: 'Internal server error while getting orders',
        errors: [(error as Error).message]
      });
    }
  }

  /**
   * Delete order by ID
   * DELETE /order/deleteorder/:orderID
   */
  async deleteOrder(req: DeleteOrderReq, res: DeleteOrderRes): Promise<void> {
    try {
      const { orderID } = req.params;
      console.log('🗑️ Deleting order:', orderID);

      // Validate order ID
      if (!validationService.isValidOrderID(orderID)) {
        res.status(400).json({
          success: false,
          message: 'Invalid order ID format',
          errors: ['Order ID must be a string with maximum 100 characters']
        });
        return;
      }

      // Delete order using service
      const result = await orderService.deleteOrder(orderID);

      res.status(200).json({
        success: true,
        message: 'Order deleted successfully',
        orderDeleted: result.orderDeleted
      });

    } catch (error) {
      console.error('❌ Controller error deleting order:', (error as Error).message);
      
      if ((error as Error).message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: 'Order not found',
          errors: [(error as Error).message]
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error while deleting order',
        errors: [(error as Error).message]
      });
    }
  }

  /**
   * Get order statistics
   * GET /order/stats
   */
  async getOrderStats(req: GetAllOrdersReq, res: GetAllOrdersRes): Promise<void> {
    try {
      console.log('📊 Getting order statistics');

      // Get stats using service
      const stats = await orderService.getOrderStats();

      res.status(200).json({
        success: true,
        message: 'Order statistics retrieved successfully',
        data: stats
      });

    } catch (error) {
      console.error('❌ Controller error getting order stats:', (error as Error).message);
      
      res.status(500).json({
        success: false,
        message: 'Internal server error while getting order statistics',
        errors: [(error as Error).message]
      });
    }
  }
}

export default new OrderController();