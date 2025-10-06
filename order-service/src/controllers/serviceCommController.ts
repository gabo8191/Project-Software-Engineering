import { Request, Response } from 'express';
import serviceClient from '../services/serviceClient';

/**
 * Service Communication Controller 
 * Test endpoints for inter-service communication
 */
class ServiceCommController {
  /**
   * Test user service connection
   * GET /test/user-service/:userId
   */
  async testUserService(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      console.log(`🔍 Testing user service connection for user: ${userId}`);
      
      const userValidation = await serviceClient.validateUser(userId);
      
      res.json({
        success: true,
        service: 'user-service',
        user_validation: userValidation,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ User service test failed:', (error as Error).message);
      res.status(500).json({
        success: false,
        service: 'user-service',
        error: (error as Error).message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Test login service connection
   * POST /test/login-service
   */
  async testLoginService(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;
      
      if (!token) {
        res.status(400).json({
          success: false,
          message: 'Token is required',
          timestamp: new Date().toISOString()
        });
        return;
      }
      
      console.log(`🔐 Testing login service connection with token`);
      
      const authValidation = await serviceClient.validateAuthToken(token);
      
      res.json({
        success: true,
        service: 'login-service',
        auth_validation: authValidation,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ Login service test failed:', (error as Error).message);
      res.status(500).json({
        success: false,
        service: 'login-service',
        error: (error as Error).message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Test all services health
   * GET /test/services/health
   */
  async testServicesHealth(req: Request, res: Response): Promise<void> {
    try {
      console.log('🩺 Testing all services health...');
      
      const availableServices = await serviceClient.getAvailableServices();
      
      const healthChecks = {
        'user-service': await serviceClient.checkServiceHealth('user-service'),
        'login-service': await serviceClient.checkServiceHealth('login-service')
      };
      
      res.json({
        success: true,
        available_services: availableServices,
        health_checks: healthChecks,
        total_healthy: availableServices.length,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ Services health test failed:', (error as Error).message);
      res.status(500).json({
        success: false,
        error: (error as Error).message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Test user preferences
   * GET /test/user-preferences/:userId
   */
  async testUserPreferences(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      console.log(`⚙️ Testing user preferences for user: ${userId}`);
      
      const preferences = await serviceClient.getUserPreferences(userId);
      
      res.json({
        success: true,
        user_id: userId,
        preferences: preferences,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ User preferences test failed:', (error as Error).message);
      res.status(500).json({
        success: false,
        error: (error as Error).message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Demo complete order workflow with service communication
   * POST /test/order-workflow
   */
  async testOrderWorkflow(req: Request, res: Response): Promise<void> {
    try {
      const { userId, token } = req.body;
      
      if (!userId || !token) {
        res.status(400).json({
          success: false,
          message: 'userId and token are required',
          timestamp: new Date().toISOString()
        });
        return;
      }
      
      console.log(`🔄 Testing complete order workflow for user: ${userId}`);
      
      const workflow = {
        step1_auth: null as any,
        step2_user_validation: null as any,
        step3_user_preferences: null as any,
        step4_notification: null as any
      };
      
      // Step 1: Validate auth token
      workflow.step1_auth = await serviceClient.validateAuthToken(token);
      
      // Step 2: Validate user exists
      workflow.step2_user_validation = await serviceClient.validateUser(userId);
      
      // Step 3: Get user preferences
      workflow.step3_user_preferences = await serviceClient.getUserPreferences(userId);
      
      // Step 4: Test notification
      workflow.step4_notification = await serviceClient.notifyOrderCreated(
        userId,
        'test-order-' + Date.now(),
        { test: true, amount: 100 }
      );
      
      res.json({
        success: true,
        workflow_result: workflow,
        all_steps_completed: workflow.step1_auth && workflow.step2_user_validation,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ Order workflow test failed:', (error as Error).message);
      res.status(500).json({
        success: false,
        error: (error as Error).message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

export default new ServiceCommController();