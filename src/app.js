const connectDB = require('./config/db.js');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const { createLogger, transports } = require('winston');
const { expressMiddleware } = require('apm-nodejs-express-client');

// Initialize Express
const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());

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

// APM Performance Monitoring
if (process.env.NODE_ENV === 'production') {
  app.use(expressMiddleware());
}

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

// Connect to Database
connectDB();
