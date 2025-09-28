const database = require('../config/database');

/**
 * Health Controller - Health check endpoints for monitoring and Docker health checks
 */
class HealthController {
  /**
   * Basic health check
   * GET /health
   */
  async healthCheck(req, res) {
    try {
      console.log('🏥 Health check requested');

      // Check database connection
      const dbHealth = await database.healthCheck();
      
      const health = {
        status: dbHealth.status === 'healthy' ? 'healthy' : 'unhealthy',
        service: 'order-service',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        dependencies: {
          database: dbHealth
        }
      };

      const statusCode = health.status === 'healthy' ? 200 : 503;
      
      res.status(statusCode).json(health);

    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      
      res.status(503).json({
        status: 'unhealthy',
        service: 'order-service',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        error: error.message,
        dependencies: {
          database: { status: 'error', error: error.message }
        }
      });
    }
  }

  /**
   * Readiness check - determines if service is ready to accept traffic
   * GET /ready
   */
  async readinessCheck(req, res) {
    try {
      console.log('🚦 Readiness check requested');

      // Check if database is connected and responsive
      const dbHealth = await database.healthCheck();
      
      if (dbHealth.status !== 'healthy') {
        return res.status(503).json({
          status: 'not ready',
          service: 'order-service',
          message: 'Database not ready',
          timestamp: new Date().toISOString(),
          dependencies: {
            database: dbHealth
          }
        });
      }

      res.status(200).json({
        status: 'ready',
        service: 'order-service',
        message: 'Service is ready to accept traffic',
        timestamp: new Date().toISOString(),
        dependencies: {
          database: dbHealth
        }
      });

    } catch (error) {
      console.error('❌ Readiness check failed:', error.message);
      
      res.status(503).json({
        status: 'not ready',
        service: 'order-service',
        message: 'Service is not ready',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Liveness check - determines if service is alive
   * GET /live
   */
  async livenessCheck(req, res) {
    try {
      console.log('💓 Liveness check requested');

      // Simple liveness check - if we can respond, we're alive
      res.status(200).json({
        status: 'alive',
        service: 'order-service',
        message: 'Service is alive',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        pid: process.pid
      });

    } catch (error) {
      console.error('❌ Liveness check failed:', error.message);
      
      // If we can't even respond to a liveness check, something is very wrong
      res.status(500).json({
        status: 'dead',
        service: 'order-service',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Detailed status endpoint
   * GET /status
   */
  async detailedStatus(req, res) {
    try {
      console.log('📊 Detailed status requested');

      const dbHealth = await database.healthCheck();
      
      const status = {
        service: {
          name: 'order-service',
          version: '1.0.0',
          description: 'Order Management Microservice',
          status: 'running',
          uptime: process.uptime(),
          timestamp: new Date().toISOString()
        },
        system: {
          node_version: process.version,
          platform: process.platform,
          architecture: process.arch,
          memory: process.memoryUsage(),
          cpu: process.cpuUsage(),
          pid: process.pid
        },
        dependencies: {
          database: dbHealth
        },
        environment: {
          node_env: process.env.NODE_ENV || 'development',
          port: process.env.PORT || 3000,
          consul_host: process.env.CONSUL_HOST || 'consul',
          mongodb_uri: process.env.MONGODB_URI ? '***configured***' : 'not configured'
        }
      };

      res.status(200).json(status);

    } catch (error) {
      console.error('❌ Detailed status failed:', error.message);
      
      res.status(500).json({
        service: {
          name: 'order-service',
          status: 'error',
          error: error.message,
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Simple ping endpoint
   * GET /ping
   */
  ping(req, res) {
    res.status(200).json({
      message: 'pong',
      timestamp: new Date().toISOString(),
      service: 'order-service'
    });
  }
}

module.exports = new HealthController();