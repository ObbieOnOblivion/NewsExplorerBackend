 

/**
 * Safely stringifies objects with circular reference and depth protection
 * @param {any} obj - The object to stringify
 * @param {number} [space=2] - Number of spaces for pretty-printing (JSON.stringify)
 * @param {number} [depth=0] - Current recursion depth (internal use)
 * @param {number} [maxDepth=20] - Maximum allowed recursion depth
 * @param {WeakSet} [seen=new WeakSet()] - Track circular references (internal use)
 * @returns {string} Safe JSON string or error message
 */


import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import app from './app.js';
import logger from './config/logger.js';
  
app.locals.logger = logger;

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    app.locals.logger.info('✅ MongoDB connected');
  } catch (err) {
    app.locals.logger.error('❌ MongoDB connection error:', err);
    throw err; // Re-throw to trigger startup failure
  }
}

// 5. Server startup
async function startServer() {
  const port = process.env.PORT || 3000;

  try {
    await connectDB();

    // Apply middleware and routes HERE
    app.get('/', (req, res) => res.send('Server is running'));

    const server = app.listen(port, () => {
      app.locals.logger.info(`🚀 Server running on port ${port}`);
    });

    // Graceful shutdown handlers
    process.on('SIGTERM', () => {
      app.locals.logger.info('🛑 Received SIGTERM. Closing server...');
      server.close(() => {
        app.locals.logger.info('✅ Server closed');
        process.exit(0);
      });
    });

    process.on('unhandledRejection', (err) => {
      app.locals.logger.error('⚠️ Unhandled rejection:', err);
      server.close(() => process.exit(1));
    });

    return server;
  } catch (err) {
    app.locals.logger.error('🔥 Failed to start server:', err);
    process.exit(1);
  }
}

// 6. Start the server
startServer().catch((err) => {
  logger.error('💀 Fatal startup error:', err);
  process.exit(1);
});

export {app, connectDB, startServer};

