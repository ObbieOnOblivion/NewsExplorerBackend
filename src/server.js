import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import logger from './config/logger.js';
import connectDB from './config/db.js'
import { MongoDBAdapter } from './adapters/MongoDBAdapter.js';

const dbAdapter = new MongoDBAdapter()

app.locals.logger = logger;

async function connectAdapter() {
  try {
    connectDB()
    logger.info('✅ MongoDB connected via adapter');
  } catch (err) {
    logger.error('❌ MongoDB connection error:', err);
    throw err;
  }
}

async function gracefulShutdown(exitCode = 0) {
  try {
    app.locals.logger.info('🛑 Shutting down...');
    await dbAdapter.disconnect();
  } catch (err) {
    app.locals.logger.error('Shutdown error:', err);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }
}

/**
 * Start the server with graceful shutdown handling
 */
async function startServer() {
  const port = Number(process.env.PORT) || 3000;

  try {
    await connectAdapter();
    // Basic health check route
    app.get('/', (req, res) => res.send('Server is running'));
    
    // Example route using the adapter
    app.get('/test-db', async (req, res) => {
      try {
        // Test database operation
        const testDoc = { message: 'Database test', timestamp: new Date() };
        const id = await req.app.locals.db.create('testCollection', testDoc);
        res.json({ success: true, insertedId: id });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    const server = app.listen(port, () => {
      app.locals.logger.info(`🚀 Server running on port ${port}`);
    });

    process.on('SIGTERM', () => gracefulShutdown(0));
    process.on('SIGINT', () => gracefulShutdown(0)); // For Ctrl+C

    return server;
  } catch (err) {
    app.locals.logger.error('🔥 Failed to start server:', err);
    await gracefulShutdown(1);
  }
}

// Start the server
startServer().catch((err) => {
  logger.error('💀 Fatal startup error:', err);
  process.exit(1);
});

export { app, connectAdapter, startServer };