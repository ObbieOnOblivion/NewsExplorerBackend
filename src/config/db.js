import mongoose from 'mongoose';
import config from './index.js';

class Database {
  constructor() {
    this.connection = null;
    this.connect();
  }

  async connect() {
    if (this.connection) return this.connection;

    try {
      const connectionString = config.mongoUri;
      const options = {
        dbName: config.dbName || 'news-explorer',
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000
      };

      this.connection = await mongoose.connect(connectionString, options);
      console.log(`MongoDB connected to ${options.dbName}`);
      this.setupEventListeners();
      return this.connection;
    } catch (err) {
      console.error('Database connection failed:', err);
      process.exit(1);
    }
  }

  setupEventListeners() {
    mongoose.connection.on('connected', () => 
      console.log('Mongoose connected to DB'));
    
    mongoose.connection.on('error', (err) => 
      console.error('Mongoose connection error:', err));
    
    mongoose.connection.on('disconnected', () => 
      console.warn('Mongoose disconnected'));
  }

  async disconnect() {
    if (!this.connection) return;
    await mongoose.disconnect();
    this.connection = null;
  }
}

export default new Database();