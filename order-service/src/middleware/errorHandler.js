/**
 * Error handling middleware for Express application
 * Provides centralized error handling and logging
 */
class ErrorHandler {
  /**
   * Express error handling middleware
   * @param {Error} err - Error object
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {Function} next - Express next function
   */
  static handle(err, req, res, next) {
    console.error('❌ Error caught by error handler:');
    console.error('📍 Route:', req.method, req.originalUrl);
    console.error('🕐 Timestamp:', new Date().toISOString());
    console.error('💥 Error:', err);

    // Default error values
    let statusCode = err.statusCode || err.status || 500;
    let message = err.message || 'Internal Server Error';
    let errorCode = err.code || 'INTERNAL_ERROR';

    // Handle specific error types
    switch (err.name) {
      case 'ValidationError':
        statusCode = 400;
        message = ErrorHandler.formatValidationError(err);
        errorCode = 'VALIDATION_ERROR';
        break;

      case 'CastError':
        statusCode = 400;
        message = 'Invalid data format';
        errorCode = 'INVALID_FORMAT';
        break;

      case 'MongoError':
        statusCode = ErrorHandler.handleMongoError(err);
        message = ErrorHandler.formatMongoError(err);
        errorCode = 'DATABASE_ERROR';
        break;

      case 'JsonWebTokenError':
        statusCode = 401;
        message = 'Invalid token';
        errorCode = 'INVALID_TOKEN';
        break;

      case 'TokenExpiredError':
        statusCode = 401;
        message = 'Token expired';
        errorCode = 'TOKEN_EXPIRED';
        break;

      case 'SyntaxError':
        if (err.type === 'entity.parse.failed') {
          statusCode = 400;
          message = 'Invalid JSON format';
          errorCode = 'INVALID_JSON';
        }
        break;

      default:
        // Handle custom application errors
        if (err.isOperational) {
          statusCode = err.statusCode || 400;
          message = err.message;
          errorCode = err.code || 'OPERATIONAL_ERROR';
        }
    }

    // Create error response
    const errorResponse = {
      success: false,
      message,
      errorCode,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method
    };

    // Add stack trace in development
    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = err.stack;
      errorResponse.details = err;
    }

    // Add request ID if available
    if (req.id) {
      errorResponse.requestId = req.id;
    }

    res.status(statusCode).json(errorResponse);
  }

  /**
   * Handle MongoDB specific errors
   * @param {Error} err - MongoDB error
   * @returns {number} HTTP status code
   */
  static handleMongoError(err) {
    switch (err.code) {
      case 11000:
      case 11001:
        return 409; // Conflict - duplicate key
      case 12582:
        return 413; // Payload too large
      case 13297:
        return 400; // Invalid aggregation pipeline
      default:
        return 500;
    }
  }

  /**
   * Format MongoDB error messages
   * @param {Error} err - MongoDB error
   * @returns {string} Formatted error message
   */
  static formatMongoError(err) {
    switch (err.code) {
      case 11000:
      case 11001:
        const field = ErrorHandler.extractDuplicateField(err.message);
        return `Duplicate value for ${field}. This value already exists.`;
      case 12582:
        return 'Request payload too large';
      case 13297:
        return 'Invalid query or aggregation pipeline';
      default:
        return 'Database operation failed';
    }
  }

  /**
   * Format validation error messages
   * @param {Error} err - Validation error
   * @returns {string} Formatted error message
   */
  static formatValidationError(err) {
    const errors = Object.values(err.errors).map(error => error.message);
    return `Validation failed: ${errors.join(', ')}`;
  }

  /**
   * Extract duplicate field from MongoDB error message
   * @param {string} message - Error message
   * @returns {string} Field name
   */
  static extractDuplicateField(message) {
    const match = message.match(/index: (.+?)_/);
    return match ? match[1] : 'field';
  }

  /**
   * 404 Not Found handler
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {Function} next - Express next function
   */
  static notFound(req, res, next) {
    const error = new Error(`Route ${req.originalUrl} not found`);
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    next(error);
  }

  /**
   * Async error wrapper - catches async errors and passes to error handler
   * @param {Function} fn - Async function to wrap
   * @returns {Function} Wrapped function
   */
  static asyncWrapper(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Create custom application error
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {string} code - Error code
   * @returns {Error} Custom error
   */
  static createError(message, statusCode = 500, code = 'APPLICATION_ERROR') {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.code = code;
    error.isOperational = true;
    return error;
  }
}

module.exports = ErrorHandler;