import crypto from 'crypto';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import helmet from 'helmet';
import corsOptions from '../config/corsConfig.js';
import setupRedisStore from '../config/redisConfig.js';
import {
  getCspConfig,
  helmetConfig,
  rateLimitConfig,
  bodyParserConfig
} from '../config/securityConfig.js';

const securityMiddlewares = async (app) => {
  // Initialize logger shortcut
  const logger = app.locals?.logger || console;

  // 1. Security Headers Middleware
  app.use(helmet({
    ...helmetConfig,
    contentSecurityPolicy: (req, res) => getCspConfig(req, res),
  }));

  // 2. Session Configuration
  try {
    const store = await setupRedisStore(app);
    logger.info(`Session store initialized: ${store ? 'Redis' : 'Memory'}`);

    app.use(session({
      store: store || new session.MemoryStore(),
      secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: (process.env.SESSION_TTL || 86400) * 1000,
      },
      name: 'secureSessionId',
      rolling: true,
      unset: 'destroy',
      genid: () => `${crypto.randomBytes(16).toString('hex')}-${Date.now().toString(36)}`,
    }));
  } catch (err) {
    logger.error('Session initialization failed:', err);
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Critical: Session setup failed in production');
    }
    // In development, continue with MemoryStore
    app.use(session({
      store: new session.MemoryStore(),
      secret: 'dev-secret',
      // ... other session config
    }));
  }

  // 3. Core Middlewares
  app.use(cors(corsOptions));
  app.use(express.json(bodyParserConfig.json));
  app.use(express.urlencoded(bodyParserConfig.urlencoded));
  
  // 4. Rate Limiting
  app.use(rateLimit({
    ...rateLimitConfig,
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({ error: 'Too many requests' });
    }
  }));

  // 5. Compression
  app.use(compression());

  // Error handling middleware would go here
};

export default securityMiddlewares;