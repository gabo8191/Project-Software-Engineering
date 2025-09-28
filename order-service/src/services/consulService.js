const consul = require('consul');
const config = require('../config/environment');

/**
 * Consul Service Discovery integration
 * Handles service registration and health checks with Consul
 */
class ConsulService {
  constructor() {
    this.consul = consul({
      host: config.consul.host,
      port: config.consul.port,
      secure: false
    });
    
    this.serviceId = `${config.consul.serviceName}-${Date.now()}`;
    this.isRegistered = false;
    
    console.log('🔍 Consul service initialized');
    console.log(`📍 Consul address: ${config.consul.host}:${config.consul.port}`);
    console.log(`🏷️  Service ID: ${this.serviceId}`);
  }

  /**
   * Wait for Consul to be available
   * @param {number} maxRetries - Maximum number of retry attempts
   * @param {number} retryInterval - Interval between retries in seconds
   * @returns {Promise<void>}
   */
  async waitForConsul(maxRetries = 10, retryInterval = 2) {
    console.log(`🔄 Waiting for Consul to be available...`);
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        const leader = await this.consul.status.leader();
        console.log(`✅ Consul is available (leader: ${leader})`);
        return;
      } catch (error) {
        console.log(`⏳ Consul not available, retry ${i + 1}/${maxRetries} (${error.message})`);
        
        if (i === maxRetries - 1) {
          throw new Error(`Consul not available after ${maxRetries} retries`);
        }
        
        await this.sleep(retryInterval * 1000);
      }
    }
  }

  /**
   * Register service with Consul
   * @returns {Promise<void>}
   */
  async registerService() {
    try {
      console.log('📝 Registering service with Consul...');

      const registration = {
        id: this.serviceId,
        name: config.consul.serviceName,
        address: config.consul.serviceHost,
        port: config.consul.servicePort,
        tags: config.consul.tags,
        meta: {
          version: '1.0.0',
          framework: 'express',
          database: 'mongodb',
          language: 'nodejs'
        },
        check: {
          http: `http://${config.consul.serviceHost}:${config.consul.servicePort}${config.consul.healthCheckPath}`,
          interval: '10s',
          timeout: '5s',
          deregistercriticalserviceafter: '30s'
        }
      };

      await this.consul.agent.service.register(registration);
      this.isRegistered = true;
      
      console.log('✅ Service registered successfully with Consul');
      console.log(`📋 Service details:`, {
        id: this.serviceId,
        name: config.consul.serviceName,
        address: `${config.consul.serviceHost}:${config.consul.servicePort}`,
        healthCheck: `http://${config.consul.serviceHost}:${config.consul.servicePort}${config.consul.healthCheckPath}`
      });

    } catch (error) {
      console.error('❌ Failed to register service with Consul:', error.message);
      throw error;
    }
  }

  /**
   * Deregister service from Consul
   * @returns {Promise<void>}
   */
  async deregisterService() {
    try {
      if (!this.isRegistered) {
        console.log('⚠️  Service not registered, skipping deregistration');
        return;
      }

      console.log('📤 Deregistering service from Consul...');
      
      await this.consul.agent.service.deregister(this.serviceId);
      this.isRegistered = false;
      
      console.log('✅ Service deregistered successfully from Consul');

    } catch (error) {
      console.error('❌ Failed to deregister service from Consul:', error.message);
      throw error;
    }
  }

  /**
   * Get service health from Consul
   * @param {string} serviceName - Service name to check
   * @returns {Promise<Array>} Service health information
   */
  async getServiceHealth(serviceName) {
    try {
      const services = await this.consul.health.service({
        service: serviceName,
        passing: true
      });

      return services.map(service => ({
        id: service.Service.ID,
        address: service.Service.Address,
        port: service.Service.Port,
        tags: service.Service.Tags,
        status: service.Checks.map(check => ({
          checkId: check.CheckID,
          status: check.Status,
          output: check.Output
        }))
      }));

    } catch (error) {
      console.error(`❌ Failed to get service health for ${serviceName}:`, error.message);
      throw error;
    }
  }

  /**
   * Discover services by name
   * @param {string} serviceName - Service name to discover
   * @returns {Promise<Array>} Available service instances
   */
  async discoverService(serviceName) {
    try {
      const services = await this.consul.catalog.service.nodes({
        service: serviceName
      });

      return services.map(service => ({
        id: service.ServiceID,
        address: service.ServiceAddress || service.Address,
        port: service.ServicePort,
        tags: service.ServiceTags,
        meta: service.ServiceMeta
      }));

    } catch (error) {
      console.error(`❌ Failed to discover service ${serviceName}:`, error.message);
      throw error;
    }
  }

  /**
   * Setup graceful shutdown
   * Ensures service is properly deregistered on application termination
   */
  setupGracefulShutdown() {
    const shutdown = async (signal) => {
      console.log(`📤 Received ${signal}, starting graceful shutdown...`);
      
      try {
        await this.deregisterService();
        console.log('👋 Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during graceful shutdown:', error.message);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGUSR2', () => shutdown('SIGUSR2')); // nodemon restart
  }

  /**
   * Utility method to sleep
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if service is registered
   * @returns {boolean} Registration status
   */
  isServiceRegistered() {
    return this.isRegistered;
  }

  /**
   * Get service ID
   * @returns {string} Service ID
   */
  getServiceId() {
    return this.serviceId;
  }
}

// Export singleton instance
module.exports = new ConsulService();