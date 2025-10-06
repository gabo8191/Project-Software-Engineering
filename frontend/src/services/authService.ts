import api from '../utils/axiosConfig';
import { API_ENDPOINTS, SERVICE_URLS } from '../config/api';
import { 
  LoginCredentials, 
  AuthUserCredentials, 
  AuthResponse 
} from '../types';

export const authService = {
  createUser: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      console.log('🔐 Creating user in login-service:', credentials.username);
      
      const response = await api.post<AuthResponse>(`${SERVICE_URLS.LOGIN_SERVICE}${API_ENDPOINTS.login.createUser}`, {
        username: credentials.username,
        email: credentials.email,
        password: credentials.password
      });
      
      if (response.data.success && response.data.user_id) {
        // Store the user info in localStorage
        const user = {
          id: response.data.user_id,
          username: credentials.username,
          email: credentials.email
        };
        localStorage.setItem('order_management_user', JSON.stringify(user));
        console.log('✅ User created successfully in login-service');
        return response.data;
      }
      
      throw new Error(response.data.message || 'Error creating user');
    } catch (error: any) {
      console.error('❌ Error creating user in login-service:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error creating user');
    }
  },

  authUser: async (credentials: AuthUserCredentials): Promise<AuthResponse> => {
    try {
      console.log('🔐 Authenticating user in login-service:', credentials.username);
      
      const response = await api.post<AuthResponse>(`${SERVICE_URLS.LOGIN_SERVICE}${API_ENDPOINTS.login.authUser}`, {
        username: credentials.username,
        password: credentials.password
      });
      
      if (response.data.success) {
        // Store the user info in localStorage
        const user = {
          id: response.data.user?.id || credentials.username,
          username: credentials.username,
          email: response.data.user?.email || '',
          token: response.data.token
        };
        localStorage.setItem('order_management_user', JSON.stringify(user));
        console.log('✅ User authenticated successfully in login-service');
        return response.data;
      }
      
      throw new Error(response.data.message || 'Invalid credentials');
    } catch (error: any) {
      console.error('❌ Authentication failed in login-service:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Authentication failed');
    }
  },
  
  logout: (): void => {
    console.log('🔐 Logging out user');
    localStorage.removeItem('order_management_token');
    localStorage.removeItem('order_management_user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('order_management_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('order_management_user');
  },

  // Health check method to verify login service is available
  checkHealth: async (): Promise<boolean> => {
    try {
      const response = await api.get(`${SERVICE_URLS.LOGIN_SERVICE}/health`);
      return response.status === 200;
    } catch (error) {
      console.error('❌ Login service health check failed:', error);
      return false;
    }
  }
};