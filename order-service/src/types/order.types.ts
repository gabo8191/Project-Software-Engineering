/**
 * Order Domain Types
 * TypeScript interfaces for the Order Service domain
 */

export enum OrderStatus {
  RECEIVED = 'Received',
  IN_PROGRESS = 'In progress', 
  SENDED = 'Sended'
}

export interface IOrder {
  customerID: string;
  orderID: string;
  status: OrderStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateOrderRequest {
  customerID: string;
  orderID?: string;
  status?: OrderStatus;
}

export interface UpdateOrderRequest {
  orderID: string;
  status: OrderStatus;
}

export interface OrderResponse {
  success: boolean;
  message?: string;
  data?: IOrder | IOrder[] | any;
  orderCreated?: boolean;
  orderUpdated?: boolean;
  orderDeleted?: boolean;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface HealthResponse {
  status: string;
  service: string | any;
  timestamp: string;
  database: string;
  uptime: string;
  [key: string]: any; // Allow additional properties for detailed status
}