// import dotenv from 'dotenv';
// import express from 'express';
// dotenv.config();

import logger from './config/logger.js';
import errorHandler from './middlewares/errorHandler.js';
import sanitizeMiddleware from './middlewares/sanitizeMiddleware.js';
import securityMiddlewares from './middlewares/securityMiddleware.js';
import AppError from './utils/error/AppError.js';
import router from './routes/index.js';

// const app = express();

// app.locals.logger = logger;

// //maybe consolidate the way you code
// securityMiddlewares(app);
// app.use(sanitizeMiddleware);
// app.use(express.json()); // <<< Critical for parsing JSON bodies

// const requestLogger = (req, res, next) => {
//   // Log basic request info
//   logger.info(`Incoming ${req.method} request to ${req.url}`);

//   // Log headers (avoid sensitive headers like Authorization)
//   const headers = { ...req.headers };
//   delete headers['authorization']; // Remove sensitive data
//   logger.debug('Headers:', headers);

//   // Log body (if present)
//   if (req.body && Object.keys(req.body).length > 0) {
//     logger.debug('Body:', `${req.body}`);
//     logger.info("this is new");
//   } else {
//     logger.debug('Body: (empty)');
//   }

//   res.send()

//   next(); // Pass control to the next middleware
// };

// app.use(router)

// app.get('/woow', requestLogger)

// // lets go pro
// if (process.env.NODE_ENV === 'production') {
//   // require('newrelic');
//   app.locals.logger.info("lets go pro");
// }

// // tests bellow
// app.get('/health/crash-sync', () => {
//   throw new Error('Synchronous error test');
// });

// app.get('/health/crash-sync-400', () => {
//   throw new AppError('Bad request test', 400, {
//     field: 'example',
//     reason: 'Invalid input',
//   });
// });

// app.get('/health/crash-async', async (_, __, next) => {
//   try {
//     await Promise.reject(new AppError('Async error test', 503));
//   } catch (err) {
//     next(err);
//   }
// });

// app.get('/health', async (req, res) => {
//   const storeHealthy = req.sessionStore 
//     ? await new Promise(resolve => {
//         req.sessionStore.all(err => resolve(!err));
//       })
//     : true;
//   res.status(storeHealthy ? 200 : 503).json({
//     status: storeHealthy ? 'ok' : 'unhealthy',
//     store: storeHealthy ? 'connected' : 'disconnected'
//   });
// });

// // handle errors
// app.use(errorHandler);
// export default app;





import express from 'express';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

securityMiddlewares(app);
app.use(sanitizeMiddleware);
app.use(router)

// Request logger middleware
app.use((req, res, next) => {
  logger.info(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Simple GET endpoint to inspect requests
app.get('/inspect', (req, res) => {
  res.json({
    success: true,
    headers: req.headers,
    query: req.query,
    body: req.body, // Will be empty for GET requests
    timestamp: new Date().toISOString()
  });
});

// POST endpoint to show body
app.post('/inspect', (req, res) => {
  res.json({
    success: true,
    received: req.body,
    timestamp: new Date().toISOString()
  });
});

app.get('/health/crash-sync', () => {
  throw new Error('Synchronous error test');
});

app.get('/health/crash-sync-400', () => {
  throw new AppError('Bad request test', 400, {
    field: 'example',
    reason: 'Invalid input',
  });
});

app.get('/health/crash-async', async (_, __, next) => {
  try {
    await Promise.reject(new AppError('Async error test', 503));
  } catch (err) {
    next(err);
  }
});

app.get('/health', async (req, res) => {
  const storeHealthy = req.sessionStore 
    ? await new Promise(resolve => {
        req.sessionStore.all(err => resolve(!err));
      })
    : true;
  res.status(storeHealthy ? 200 : 503).json({
    status: storeHealthy ? 'ok' : 'unhealthy',
    store: storeHealthy ? 'connected' : 'disconnected'
  });
});

app.use(errorHandler);



export default app;