/**
 * Order Management Microservice - Simplified Version
 * Node.js + Express + MongoDB
 */

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongo_admin:mongo_password_123@mongodb:27017/OrderDB?authSource=admin';

console.log('🔄 Connecting to MongoDB...');
console.log(`📍 Connection URI: ${MONGODB_URI.replace(/:[^:]*@/, ':***@')}`);

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Order Schema
const orderSchema = new mongoose.Schema({
  customerID: {
    type: String,
    required: true,
    trim: true
  },
  orderID: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Received', 'In progress', 'Sended'],
    default: 'Received'
  }
}, {
  timestamps: true,
  collection: 'Order'
});

const Order = mongoose.model('Order', orderSchema);

// Routes
// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'order-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Create order
app.post('/order/createorder', async (req, res) => {
  try {
    console.log('📝 Creating new order:', req.body);
    
    const { customerID, orderID, status } = req.body;
    
    if (!customerID || !orderID) {
      return res.status(400).json({
        error: 'customerID and orderID are required'
      });
    }

    const order = new Order({
      customerID,
      orderID,
      status: status || 'Received'
    });

    const savedOrder = await order.save();
    console.log('✅ Order created successfully:', savedOrder.orderID);
    
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('❌ Error creating order:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Order with this orderID already exists'
      });
    }
    
    res.status(500).json({
      error: 'Failed to create order',
      message: error.message
    });
  }
});

// Update order status
app.put('/order/updateorderstatus', async (req, res) => {
  try {
    const { orderID, status } = req.body;
    
    console.log('🔄 Updating order status:', { orderID, status });
    
    if (!orderID || !status) {
      return res.status(400).json({
        error: 'orderID and status are required'
      });
    }

    if (!['Received', 'In progress', 'Sended'].includes(status)) {
      return res.status(400).json({
        error: 'Invalid status. Must be: Received, In progress, or Sended'
      });
    }

    const order = await Order.findOneAndUpdate(
      { orderID },
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        error: 'Order not found'
      });
    }

    console.log('✅ Order status updated successfully:', order.orderID);
    res.json(order);
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    res.status(500).json({
      error: 'Failed to update order status',
      message: error.message
    });
  }
});

// Find orders by customer ID
app.get('/order/findorderbycustomerid', async (req, res) => {
  try {
    const { customerID } = req.query;
    
    console.log('🔍 Finding orders for customer:', customerID);
    
    if (!customerID) {
      return res.status(400).json({
        error: 'customerID query parameter is required'
      });
    }

    const orders = await Order.find({ customerID }).sort({ createdAt: -1 });
    
    console.log(`✅ Found ${orders.length} orders for customer ${customerID}`);
    res.json(orders);
  } catch (error) {
    console.error('❌ Error finding orders:', error);
    res.status(500).json({
      error: 'Failed to find orders',
      message: error.message
    });
  }
});

// Get all orders (for testing)
app.get('/order/all', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    console.log(`📋 Retrieved ${orders.length} total orders`);
    res.json(orders);
  } catch (error) {
    console.error('❌ Error retrieving orders:', error);
    res.status(500).json({
      error: 'Failed to retrieve orders',
      message: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('💥 Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('🌟 =================================');
  console.log('🚀 ORDER SERVICE STARTED');
  console.log('🌟 =================================');
  console.log(`📍 Host: 0.0.0.0`);
  console.log(`🔌 Port: ${PORT}`);
  console.log(`🌐 URL: http://0.0.0.0:${PORT}`);
  console.log(`🏥 Health: http://0.0.0.0:${PORT}/health`);
  console.log(`📋 Orders: http://0.0.0.0:${PORT}/order`);
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  console.log('🌟 =================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📤 Received SIGTERM, starting graceful shutdown...');
  server.close(() => {
    console.log('✅ HTTP server closed');
    mongoose.connection.close(() => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('📤 Received SIGINT, starting graceful shutdown...');
  server.close(() => {
    console.log('✅ HTTP server closed');
    mongoose.connection.close(() => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
});

module.exports = app;