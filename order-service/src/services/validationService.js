const Joi = require('joi');

/**
 * Validation schemas and service for Order endpoints
 */
class ValidationService {
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
          .valid('Received', 'In progress', 'Sended')
          .default('Received')
          .messages({
            'any.only': 'Status must be one of: Received, In progress, Sended'
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
          .valid('Received', 'In progress', 'Sended')
          .required()
          .messages({
            'string.empty': 'Status is required',
            'any.only': 'Status must be one of: Received, In progress, Sended',
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
  validateCreateOrder(data) {
    return this.validate(data, this.schemas.createOrder);
  }

  /**
   * Validate update order status request
   */
  validateUpdateOrderStatus(data) {
    return this.validate(data, this.schemas.updateOrderStatus);
  }

  /**
   * Validate find orders by customer ID request
   */
  validateFindOrdersByCustomerID(data) {
    return this.validate(data, this.schemas.findOrdersByCustomerID);
  }

  /**
   * Validate pagination parameters
   */
  validatePagination(data) {
    return this.validate(data, this.schemas.pagination);
  }

  /**
   * Generic validation method
   */
  validate(data, schema) {
    const { error, value } = schema.validate(data, {
      abortEarly: false, // Return all validation errors, not just the first one
      stripUnknown: true, // Remove unknown properties
      convert: true // Convert values to the correct type when possible
    });

    if (error) {
      const validationErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

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
  validateMiddleware(schemaName) {
    return (req, res, next) => {
      const schema = this.schemas[schemaName];
      
      if (!schema) {
        return res.status(500).json({
          success: false,
          message: 'Invalid validation schema',
          error: `Schema '${schemaName}' not found`
        });
      }

      // Determine data source based on HTTP method
      let dataToValidate = {};
      
      if (req.method === 'GET') {
        dataToValidate = { ...req.query, ...req.params };
      } else {
        dataToValidate = { ...req.body, ...req.params };
      }

      const validation = this.validate(dataToValidate, schema);
      
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      // Attach validated data to request
      req.validatedData = validation.data;
      next();
    };
  }

  /**
   * Validate customer ID format
   */
  isValidCustomerID(customerID) {
    return typeof customerID === 'string' && 
           customerID.trim().length > 0 && 
           customerID.length <= 50;
  }

  /**
   * Validate order ID format
   */
  isValidOrderID(orderID) {
    return typeof orderID === 'string' && 
           orderID.trim().length > 0 && 
           orderID.length <= 100;
  }

  /**
   * Validate status value
   */
  isValidStatus(status) {
    const validStatuses = ['Received', 'In progress', 'Sended'];
    return validStatuses.includes(status);
  }

  /**
   * Sanitize string input
   */
  sanitizeString(input) {
    if (typeof input !== 'string') {
      return input;
    }
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .substring(0, 255); // Limit length
  }

  /**
   * Generate validation error response
   */
  generateErrorResponse(errors, message = 'Validation failed') {
    return {
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new ValidationService();