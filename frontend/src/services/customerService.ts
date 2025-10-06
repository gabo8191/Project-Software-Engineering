import api from '../utils/axiosConfig';
import { API_ENDPOINTS } from '../config/api';
import { Customer, CustomerResponse, CreateCustomerRequest } from '../types';

export const customerService = {
  createCustomer: async (customerData: CreateCustomerRequest): Promise<CustomerResponse> => {
    try {
      const response = await api.post<{
        success: boolean;
        message: string;
        customer?: {
          document: string;
          firstname: string;
          lastname: string;
          email: string;
        };
      }>(API_ENDPOINTS.customer.createCustomer, {
        document: customerData.document || Date.now().toString(),
        firstname: customerData.firstName,
        lastname: customerData.lastName,
        address: customerData.address,
        phone: customerData.phone,
        email: customerData.email
      });
      
      // Adapt to our new customer service response format
      return {
        success: response.data.success,
        message: response.data.message,
        customer: response.data.customer ? {
          id: response.data.customer.document,
          firstName: response.data.customer.firstname,
          lastName: response.data.customer.lastname,
          address: customerData.address,
          phone: customerData.phone,
          email: response.data.customer.email,
          createdAt: new Date().toISOString(),
          document: response.data.customer.document,
          firstname: response.data.customer.firstname,
          lastname: response.data.customer.lastname
        } : undefined
      };
    } catch (error: any) {
      console.error('Error creating customer:', error);
      throw new Error(error.response?.data?.detail || 'Error creating customer');
    }
  },

  updateCustomer: async (customerId: string, customerData: Partial<Customer>): Promise<Customer> => {
    try {
      const response = await api.put<{ updateCustomerValid: boolean }>(`${API_ENDPOINTS.customer.updateCustomer}?customerid=${customerId}`, {
        firstname: customerData.firstName || customerData.firstname || '',
        lastname: customerData.lastName || customerData.lastname || '',
        address: customerData.address || '',
        phone: customerData.phone || '',
        email: customerData.email || ''
      });
      
      if (!response.data.updateCustomerValid) {
        throw new Error('Failed to update customer');
      }
      
      // Return the updated customer data
      return {
        id: customerId,
        firstName: customerData.firstName || customerData.firstname || '',
        lastName: customerData.lastName || customerData.lastname || '',
        address: customerData.address || '',
        phone: customerData.phone || '',
        email: customerData.email || '',
        createdAt: customerData.createdAt || new Date().toISOString(),
        document: customerId,
        firstname: customerData.firstName || customerData.firstname || '',
        lastname: customerData.lastName || customerData.lastname || ''
      };
    } catch (error: any) {
      console.error('Error updating customer:', error);
      throw new Error('Failed to update customer');
    }
  },

  getCustomerById: async (customerId: string): Promise<Customer> => {
    try {
      const response = await api.get<Customer>(`${API_ENDPOINTS.customer.findCustomerById}?customerid=${customerId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching customer:', error);
      throw new Error('Failed to fetch customer');
    }
  },

  getAllCustomers: async (): Promise<Customer[]> => {
    try {
      const response = await api.get<any[]>(API_ENDPOINTS.customer.getCustomers);
      
      // Map the response to match our Customer interface
      return response.data.map(customer => ({
        id: customer.document || customer.id || Date.now().toString(),
        firstName: customer.firstname || customer.firstName || '',
        lastName: customer.lastname || customer.lastName || '',
        address: customer.address || '',
        phone: customer.phone || '',
        email: customer.email || '',
        createdAt: customer.created_at || customer.createdAt || new Date().toISOString(),
        // Keep backend fields for compatibility
        document: customer.document,
        firstname: customer.firstname,
        lastname: customer.lastname
      }));
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      // Return empty array if there's an error or no customers
      return [];
    }
  },

  getCustomerByEmail: async (email: string): Promise<Customer> => {
    try {
      const response = await api.get<Customer>(`${API_ENDPOINTS.customer.getCustomerByEmail}/${email}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching customer by email:', error);
      throw new Error('Failed to fetch customer');
    }
  }
};