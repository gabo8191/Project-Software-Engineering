import api from '../utils/axiosConfig';
import { API_ENDPOINTS, SERVICE_URLS } from '../config/api';

export interface User {
  id: string;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserRequest {
  email: string;
  firstname: string;  // Note: using firstname/lastname to match user-service API
  lastname: string;
  document?: string;
  address?: string;
  phone?: string;
}

export interface UpdateUserRequest {
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
}

export interface UserResponse {
  success: boolean;
  message: string;
  user?: User;
  users?: User[];
}

export interface AuthValidationRequest {
  email: string;
  password: string;
}

export interface AuthValidationResponse {
  valid: boolean;
  user?: User;
  message?: string;
}

export const userService = {
  /**
   * Create a new user in the user service
   */
  createUser: async (userData: CreateUserRequest): Promise<UserResponse> => {
    try {
      console.log('� Creating user:', userData);
      
      const response = await api.post(`${SERVICE_URLS.USER_SERVICE}${API_ENDPOINTS.user.createUser}`, {
        document: userData.document || Date.now().toString(), // Generate a document ID if not provided
        firstname: userData.firstname,
        lastname: userData.lastname,
        email: userData.email,
        address: userData.address || '',
        phone: userData.phone || ''
      });
      
      return {
        success: response.data.createCustomerValid || false,
        message: response.data.createCustomerValid ? 'User created successfully' : 'Failed to create user',
        user: response.data.createCustomerValid ? {
          id: userData.document || Date.now().toString(),
          email: userData.email,
          username: userData.email.split('@')[0],
          first_name: userData.firstname,
          last_name: userData.lastname,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } : undefined
      };
    } catch (error: any) {
      console.error('❌ Error creating user:', error);
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Error creating user';
      
      return {
        success: false,
        message: errorMessage
      };
    }
  },

  /**
   * Get user by ID
   */
  getUserById: async (userId: string): Promise<UserResponse> => {
    try {
      console.log('🔍 Getting user by ID:', userId);
      
      const response = await api.get<User>(`${SERVICE_URLS.USER_SERVICE}${API_ENDPOINTS.user.getUser}/${userId}`);
      
      return {
        success: true,
        message: 'User retrieved successfully',
        user: response.data
      };
    } catch (error: any) {
      console.error('❌ Error getting user:', error);
      
      if (error.response?.status === 404) {
        return {
          success: false,
          message: 'User not found'
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.detail || 'Error retrieving user'
      };
    }
  },

  /**
   * Get user by email
   */
  getUserByEmail: async (email: string): Promise<UserResponse> => {
    try {
      console.log('🔍 Getting user by email:', email);
      
      const response = await api.get<User>(`${SERVICE_URLS.USER_SERVICE}${API_ENDPOINTS.user.getUserByEmail}/${email}`);
      
      return {
        success: true,
        message: 'User retrieved successfully',
        user: response.data
      };
    } catch (error: any) {
      console.error('❌ Error getting user by email:', error);
      
      if (error.response?.status === 404) {
        return {
          success: false,
          message: 'User not found'
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.detail || 'Error retrieving user'
      };
    }
  },

  /**
   * Update user information
   */
  updateUser: async (userId: string, userData: UpdateUserRequest): Promise<UserResponse> => {
    try {
      console.log('🔄 Updating user:', userId, userData);
      
      const response = await api.put<User>(`${SERVICE_URLS.USER_SERVICE}${API_ENDPOINTS.user.updateUser}/${userId}`, userData);
      
      return {
        success: true,
        message: 'User updated successfully',
        user: response.data
      };
    } catch (error: any) {
      console.error('❌ Error updating user:', error);
      
      return {
        success: false,
        message: error.response?.data?.detail || 'Error updating user'
      };
    }
  },

  /**
   * Validate user credentials (for authentication)
   */
  validateCredentials: async (credentials: AuthValidationRequest): Promise<AuthValidationResponse> => {
    try {
      console.log('🔐 Validating user credentials:', credentials.email);
      
      const response = await api.post<{ valid: boolean; user?: User; message?: string }>(
        `${SERVICE_URLS.USER_SERVICE}${API_ENDPOINTS.user.validateCredentials}`,
        {
          email: credentials.email,
          password: credentials.password
        }
      );
      
      return {
        valid: response.data.valid,
        user: response.data.user,
        message: response.data.message || (response.data.valid ? 'Credentials valid' : 'Invalid credentials')
      };
    } catch (error: any) {
      console.error('❌ Error validating credentials:', error);
      
      return {
        valid: false,
        message: error.response?.data?.detail || 'Error validating credentials'
      };
    }
  },

  /**
   * Get all users (admin function)
   */
  getAllUsers: async (): Promise<UserResponse> => {
    try {
      console.log('📋 Getting all users');
      
      const response = await api.get<any[]>(`${SERVICE_URLS.USER_SERVICE}${API_ENDPOINTS.user.getAllUsers}`);
      
      // Convert customer data to User format
      const users: User[] = response.data.map((customer: any) => ({
        id: customer.document || customer.id || Math.random().toString(),
        email: customer.email || '',
        username: customer.email?.split('@')[0] || 'unknown',
        first_name: customer.firstname || '',
        last_name: customer.lastname || '',
        is_active: true,
        created_at: customer.created_at || new Date().toISOString(),
        updated_at: customer.updated_at || new Date().toISOString()
      }));
      
      return {
        success: true,
        message: 'Users retrieved successfully',
        users: users
      };
    } catch (error: any) {
      console.error('❌ Error getting all users:', error);
      
      return {
        success: false,
        message: error.response?.data?.detail || 'Error retrieving users',
        users: []
      };
    }
  },

  /**
   * Check user service health
   */
  checkHealth: async (): Promise<{ healthy: boolean; message: string }> => {
    try {
      await api.get(`${SERVICE_URLS.USER_SERVICE}${API_ENDPOINTS.user.health}`);
      
      return {
        healthy: true,
        message: 'User service is healthy'
      };
    } catch (error: any) {
      console.error('❌ User service health check failed:', error);
      
      return {
        healthy: false,
        message: 'User service is not available'
      };
    }
  }
};