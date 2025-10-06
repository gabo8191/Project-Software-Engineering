// Auth Types
export interface User {
  id: string;
  username: string;
  email?: string;
  token?: string;
}

export interface LoginCredentials {
  username: string;
  email: string;
  password: string;
}

export interface AuthUserCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user_id?: string;
  userCreated?: boolean;
  token?: string;
  user?: {
    id: string;
    username: string;
    email: string;
    created_at: string;
    updated_at: string;
  };
}

// Customer Types
export interface Customer {
  id: string;
  document?: string;
  firstName: string;
  lastName: string;
  firstname?: string;  // For backend compatibility
  lastname?: string;   // For backend compatibility
  address: string;
  phone: string;
  email: string;
  createdAt?: string;
}

export interface CreateCustomerRequest {
  document?: string;
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  email: string;
}

export interface CustomerResponse {
  success: boolean;
  message: string;
  customer?: Customer;
}

// Order Types
export interface Order {
  _id: string;
  customerId: string;
  customerID?: string;  // For backend compatibility
  orderID?: string;     // For backend compatibility
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'Received' | 'In progress' | 'Sended';
  orderDate: string;
  createdAt?: string;
  updatedAt?: string;
  customer?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateOrderRequest {
  customerId: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'Received' | 'In progress' | 'Sended';
}

export interface UpdateOrderStatusRequest {
  orderID: string;
  status: 'Received' | 'In progress' | 'Sended';
}

export interface OrderResponse {
  orderCreated?: boolean;
  orderStatusUpdated?: boolean;
  success?: boolean;
  message?: string;
  order?: Order;
  user_info?: {
    email: string;
    first_name: string;
    last_name: string;
  };
}