import api from '../utils/axiosConfig';
import { API_ENDPOINTS } from '../config/api';
import { 
  Order, 
  CreateOrderRequest, 
  UpdateOrderStatusRequest, 
  OrderResponse
} from '../types';

export const orderService = {
  /**
   * Create a new order with user validation
   */
  createOrder: async (orderData: CreateOrderRequest): Promise<OrderResponse> => {
    try {
      console.log('📦 Creating order:', orderData);
      
      // Create the order using API Gateway
      const response = await api.post<OrderResponse>(API_ENDPOINTS.order.createOrder, {
        customerID: orderData.customerId, // Use the correct field name expected by the backend
        items: orderData.items,
        totalAmount: orderData.totalAmount,
        status: orderData.status || 'Received'
      });
      
      console.log('✅ Order created successfully through API Gateway');
      return response.data;
      
    } catch (error: any) {
      console.error('❌ Error creating order:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('Error creating order: ' + error.message);
    }
  },

  updateOrderStatus: async (updateData: UpdateOrderStatusRequest): Promise<OrderResponse> => {
    try {
      const response = await api.put<OrderResponse>(API_ENDPOINTS.order.updateOrderStatus, {
        orderID: updateData.orderID,
        status: updateData.status
      });
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Error updating order status:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error updating order status');
    }
  },

  getOrdersByCustomerId: async (customerId: string): Promise<Order[]> => {
    try {
      const response = await api.get<any>(`${API_ENDPOINTS.order.getOrdersByCustomerId}/${customerId}`);
      
      // Handle the actual API response structure
      const ordersData = response.data?.data || response.data || [];
      
      // Map the response to match our Order interface
      const orders = ordersData.map((order: any) => ({
        ...order,
        _id: order._id || order.id || order.orderID,
        customerId: order.customerId || order.customerID || order.customer_id
      }));
      
      return orders;
    } catch (error: any) {
      console.error('❌ Error getting orders by customer ID:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error retrieving customer orders');
    }
  },

  getOrderById: async (orderId: string): Promise<Order> => {
    try {
      const response = await api.get<Order>(`${API_ENDPOINTS.order.getOrderById}/${orderId}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error getting order by ID:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Order not found');
    }
  },

  getAllOrders: async (): Promise<Order[]> => {
    try {
      const response = await api.get<any>(API_ENDPOINTS.order.getAllOrders);
      
      // Handle the actual API response structure
      const ordersData = response.data?.data || response.data || [];
      
      // Map the response to match our Order interface
      return ordersData.map((order: any) => ({
        _id: order.orderID || order._id || order.id || Date.now().toString(),
        customerId: order.customerID || order.customerId || order.customer_id || '',
        orderID: order.orderID || order._id || order.id,
        items: order.items || [],
        totalAmount: order.totalAmount || 0,
        status: order.status || 'pending',
        orderDate: order.orderDate || order.createdAt || new Date().toISOString(),
        // Keep backend compatibility fields
        customerID: order.customerID,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }));
    } catch (error: any) {
      console.error('❌ Error fetching all orders:', error);
      return [];
    }
  },

  deleteOrder: async (orderId: string): Promise<boolean> => {
    try {
      const response = await api.delete(`${API_ENDPOINTS.order.deleteOrder}/${orderId}`);
      return response.status === 200;
    } catch (error: any) {
      console.error('❌ Error deleting order:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error deleting order');
    }
  },

  getOrderStats: async (): Promise<any> => {
    try {
      const response = await api.get(API_ENDPOINTS.order.getStats);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching order stats:', error);
      return {};
    }
  },

  // Health check method to verify order service is available through API Gateway
  checkHealth: async (): Promise<boolean> => {
    try {
      const response = await api.get('/order/health');
      return response.status === 200;
    } catch (error) {
      console.error('❌ Order service health check failed:', error);
      return false;
    }
  }
};