const express = require('express'); // Add this at the top
const helmet = require('helmet');
const cors = require('cors');
const { corsOptions } = require('../config/corsConfig');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

// Rate limiter config
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});

// Body parser config
const bodyParserConfig = {
  json: { limit: '10kb' },
  urlencoded: { extended: true }
};

// CORS logger middleware
const corsLogger = (req, res, next) => {
  const origin = req.headers.origin;
  if (origin && !corsOptions.origin.some(o => o === origin)) {
    console.warn(`Blocked CORS request from: ${origin}`);
  }
  next();
};

// Security middleware setup
const securityMiddlewares = (app) => {
  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(corsLogger);
  app.use(express.json(bodyParserConfig.json));
  app.use(express.urlencoded(bodyParserConfig.urlencoded));
  app.use(limiter);
  app.use(compression());
};

module.exports = securityMiddlewares;