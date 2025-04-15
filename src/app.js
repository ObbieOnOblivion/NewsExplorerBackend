const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createLogger, transports } = require('winston');
const { corsOptions } = require("./config/corsConfig.js")

// Initialize Express
const app = express();

// Security middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
// Add this before your routes

app.use((req, _, next) => {
  const sanitize = (obj) => {
    if (!obj || typeof obj !== 'object') return;

    // Handle prototype pollution
    if (obj.constructor?.name !== 'Object') {
      delete obj.__proto__;
      delete obj.constructor;
    }

    Object.keys(obj).forEach(key => {
      // Block all MongoDB operators and dangerous keys
      if (key.startsWith('$') || 
          key.includes('.') || 
          ['__proto__', 'constructor', 'prototype'].includes(key)) {
        delete obj[key];
      } 
      // Recursively sanitize
      else if (typeof obj[key] === 'object') {
        sanitize(obj[key]);
      }
      // Handle array elements
      else if (Array.isArray(obj[key])) {
        obj[key].forEach(item => sanitize(item));
      }
      // Block dangerous value types
      else if (typeof obj[key] === 'function') {
        delete obj[key];
      }
    });
  };

  ['body', 'query', 'params'].forEach(prop => {
    if (req[prop]) sanitize(req[prop]);
  });

  next();
});

// i want to write this a little bit better
if (process.env.NODE_ENV === 'production') {
  require('newrelic');
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Compression
app.use(compression());

// Winston logger setup
const logger = createLogger({
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/combined.log' })
  ]
});

// Attach logger to app
app.locals.logger = logger;

// Test route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;
