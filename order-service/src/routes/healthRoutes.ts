import express from 'express';
import healthController from '../controllers/healthController';

const router = express.Router();

/**
 * Health Routes - TypeScript implementation
 * Health check and monitoring endpoints
 */

// Health Check Routes
router.get('/health', healthController.healthCheck.bind(healthController));
router.get('/ready', healthController.readinessCheck.bind(healthController));
router.get('/live', healthController.livenessCheck.bind(healthController));
router.get('/status', healthController.detailedStatus.bind(healthController));
router.get('/ping', healthController.ping.bind(healthController));

export default router;