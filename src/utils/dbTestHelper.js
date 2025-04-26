import mongoose from 'mongoose';

let connection = null;

export async function connectDB() {
  if (connection) return connection;
  
  try {
    connection = await mongoose.createConnection(process.env.MONGODB_URI, {
      autoIndex: false,
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 5000,
      bufferCommands: false
    });
    
    return connection;
  } catch (err) {
    connection = null;
    throw err;
  }
}

export async function disconnectDB() {
  if (!connection) return;
  
  try {
    await connection.close();
    await connection.asPromise().then(conn => conn.close());
    await mongoose.disconnect();
  } catch (err) {
    console.error('Disconnection error:', err);
  } finally {
    connection = null;
    mongoose.connections.forEach(conn => conn.close());
    mongoose.models = {};
    mongoose.modelSchemas = {};
  }
}