import dotenv from 'dotenv';
import express from 'express';
dotenv.config();

import logger from './config/logger.js';
import errorHandler from './middlewares/errorHandler.js';
import sanitizeMiddleware from './middlewares/sanitizeMiddleware.js';
import securityMiddlewares from './middlewares/securityMiddleware.js';
import AppError from './utils/error/AppError.js';
import router from './routes/index.js';

const app = express();

app.locals.logger = logger;

//maybe consolidate the way you code
securityMiddlewares(app);
app.use(sanitizeMiddleware);
app.use(router)

// lets go pro
if (process.env.NODE_ENV === 'production') {
  // require('newrelic');
  app.locals.logger.info("lets go pro");
}

// tests bellow
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

// handle errors
app.use(errorHandler);
export default app;
