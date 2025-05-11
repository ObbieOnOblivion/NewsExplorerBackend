import mongoose from 'mongoose';
import { MongoDBAdapter } from '../adapters/MongoDBAdapter.js';

// Connect to MongoDB using both Mongoose and a custom adapter
const connectDB = async () => {
  // Connect Mongoose (ODM)
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.DB_NAME
  });

  // Initialize raw MongoDB adapter connection (optional for low-level access)
  const adapter = new MongoDBAdapter();
  await adapter.connect({
    connectionString: process.env.MONGODB_URI,
    dbName: process.env.DB_NAME,
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  return { mongoose, adapter };
};

export default connectDB;
