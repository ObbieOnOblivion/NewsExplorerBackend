// check naming conventions of files 
// use validate.js to validate whats coming into the middlwares 
// impliment AppError
// consider learning TypeScript/C#/Java/Python (bulletproof your JavaScript first)
// consider learning vercel .net and Next.js
// validate .env vars 
// test coverage looks weak 

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

app.use(express.json()); // For parsing application/json
securityMiddlewares(app);
app.use(sanitizeMiddleware);
app.use(express.urlencoded({ extended: true })); // For parsing form data

// lets go pro
if (process.env.NODE_ENV === 'production') {
  // require('newrelic');
  app.locals.logger.info("lets go pro");
}

const requestLogger = (req, res, next) => {
  logger.info(`Incoming ${req.method} request to ${req.url}`);
  logger.debug('Headers:', req.headers);
  logger.debug('Body:', req.body);
  next();
};
app.use(requestLogger);
app.use(router);
app.use(errorHandler);

export default app;