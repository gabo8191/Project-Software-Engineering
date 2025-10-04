import { HealthReq, HealthRes } from '../types/express.types';
import { HealthResponse, DetailedStatusResponse } from '../types/order.types';

/**
 * Health Controller - TypeScript implementation
 * Health check endpoints for monitoring and Docker health checks
 */
class HealthController {
  /**
   * Basic health check
   * GET /health
   */
  async healthCheck(req: HealthReq, res: HealthRes): Promise<void> {
    try {
      console.log('🏥 Health check requested');

      // Import database config dynamically to avoid circular dependencies
      // @ts-ignore - Dynamic import with proper typing
      const { default: database } = await import('../config/database.js');
      
      // Check database connection
      const dbHealth = await database.healthCheck();
      
      const health: HealthResponse = {
        status: dbHealth.status === 'healthy' ? 'healthy' : 'unhealthy',
        service: 'order-service',
        timestamp: new Date().toISOString(),
        database: dbHealth.status,
        uptime: `${Math.floor(process.uptime())}s`,
        version: '2.0.0-TypeScript',
        environment: process.env.NODE_ENV || 'development',
        dependencies: {
          database: dbHealth
        }
      };

      const statusCode = health.status === 'healthy' ? 200 : 503;
      
      res.status(statusCode).json(health);

    } catch (error) {
      console.error('❌ Health check failed:', (error as Error).message);
      
      const errorResponse: HealthResponse = {
        status: 'unhealthy',
        service: 'order-service',
        timestamp: new Date().toISOString(),
        database: 'error',
        uptime: `${Math.floor(process.uptime())}s`,
        error: (error as Error).message,
        dependencies: {
          database: { status: 'error', error: (error as Error).message }
        }
      };
      
      res.status(503).json(errorResponse);
    }
  }

  /**
   * Readiness check - determines if service is ready to accept traffic
   * GET /ready
   */
  async readinessCheck(req: HealthReq, res: HealthRes): Promise<void> {
    try {
      console.log('🚦 Readiness check requested');

      // Import database config dynamically
      // @ts-ignore - Dynamic import with proper typing  
      const { default: database } = await import('../config/database.js');
      
      // Check if database is connected and responsive
      const dbHealth = await database.healthCheck();
      
      if (dbHealth.status !== 'healthy') {
        const notReadyResponse: HealthResponse = {
          status: 'not ready',
          service: 'order-service',
          timestamp: new Date().toISOString(),
          database: dbHealth.status,
          uptime: `${Math.floor(process.uptime())}s`,
          message: 'Database not ready',
          dependencies: {
            database: dbHealth
          }
        };
        
        res.status(503).json(notReadyResponse);
        return;
      }

      const readyResponse: HealthResponse = {
        status: 'ready',
        service: 'order-service',
        timestamp: new Date().toISOString(),
        database: dbHealth.status,
        uptime: `${Math.floor(process.uptime())}s`,
        message: 'Service is ready to accept traffic',
        dependencies: {
          database: dbHealth
        }
      };
      
      res.status(200).json(readyResponse);

    } catch (error) {
      console.error('❌ Readiness check failed:', (error as Error).message);
      
      const errorResponse: HealthResponse = {
        status: 'not ready',
        service: 'order-service',
        timestamp: new Date().toISOString(),
        database: 'error',
        uptime: `${Math.floor(process.uptime())}s`,
        message: 'Service is not ready',
        error: (error as Error).message
      };
      
      res.status(503).json(errorResponse);
    }
  }

  /**
   * Liveness check - determines if service is alive
   * GET /live
   */
  async livenessCheck(req: HealthReq, res: HealthRes): Promise<void> {
    try {
      console.log('💓 Liveness check requested');

      // Simple liveness check - if we can respond, we're alive
      const aliveResponse: HealthResponse = {
        status: 'alive',
        service: 'order-service',
        timestamp: new Date().toISOString(),
        database: 'connected',
        uptime: `${Math.floor(process.uptime())}s`,
        message: 'Service is alive',
        memory: process.memoryUsage(),
        pid: process.pid
      };
      
      res.status(200).json(aliveResponse);

    } catch (error) {
      console.error('❌ Liveness check failed:', (error as Error).message);
      
      const deadResponse: HealthResponse = {
        status: 'dead',
        service: 'order-service',
        timestamp: new Date().toISOString(),
        database: 'error',
        uptime: `${Math.floor(process.uptime())}s`,
        error: (error as Error).message
      };
      
      res.status(500).json(deadResponse);
    }
  }

  /**
   * Detailed status endpoint
   * GET /status
   */
  async detailedStatus(req: HealthReq, res: HealthRes): Promise<void> {
    try {
      console.log('📊 Detailed status requested');

      // Import database config dynamically
      // @ts-ignore - Dynamic import with proper typing  
      const { default: database } = await import('../config/database.js');
      const dbHealth = await database.healthCheck();
      
      const status: DetailedStatusResponse = {
        service: {
          name: 'order-service',
          version: '1.0.0',
          description: 'Order Management Microservice - TypeScript',
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
      console.error('❌ Detailed status failed:', (error as Error).message);
      
      res.status(500).json({
        service: {
          name: 'order-service',
          status: 'error',
          error: (error as Error).message,
          timestamp: new Date().toISOString()
        }
      } as any);
    }
  }

  /**
   * Simple ping endpoint
   * GET /ping
   */
  ping(req: HealthReq, res: HealthRes): void {
    const pingResponse: HealthResponse = {
      status: 'alive',
      service: 'order-service',
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime: `${Math.floor(process.uptime())}s`,
      message: 'pong'
    };
    
    res.status(200).json(pingResponse);
  }
}

export default new HealthController();