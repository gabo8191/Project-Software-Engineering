import mongoose, { ConnectOptions } from 'mongoose';

/**
 * Database Health Check Response Interface
 */
interface DatabaseHealthCheck {
  status: 'healthy' | 'unhealthy';
  database: string;
  connection?: {
    status: string;
    database: string;
    host: string;
    port: string;
  };
  error?: string;
}

/**
 * Database Connection Status Interface
 */
interface ConnectionStatus {
  status: string;
  database: string;
  host: string;
  port: string;
}

/**
 * Database configuration for MongoDB connection
 * TypeScript implementation with strong typing
 */
class Database {
  private mongoURI: string;
  private options: ConnectOptions;

  constructor() {
    this.mongoURI = process.env.MONGODB_URI || 'mongodb://mongo_admin:mongo_password_123@mongodb:27017/OrderDB?authSource=admin';
    this.options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      retryWrites: true,
      writeConcern: {
        w: 'majority',
        j: true,
        wtimeout: 1000
      }
    };
  }

  /**
   * Connect to MongoDB
   */
  async connect(): Promise<void> {
    try {
      console.log('🔄 Connecting to MongoDB...');
      console.log('📍 Connection URI:', this.mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
      
      await mongoose.connect(this.mongoURI, this.options);
      
      console.log('✅ MongoDB connected successfully');
      console.log('📊 Database:', mongoose.connection.db?.databaseName);
      console.log('🌐 Host:', mongoose.connection.host);
      console.log('🔌 Port:', mongoose.connection.port);
      
      // Handle connection events
      this.setupEventHandlers();
      
    } catch (error) {
      console.error('❌ MongoDB connection error:', (error as Error).message);
      console.error('🔍 Full error:', error);
      process.exit(1);
    }
  }

  /**
   * Setup MongoDB event handlers
   */
  private setupEventHandlers(): void {
    mongoose.connection.on('connected', () => {
      console.log('📡 Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err: Error) => {
      console.error('❌ Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🔌 Mongoose disconnected from MongoDB');
    });

    // Handle application termination
    process.on('SIGINT', async () => {
      await this.disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await this.disconnect();
      process.exit(0);
    });
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect(): Promise<void> {
    try {
      await mongoose.connection.close();
      console.log('👋 MongoDB connection closed through app termination');
    } catch (error) {
      console.error('❌ Error closing MongoDB connection:', error);
    }
  }

  /**
   * Check if database is connected
   */
  isConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): ConnectionStatus {
    const states: Record<number, string> = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    return {
      status: states[mongoose.connection.readyState] || 'unknown',
      database: mongoose.connection.db?.databaseName || 'none',
      host: mongoose.connection.host || 'none',
      port: mongoose.connection.port?.toString() || 'none'
    };
  }

  /**
   * Health check for database
   */
  async healthCheck(): Promise<DatabaseHealthCheck> {
    try {
      if (!this.isConnected()) {
        throw new Error('Database not connected');
      }
      
      // Perform a simple operation to verify connection
      await mongoose.connection.db?.admin().ping();
      
      return {
        status: 'healthy',
        database: 'mongodb',
        connection: this.getConnectionStatus()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        database: 'mongodb',
        error: (error as Error).message,
        connection: this.getConnectionStatus()
      };
    }
  }

  /**
   * Get database instance (for advanced operations)
   */
  getDatabase() {
    return mongoose.connection.db;
  }

  /**
   * Get connection instance
   */
  getConnection() {
    return mongoose.connection;
  }
}

// Export singleton instance
const database = new Database();
export default database;