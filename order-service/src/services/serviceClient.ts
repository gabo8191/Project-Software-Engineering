/**
 * Service Communication Module for Order Service
 * Handles inter-service communication using Consul service discovery
 */
import * as http from 'http';
import * as https from 'https';
import consulService from './consulService';

/**
 * HTTP Client for inter-service communication
 */
class ServiceClient {
  private baseHeaders: Record<string, string>;

  constructor() {
    this.baseHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': 'order-service/1.0'
    };
  }

  /**
   * Make HTTP request to a discovered service using Node.js built-in modules
   */
  private async makeServiceRequest(
    serviceName: string,
    endpoint: string,
    method: string = 'GET',
    body?: any
  ): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        // Discover the service
        const serviceInfo = await consulService.discoverService(serviceName);
        console.log(`📞 Calling ${serviceName} at ${serviceInfo.url}${endpoint}`);

        // Parse URL
        const url = new URL(`${serviceInfo.url}${endpoint}`);
        const isHttps = url.protocol === 'https:';
        const client = isHttps ? https : http;

        // Prepare request data
        let postData = '';
        if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
          postData = JSON.stringify(body);
        }

        // Request options
        const options = {
          hostname: url.hostname,
          port: url.port || (isHttps ? 443 : 80),
          path: url.pathname + url.search,
          method: method.toUpperCase(),
          headers: {
            ...this.baseHeaders,
            'Content-Length': Buffer.byteLength(postData)
          }
        };

        // Make the request
        const req = client.request(options, (res) => {
          let responseBody = '';
          
          res.on('data', (chunk) => {
            responseBody += chunk;
          });

          res.on('end', () => {
            try {
              if (res.statusCode && res.statusCode >= 400) {
                reject(new Error(`HTTP ${res.statusCode}: ${responseBody}`));
                return;
              }

              // Try to parse JSON response
              try {
                const jsonResponse = JSON.parse(responseBody);
                resolve(jsonResponse);
              } catch {
                // If not JSON, return text
                resolve({ response: responseBody });
              }
            } catch (error) {
              reject(error);
            }
          });
        });

        req.on('error', (error) => {
          reject(error);
        });

        // Write request body if present
        if (postData) {
          req.write(postData);
        }

        req.end();

      } catch (error) {
        console.error(`❌ Service call to ${serviceName} failed:`, (error as Error).message);
        reject(error);
      }
    });
  }

  /**
   * Validate user exists before creating order
   */
  async validateUser(userId: string): Promise<{ valid: boolean; user?: any }> {
    try {
      console.log(`🔍 Validating user ${userId} with user-service`);
      
      const userInfo = await this.makeServiceRequest(
        'user-service',
        `/customer/findcustomerbyid?customerid=${userId}`,
        'GET'
      );

      return {
        valid: true,
        user: userInfo
      };

    } catch (error) {
      console.error(`❌ User validation failed for ${userId}:`, (error as Error).message);
      return {
        valid: false
      };
    }
  }

  /**
   * Check if user is authenticated via login service
   */
  async validateAuthToken(token: string): Promise<{ valid: boolean; userId?: string }> {
    try {
      console.log(`🔐 Validating auth token with login-service`);
      
      const authResult = await this.makeServiceRequest(
        'login-service',
        '/auth/validate',
        'POST',
        { token }
      );

      return {
        valid: authResult.valid || false,
        userId: authResult.userId
      };

    } catch (error) {
      console.error(`❌ Auth token validation failed:`, (error as Error).message);
      return {
        valid: false
      };
    }
  }

  /**
   * Notify user service about order creation
   */
  async notifyOrderCreated(userId: string, orderId: string, orderData: any): Promise<void> {
    try {
      console.log(`📢 Notifying user-service about order ${orderId} for user ${userId}`);
      
      await this.makeServiceRequest(
        'user-service',
        '/notifications/order-created',
        'POST',
        {
          userId,
          orderId,
          orderData,
          timestamp: new Date().toISOString()
        }
      );

      console.log(`✅ Order notification sent successfully`);

    } catch (error) {
      // Don't fail the order creation if notification fails
      console.warn(`⚠️ Failed to notify user service about order:`, (error as Error).message);
    }
  }

  /**
   * Get user preferences for order processing
   */
  async getUserPreferences(userId: string): Promise<any> {
    try {
      console.log(`⚙️ Getting user preferences for ${userId}`);
      
      const preferences = await this.makeServiceRequest(
        'user-service',
        `/users/${userId}/preferences`,
        'GET'
      );

      return preferences;

    } catch (error) {
      console.warn(`⚠️ Failed to get user preferences:`, (error as Error).message);
      return {}; // Return empty preferences as fallback
    }
  }

  /**
   * Health check other services
   */
  async checkServiceHealth(serviceName: string): Promise<boolean> {
    try {
      await this.makeServiceRequest(serviceName, '/health', 'GET');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get all available services
   */
  async getAvailableServices(): Promise<string[]> {
    try {
      const services = ['user-service', 'login-service'];
      const availableServices: string[] = [];

      for (const service of services) {
        const isHealthy = await this.checkServiceHealth(service);
        if (isHealthy) {
          availableServices.push(service);
        }
      }

      return availableServices;
    } catch (error) {
      console.error('❌ Failed to check available services:', (error as Error).message);
      return [];
    }
  }
}

// Export singleton instance
const serviceClient = new ServiceClient();
export default serviceClient;