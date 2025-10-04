import Order, { IOrderDocument } from '../models/Order';
import { IOrder, OrderStatus, CreateOrderRequest } from '../types/order.types';

/**
 * Order Service - Business logic for order operations
 * TypeScript implementation with strong typing
 */
class OrderService {
  /**
   * Create a new order
   */
  async createOrder(orderData: CreateOrderRequest): Promise<{ orderCreated: boolean; order: IOrder }> {
    try {
      const { customerID, orderID, status = OrderStatus.RECEIVED } = orderData;

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

      const savedOrder: IOrderDocument = await order.save();
      
      console.log(`✅ Order created successfully: ${savedOrder.orderID}`);
      
      return {
        orderCreated: true,
        order: savedOrder.toJSON()
      };

    } catch (error) {
      console.error('❌ Error creating order:', (error as Error).message);
      
      if ((error as any).name === 'ValidationError') {
        const validationErrors = Object.values((error as any).errors).map((err: any) => err.message);
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }
      
      if ((error as any).code === 11000) {
        throw new Error('Order ID already exists');
      }
      
      throw error;
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderID: string, status: OrderStatus): Promise<{ orderStatusUpdated: boolean; order: IOrder }> {
    try {
      // Validate inputs
      if (!orderID) {
        throw new Error('Order ID is required');
      }
      
      if (!status) {
        throw new Error('Status is required');
      }

      // Validate status enum
      if (!Object.values(OrderStatus).includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${Object.values(OrderStatus).join(', ')}`);
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
      console.error('❌ Error updating order status:', (error as Error).message);
      throw error;
    }
  }

  /**
   * Find orders by customer ID
   */
  async findOrdersByCustomerID(customerID: string): Promise<IOrder[]> {
    try {
      if (!customerID) {
        throw new Error('Customer ID is required');
      }

      const orders = await Order.findByCustomerID(customerID);
      
      console.log(`✅ Found ${orders.length} orders for customer: ${customerID}`);
      
      // Return formatted orders
      return orders.map(order => order.toJSON());

    } catch (error) {
      console.error('❌ Error finding orders by customer ID:', (error as Error).message);
      throw error;
    }
  }

  /**
   * Find order by order ID
   */
  async findOrderByID(orderID: string): Promise<IOrder> {
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
      console.error('❌ Error finding order by ID:', (error as Error).message);
      throw error;
    }
  }

  /**
   * Get all orders with pagination
   */
  async getAllOrders(options: { page?: number; limit?: number } = {}): Promise<{
    orders: IOrder[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    try {
      const { page = 1, limit = 10 } = options;
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
      console.error('❌ Error getting all orders:', (error as Error).message);
      throw error;
    }
  }

  /**
   * Get order statistics
   */
  async getOrderStats(): Promise<{
    total: number;
    statusCounts: Array<{ status: string; count: number }>;
  }> {
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
      console.error('❌ Error getting order statistics:', (error as Error).message);
      throw error;
    }
  }

  /**
   * Delete order by ID
   */
  async deleteOrder(orderID: string): Promise<{ orderDeleted: boolean }> {
    try {
      if (!orderID) {
        throw new Error('Order ID is required');
      }

      const deletedOrder = await Order.findOneAndDelete({ orderID });
      
      if (!deletedOrder) {
        throw new Error(`Order with ID ${orderID} not found`);
      }

      console.log(`✅ Order deleted successfully: ${orderID}`);
      
      return { orderDeleted: true };

    } catch (error) {
      console.error('❌ Error deleting order:', (error as Error).message);
      throw error;
    }
  }
}

export default new OrderService();