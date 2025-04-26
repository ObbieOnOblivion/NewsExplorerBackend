import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  MONGODB_URI: Joi.string().required().description('Mongo DB URI'),
  JWT_SECRET: Joi.string().required().description('JWT Secret Key'),
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
  NEW_RELIC_LICENSE_KEY: Joi.string().optional(),
  APM_SERVICE_NAME: Joi.string().default('express-app'),
}).unknown();

const { value: envVars, error } = envVarsSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGODB_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  jwtSecret: envVars.JWT_SECRET,
  logLevel: envVars.LOG_LEVEL,
  newRelic: {
    licenseKey: envVars.NEW_RELIC_LICENSE_KEY,
    serviceName: envVars.APM_SERVICE_NAME,
  },
};

export default config;
