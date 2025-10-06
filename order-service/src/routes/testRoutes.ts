import { Router } from 'express';
import serviceCommController from '../controllers/serviceCommController';

const router = Router();

/**
 * Service Communication Test Routes
 * Routes for testing inter-service communication
 */

// Test user service
router.get('/user-service/:userId', serviceCommController.testUserService.bind(serviceCommController));

// Test login service
router.post('/login-service', serviceCommController.testLoginService.bind(serviceCommController));

// Test all services health
router.get('/services/health', serviceCommController.testServicesHealth.bind(serviceCommController));

// Test user preferences
router.get('/user-preferences/:userId', serviceCommController.testUserPreferences.bind(serviceCommController));

// Test complete order workflow
router.post('/order-workflow', serviceCommController.testOrderWorkflow.bind(serviceCommController));

export default router;