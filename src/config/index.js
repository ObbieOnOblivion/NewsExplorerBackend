// src/config/index.js

import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

// Legacy default values
const legacyConfig = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT) || 3000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/professional-express-app',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  newRelicLicenseKey: process.env.NEW_RELIC_LICENSE_KEY,
  apmServiceName: process.env.APM_SERVICE_NAME || 'professional-express-app',
};

// Joi schema for validation
const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default(legacyConfig.env),
  PORT: Joi.number().default(legacyConfig.port),
  MONGO_URI: Joi.string().default(legacyConfig.mongoUri),
  JWT_SECRET: Joi.string().default(legacyConfig.jwtSecret),
  RATE_LIMIT_WINDOW_MS: Joi.number().default(legacyConfig.rateLimitWindowMs),
  RATE_LIMIT_MAX: Joi.number().default(legacyConfig.rateLimitMax),
  NEW_RELIC_LICENSE_KEY: Joi.string().optional(),
  APM_SERVICE_NAME: Joi.string().default(legacyConfig.apmServiceName),
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
}).unknown();

const { value: validatedConfig, error } = envVarsSchema.validate(process.env);

if (error) {
  console.error('Config validation error:', error.message);
  // Don’t throw to keep compatibility
}

// Merge defaults with validated values
const config = {
  ...legacyConfig,
  ...validatedConfig,
  logLevel: validatedConfig.LOG_LEVEL,
  mongoose: {
    url: legacyConfig.mongoUri,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    },
  },
};

export default config;
