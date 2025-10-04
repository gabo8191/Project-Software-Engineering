/**
 * Express.js TypeScript Extensions
 * Custom type definitions for Express Request and Response objects
 */

import { Request, Response } from 'express';
import { 
  CreateOrderRequest, 
  UpdateOrderRequest, 
  OrderResponse, 
  HealthResponse,
  DetailedStatusResponse
} from './order.types';

// Extend Express Request types for our specific endpoints
export interface TypedRequest<T = any> extends Request {
  body: T;
}

export interface TypedResponse<T = any> extends Response {
  json: (body: T) => this;
}

// Specific request/response types for each endpoint
export type CreateOrderReq = TypedRequest<CreateOrderRequest>;
export type CreateOrderRes = TypedResponse<OrderResponse>;

export type UpdateOrderReq = TypedRequest<UpdateOrderRequest>;
export type UpdateOrderRes = TypedResponse<OrderResponse>;

export type GetOrderReq = Request<{ orderID?: string; customerID?: string }>;
export type GetOrderRes = TypedResponse<OrderResponse>;

export type GetAllOrdersReq = Request;
export type GetAllOrdersRes = TypedResponse<OrderResponse>;

export type DeleteOrderReq = Request<{ orderID: string }>;
export type DeleteOrderRes = TypedResponse<OrderResponse>;

export type HealthReq = Request;
export type HealthRes = TypedResponse<HealthResponse | DetailedStatusResponse>;

// Generic error response type
export interface ErrorResponse {
  success: false;
  message: string;
  errors?: string[];
  stack?: string;
}