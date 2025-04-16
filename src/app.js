const express = require('express');
const securityMiddlewares = require('./middlewares/securityMiddleware');
const sanitizeMiddleware = require('./middlewares/sanitizeMiddleware');
const logger = require('./config/logger'); // Import from config

const app = express();

// Attach logger to app
app.locals.logger = logger;

// Apply security middlewares
securityMiddlewares(app);

// Apply sanitization middleware
app.use(sanitizeMiddleware);

// Production monitoring
if (process.env.NODE_ENV === 'production') {
  require('newrelic');
}

// Test route
app.get('/health', (req, res) => {
  req.app.locals.logger.info('Health check route accessed');
  res.status(200).json({ status: 'OK' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  req.app.locals.logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;