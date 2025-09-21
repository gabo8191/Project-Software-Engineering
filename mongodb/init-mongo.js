// MongoDB initialization script for OrderMgmtMicroservice
// Database: OrderDB
// Collection: Order

// Switch to the OrderDB database
db = db.getSiblingDB('OrderDB');

// Create Order collection according to project specifications
db.createCollection('Order', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['customerID', 'orderID', 'status'],
      properties: {
        customerID: {
          bsonType: 'string',
          description:
            'Customer Document ID - must be a string and is required',
        },
        orderID: {
          bsonType: 'string',
          description: 'Order ID - must be a string and is required',
        },
        status: {
          bsonType: 'string',
          enum: ['Received', 'In progress', 'Sended'],
          description:
            'Order status - must be one of the enum values and is required',
        },
        createdAt: {
          bsonType: 'date',
          description: 'createdAt must be a date',
        },
        updatedAt: {
          bsonType: 'date',
          description: 'updatedAt must be a date',
        },
      },
    },
  },
});

// Create indexes for better performance
db.Order.createIndex({ customerID: 1 });
db.Order.createIndex({ orderID: 1 }, { unique: true });
db.Order.createIndex({ status: 1 });
db.Order.createIndex({ createdAt: -1 });
db.Order.createIndex({ customerID: 1, status: 1 });

// Insert sample orders (for development)
db.Order.insertMany([
  {
    customerID: '12345678',
    orderID: 'ORD-001-2024',
    status: 'Received',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    customerID: '12345678',
    orderID: 'ORD-002-2024',
    status: 'In progress',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    customerID: '87654321',
    orderID: 'ORD-003-2024',
    status: 'Sended',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    customerID: '11223344',
    orderID: 'ORD-004-2024',
    status: 'Received',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]);

print('MongoDB OrderDB initialization completed successfully!');
