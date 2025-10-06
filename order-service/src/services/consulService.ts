import * as http from 'http';

/**
 * Simple Consul Service for Order Management
 */
class ConsulService {
  private consulHost: string;
  private consulPort: string;
  private serviceId: string;
  private serviceName: string;
  private servicePort: number;
  private serviceHost: string;

  constructor() {
    this.consulHost = process.env.CONSUL_HOST || 'consul';
    this.consulPort = process.env.CONSUL_PORT || '8500';
    this.serviceName = process.env.SERVICE_NAME || 'order-service';
    this.servicePort = parseInt(process.env.SERVICE_PORT || '3000');
    this.serviceHost = process.env.SERVICE_HOST || 'order-service';
    this.serviceId = `${this.serviceName}-${Date.now()}`;
    
    console.log('🔍 Consul service initialized for order-service');
  }

  /**
   * Make HTTP request to Consul API
   */
  private makeHttpRequest(method: string, path: string, data?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.consulHost,
        port: parseInt(this.consulPort),
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });

        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const result = body ? JSON.parse(body) : null;
              resolve(result);
            } catch (e) {
              resolve(body);
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${body}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  /**
   * Wait for Consul to be available
   */
  async waitForConsul(maxRetries: number = 10, delaySeconds: number = 2): Promise<void> {
    console.log(`⏳ Waiting for Consul to be available (${maxRetries} retries)...`);
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        await this.makeHttpRequest('GET', '/v1/status/leader');
        console.log('✅ Consul is available');
        return;
      } catch (error) {
        console.log(`⏳ Consul not ready, attempt ${i + 1}/${maxRetries}`);
        if (i === maxRetries - 1) {
          throw new Error('Consul not available after maximum retries');
        }
        await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
      }
    }
  }

  /**
   * Register this service with Consul
   */
  async registerService(): Promise<void> {
    try {
      const registration = {
        ID: this.serviceId,
        Name: this.serviceName,
        Tags: ['order', 'api', 'microservice'],
        Address: this.serviceHost,
        Port: this.servicePort,
        Check: {
          HTTP: `http://${this.serviceHost}:${this.servicePort}/health`,
          Interval: '30s',
          Timeout: '10s'
        }
      };

      await this.makeHttpRequest('PUT', '/v1/agent/service/register', registration);
      
      console.log(`✅ Service registered with Consul: ${this.serviceName} (${this.serviceId})`);
    } catch (error) {
      console.error('❌ Failed to register service with Consul:', (error as Error).message);
      throw error;
    }
  }

  /**
   * Deregister this service from Consul
   */
  async deregisterService(): Promise<void> {
    try {
      await this.makeHttpRequest('PUT', `/v1/agent/service/deregister/${this.serviceId}`);
      console.log(`✅ Service deregistered from Consul: ${this.serviceId}`);
    } catch (error) {
      console.error('❌ Failed to deregister service from Consul:', (error as Error).message);
    }
  }

  /**
   * Discover a service by name
   */
  async discoverService(serviceName: string): Promise<{ name: string; address: string; port: number; url: string }> {
    try {
      const response = await this.makeHttpRequest('GET', `/v1/health/service/${serviceName}?passing=true`);

      if (!response || response.length === 0) {
        throw new Error(`Service ${serviceName} not found in Consul`);
      }

      // Return the first healthy service
      const service = response[0].Service;
      return {
        name: service.Service,
        address: service.Address,
        port: service.Port,
        url: `http://${service.Address}:${service.Port}`
      };
    } catch (error) {
      console.error(`❌ Failed to discover service ${serviceName}:`, (error as Error).message);
      throw error;
    }
  }

  /**
   * Setup graceful shutdown
   */
  setupGracefulShutdown(): void {
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n🔄 Received ${signal}, starting graceful shutdown...`);
      await this.deregisterService();
      process.exit(0);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  }
}

// Export singleton instance
const consulService = new ConsulService();
export default consulService;