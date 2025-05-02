// import dotenv from 'dotenv';
// dotenv.config();

// import { MongoDBAdapter } from '../src/adapters/MongoDBAdapter.js';
// import app from './app.js';
// import logger from './config/logger.js';

// app.locals.logger = logger;

// // Initialize MongoDB Adapter
// const dbAdapter = new MongoDBAdapter();
// dbAdapter.setLogger(logger)

// /**
//  * Connect to MongoDB using the adapter
//  */
// async function connectAdapter() {
//   try {
//     await dbAdapter.connect({
//       connectionString: process.env.MONGODB_URI,
//       dbName: 'testdb', // or extract from URI
//       useNewUrlParser: true,
//       useUnifiedTopology: true
//     });
    
//     logger.info('✅ MongoDB connected via adapter');
//     app.locals.db = dbAdapter;
//   } catch (err) {
//     logger.error('❌ MongoDB connection error:', err);
//     throw err;
//   }
// }

// async function gracefulShutdown(exitCode = 0) {
//   try {
//     app.locals.logger.info('🛑 Shutting down...');
//     await dbAdapter.disconnect();
//     server.close(() => {
//       app.locals.logger.info('✅ Server closed');
//       if (process.env.NODE_ENV !== 'test') {
//         process.exit(exitCode);
//       }
//     });
//   } catch (err) {
//     app.locals.logger.error('Shutdown error:', err);
//     if (process.env.NODE_ENV !== 'test') {
//       process.exit(1);
//     }
//   }
// }

// /**
//  * Start the server with graceful shutdown handling
//  */
// async function startServer() {
//   const port = Number(process.env.PORT) || 3000;

//   try {
//     await connectAdapter();
//     // Basic health check route
//     app.get('/', (req, res) => res.send('Server is running'));
    
//     // Example route using the adapter
//     app.get('/test-db', async (req, res) => {
//       try {
//         // Test database operation
//         const testDoc = { message: 'Database test', timestamp: new Date() };
//         const id = await req.app.locals.db.create('testCollection', testDoc);
//         res.json({ success: true, insertedId: id });
//       } catch (err) {
//         res.status(500).json({ error: err.message });
//       }
//     });

//     const server = app.listen(port, () => {
//       app.locals.logger.info(`🚀 Server running on port ${port}`);
//     });

//     process.on('SIGTERM', () => gracefulShutdown(0));
//     process.on('SIGINT', () => gracefulShutdown(0)); // For Ctrl+C

//     return server;
//   } catch (err) {
//     app.locals.logger.error('🔥 Failed to start server:', err);
//     await gracefulShutdown(1);
//   }
// }

// // Start the server
// startServer().catch((err) => {
//   logger.error('💀 Fatal startup error:', err);
//   process.exit(1);
// });

// export { app, connectAdapter, startServer, dbAdapter };


import app from './app.js';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Try these commands:');
  console.log(`curl "http://localhost:${PORT}/inspect?test=123"`);
  console.log(`curl -X POST http://localhost:${PORT}/inspect -H "Content-Type: application/json" -d '{"key":"value"}'`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export { app, server };