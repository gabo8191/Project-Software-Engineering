export interface Order {
  customerid: string;
  orderID: string;
  status: 'Received' | 'In progress' | 'Sended';
}

export interface CreateOrderRequest {
  customerid: string;
  orderID: string;
  status: string;
}

export interface CreateOrderResponse {
  orderCreated: boolean;
}

export interface UpdateOrderStatusRequest {
  orderID: string;
  status: string;
}

export interface UpdateOrderStatusResponse {
  orderStatusUpdated: boolean;
}

export interface FindOrdersByCustomerRequest {
  customerid: string;
}

export interface FindOrdersByCustomerResponse {
  orders: Order[];
}