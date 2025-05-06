// db.js - Setup both Mongoose and raw adapter
import mongoose from 'mongoose';
import { MongoDBAdapter } from '../adapters/MongoDBAdapter.js';

const connectDB = async () => {
  // Mongoose connection (primary)
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.DB_NAME
  });

  // Raw adapter connection (shares the same underlying connection)
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