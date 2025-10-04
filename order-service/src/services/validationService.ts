import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { OrderStatus, ValidationResult } from '../types/order.types';

/**
 * Validation Service - TypeScript implementation with strong typing
 * Provides schema validation for Order endpoints using Joi
 */
class ValidationService {
  private schemas: Record<string, Joi.ObjectSchema>;

  constructor() {
    // Define validation schemas
    this.schemas = {
      createOrder: Joi.object({
        customerID: Joi.string()
          .trim()
          .max(50)
          .required()
          .messages({
            'string.empty': 'Customer ID is required',
            'string.max': 'Customer ID cannot exceed 50 characters',
            'any.required': 'Customer ID is required'
          }),
        
        orderID: Joi.string()
          .trim()
          .max(100)
          .optional()
          .messages({
            'string.max': 'Order ID cannot exceed 100 characters'
          }),
        
        status: Joi.string()
          .valid(...Object.values(OrderStatus))
          .default(OrderStatus.RECEIVED)
          .messages({
            'any.only': `Status must be one of: ${Object.values(OrderStatus).join(', ')}`
          })
      }),

      updateOrderStatus: Joi.object({
        orderID: Joi.string()
          .trim()
          .max(100)
          .required()
          .messages({
            'string.empty': 'Order ID is required',
            'string.max': 'Order ID cannot exceed 100 characters',
            'any.required': 'Order ID is required'
          }),
        
        status: Joi.string()
          .valid(...Object.values(OrderStatus))
          .required()
          .messages({
            'string.empty': 'Status is required',
            'any.only': `Status must be one of: ${Object.values(OrderStatus).join(', ')}`,
            'any.required': 'Status is required'
          })
      }),

      findOrdersByCustomerID: Joi.object({
        customerID: Joi.string()
          .trim()
          .max(50)
          .required()
          .messages({
            'string.empty': 'Customer ID is required',
            'string.max': 'Customer ID cannot exceed 50 characters',
            'any.required': 'Customer ID is required'
          })
      }),

      pagination: Joi.object({
        page: Joi.number()
          .integer()
          .min(1)
          .default(1)
          .messages({
            'number.min': 'Page must be at least 1',
            'number.integer': 'Page must be an integer'
          }),
        
        limit: Joi.number()
          .integer()
          .min(1)
          .max(100)
          .default(10)
          .messages({
            'number.min': 'Limit must be at least 1',
            'number.max': 'Limit cannot exceed 100',
            'number.integer': 'Limit must be an integer'
          })
      })
    };
  }

  /**
   * Validate create order request
   */
  validateCreateOrder(data: any): ValidationResult & { data?: any } {
    const schema = this.schemas.createOrder;
    if (!schema) throw new Error('Schema not found');
    return this.validate(data, schema);
  }

  /**
   * Validate update order status request
   */
  validateUpdateOrderStatus(data: any): ValidationResult & { data?: any } {
    const schema = this.schemas.updateOrderStatus;
    if (!schema) throw new Error('Schema not found');
    return this.validate(data, schema);
  }

  /**
   * Validate find orders by customer ID request
   */
  validateFindOrdersByCustomerID(data: any): ValidationResult & { data?: any } {
    const schema = this.schemas.findOrdersByCustomerID;
    if (!schema) throw new Error('Schema not found');
    return this.validate(data, schema);
  }

  /**
   * Validate pagination parameters
   */
  validatePagination(data: any): ValidationResult & { data?: any } {
    const schema = this.schemas.pagination;
    if (!schema) throw new Error('Schema not found');
    return this.validate(data, schema);
  }

  /**
   * Generic validation method
   */
  private validate(data: any, schema: Joi.ObjectSchema): ValidationResult & { data?: any } {
    const { error, value } = schema.validate(data, {
      abortEarly: false, // Return all validation errors, not just the first one
      stripUnknown: true, // Remove unknown properties
      convert: true // Convert values to the correct type when possible
    });

    if (error) {
      const validationErrors = error.details.map(detail => 
        `${detail.path.join('.')}: ${detail.message}`
      );

      return {
        isValid: false,
        errors: validationErrors,
        data: null
      };
    }

    return {
      isValid: true,
      errors: [],
      data: value
    };
  }

  /**
   * Middleware for Express route validation
   */
  validateMiddleware(schemaName: string) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const schema = this.schemas[schemaName];
      
      if (!schema) {
        res.status(500).json({
          success: false,
          message: 'Invalid validation schema',
          error: `Schema '${schemaName}' not found`
        });
        return;
      }

      // Determine data source based on HTTP method
      let dataToValidate: any = {};
      
      if (req.method === 'GET') {
        dataToValidate = { ...req.query, ...req.params };
      } else {
        dataToValidate = { ...req.body, ...req.params };
      }

      const validation = this.validate(dataToValidate, schema);
      
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
        return;
      }

      // Attach validated data to request
      (req as any).validatedData = validation.data;
      next();
    };
  }

  /**
   * Validate customer ID format
   */
  isValidCustomerID(customerID: unknown): customerID is string {
    return typeof customerID === 'string' && 
           customerID.trim().length > 0 && 
           customerID.length <= 50;
  }

  /**
   * Validate order ID format
   */
  isValidOrderID(orderID: unknown): orderID is string {
    return typeof orderID === 'string' && 
           orderID.trim().length > 0 && 
           orderID.length <= 100;
  }

  /**
   * Validate status value
   */
  isValidStatus(status: unknown): status is OrderStatus {
    return Object.values(OrderStatus).includes(status as OrderStatus);
  }

  /**
   * Sanitize string input
   */
  sanitizeString(input: unknown): string {
    if (typeof input !== 'string') {
      return String(input || '');
    }
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .substring(0, 255); // Limit length
  }

  /**
   * Generate validation error response
   */
  generateErrorResponse(errors: string[], message = 'Validation failed'): {
    success: false;
    message: string;
    errors: string[];
    timestamp: string;
  } {
    return {
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString()
    };
  }
}

export default new ValidationService();