const mongoose = require('mongoose');

/**
 * Order Model Schema
 * Matches the requirements from the project specification:
 * - customerID (Customer Document): String
 * - orderID: String
 * - status: String (enum: 'Received', 'In progress', 'Sended')
 */
const orderSchema = new mongoose.Schema({
  customerID: {
    type: String,
    required: [true, 'Customer ID is required'],
    trim: true,
    maxlength: [50, 'Customer ID cannot exceed 50 characters']
  },
  orderID: {
    type: String,
    required: [true, 'Order ID is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Order ID cannot exceed 100 characters']
  },
  status: {
    type: String,
    required: [true, 'Order status is required'],
    enum: {
      values: ['Received', 'In progress', 'Sended'],
      message: 'Status must be one of: Received, In progress, Sended'
    },
    default: 'Received'
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
  collection: 'Order' // Explicit collection name to match MongoDB init script
});

// Indexes for better performance
orderSchema.index({ customerID: 1 });
orderSchema.index({ orderID: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ customerID: 1, status: 1 });
orderSchema.index({ createdAt: -1 });

// Instance methods
orderSchema.methods.toJSON = function() {
  const order = this.toObject();
  
  // Return object matching API specification
  return {
    customerID: order.customerID,
    orderID: order.orderID,
    status: order.status,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt
  };
};

// Static methods
orderSchema.statics.findByCustomerID = function(customerID) {
  return this.find({ customerID }).sort({ createdAt: -1 });
};

orderSchema.statics.findByOrderID = function(orderID) {
  return this.findOne({ orderID });
};

orderSchema.statics.updateOrderStatus = function(orderID, newStatus) {
  return this.findOneAndUpdate(
    { orderID },
    { status: newStatus, updatedAt: new Date() },
    { new: true, runValidators: true }
  );
};

// Pre-save middleware
orderSchema.pre('save', function(next) {
  // Auto-generate orderID if not provided
  if (!this.orderID) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderID = `ORD-${timestamp}-${random}`;
  }
  next();
});

// Export model
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;