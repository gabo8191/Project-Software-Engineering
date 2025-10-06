import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_BASE_URL } from '../config/api';

// Create an axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem('order_management_token');
    
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear authentication data
      localStorage.removeItem('order_management_token');
      localStorage.removeItem('order_management_user');
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
      
      return Promise.reject(error);
    }
    
    // Handle 403 Forbidden errors
    if (error.response?.status === 403) {
      console.error('Acceso denegado - No tienes autorización para esta acción');
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Error de red - por favor revise su conexión a internet');
    }
    
    // Handle 500 Internal Server Error
    if (error.response?.status === 500) {
      console.error('Error interno del servidor - intente nuevamente más tarde');
    }
    
    return Promise.reject(error);
  }
);

export default api;