const mongoose = require('mongoose');
const config = require('./index');

let cachedConnection = null;

async function connectDB() {
  if (cachedConnection) {
    return cachedConnection;
  }

  // Support both old and new config structures
  const connectionString = config.mongoUri || config.mongoose.url;
  const options = config.mongoose?.options || {
    useNewUrlParser: true,
    useUnifiedTopology: true
  };

  try {
    const connection = mongoose.connect(connectionString, options);
    cachedConnection = connection;
    
    await connection;
    console.log('MongoDB connected successfully');
    return connection;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
}

// Event listeners
mongoose.connection.on('error', (err) => {
  console.error(`MongoDB connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
});

module.exports = {
  connectDB,
  mongoose
};