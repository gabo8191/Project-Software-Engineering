const express = require('express');
const healthController = require('../controllers/healthController');

const router = express.Router();

/**
 * Health Check Routes
 * Provides various health check endpoints for monitoring and Docker health checks
 */

/**
 * @route GET /health
 * @desc Basic health check endpoint
 * @access Public
 * @returns {Object} Service health status
 */
router.get('/health', healthController.healthCheck);

/**
 * @route GET /ready
 * @desc Readiness probe endpoint
 * @access Public
 * @returns {Object} Service readiness status
 * @description Kubernetes readiness probe - checks if service is ready to accept traffic
 */
router.get('/ready', healthController.readinessCheck);

/**
 * @route GET /live
 * @desc Liveness probe endpoint  
 * @access Public
 * @returns {Object} Service liveness status
 * @description Kubernetes liveness probe - checks if service is alive
 */
router.get('/live', healthController.livenessCheck);

/**
 * @route GET /status
 * @desc Detailed service status
 * @access Public
 * @returns {Object} Detailed service information
 */
router.get('/status', healthController.detailedStatus);

/**
 * @route GET /ping
 * @desc Simple ping endpoint
 * @access Public
 * @returns {Object} Simple pong response
 */
router.get('/ping', healthController.ping);

module.exports = router;