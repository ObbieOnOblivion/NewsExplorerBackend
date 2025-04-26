import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
// import { fileURLToPath } from 'node:url';

// // Get __dirname equivalent in ESM
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// Environment Configuration
export const isTrueDevelopment = () => {
  return (
    process.env.NODE_ENV === 'development' &&
    process.env.APP_ENV === 'local' &&
    !process.env.CI &&
    fs.existsSync(path.join(__dirname, '..', '.development'))
  );
};

// CSP Configuration
export const getCspConfig = (req, res) => {
  const nonce = crypto.randomBytes(16).toString('hex');
  res.locals.cspNonce = nonce;

  return {
    directives: {
      defaultSrc: ["'none'"],
      scriptSrc: [
        "'self'",
        `'nonce-${nonce}'`,
        "'strict-dynamic'",
        "'wasm-unsafe-eval'",
        ...(isTrueDevelopment() ? ["'unsafe-eval'"] : []),
      ],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'https://*.example.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      connectSrc: [
        "'self'",
        'https://api.example.com',
        'https://*.service.example.com',
        'wss://realtime.example.com',
        ...(isTrueDevelopment() ? ['ws://localhost:*'] : []),
        'https://oauth.example.com',
        'https://*.auth0.com',
        'https://stats.example.com',
        'https://sentry.io/api/12345/store/',
        'https://*.execute-api.us-east-1.amazonaws.com',
        'https://*.amazoncognito.com',
        'https://s3.amazonaws.com',
      ],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
      reportUri: '/csp-violation-log',
      reportTo: [
        {
          group: 'csp-endpoint',
          max_age: 10886400,
          endpoints: [{ url: 'https://analytics.example.com/csp-reports' }],
        },
      ],
    },
    reportOnly: !process.env.PRODUCTION_ENFORCE_CSP,
  };
};

// Session Configuration
export const createSessionConfig = (store) => {
  const config = {
    secret: process.env.SESSION_SECRET || (isTrueDevelopment() ? 'dev-secret' : null),
    resave: false,
    saveUninitialized: false,
    store: store || undefined,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: (process.env.SESSION_TTL || 86400) * 1000,
    },
    name: 'secureSessionId',
    rolling: true,
    unset: 'destroy',
    genid: () => crypto.randomBytes(16).toString('hex') + '-' + Date.now().toString(36),
  };

  // Validate session secret in production
  if (!config.secret && process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET environment variable is required in production');
  }

  return config;
};

// Other Configurations
export const helmetConfig = {
  frameguard: { action: 'deny' },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
};

export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  keyGenerator: (req) => req.ip,
  handler: (req, res) => {
    req.app.locals.logger?.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).send('Too many requests');
  },
};

export const bodyParserConfig = {
  json: { limit: '10kb' },
  urlencoded: { extended: true, limit: '10kb' },
};