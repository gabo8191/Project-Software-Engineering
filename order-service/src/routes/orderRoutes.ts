import express from 'express';
import orderController from '../controllers/orderController';

const router = express.Router();

/**
 * Order Routes - TypeScript implementation
 * All order-related endpoints with proper typing
 */

// Order Management Routes
router.post('/createorder', orderController.createOrder.bind(orderController));
router.put('/updateorderstatus', orderController.updateOrderStatus.bind(orderController));
router.get('/getordersbycustomerid/:customerID', orderController.getOrdersByCustomerID.bind(orderController));
router.get('/getorderbyid/:orderID', orderController.getOrderByID.bind(orderController));
router.get('/getallorders', orderController.getAllOrders.bind(orderController));
router.delete('/deleteorder/:orderID', orderController.deleteOrder.bind(orderController));
router.get('/stats', orderController.getOrderStats.bind(orderController));

export default router;