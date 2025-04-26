import session from 'express-session';
import { createClient } from 'redis';

// Singleton pattern for RedisStore class
let RedisStoreClass;

/**
 * Initializes RedisStore class with proper error handling
 */
async function initializeRedisStore() {
  try {
    const { default: RedisStore } = await import('connect-redis');
    
    if (typeof RedisStore !== 'function') {
      throw new Error('Invalid RedisStore constructor');
    }
    
    return RedisStore;
  } catch (err) {
    throw new Error(`RedisStore initialization failed: ${err.message}\n` +
      `Required versions:\n` +
      `- connect-redis@7.x\n` +
      `- redis@4.x\n` +
      `- Node.js 16+`);
  }
}

/**
 * Configures session store based on environment
 */
export default async function setupRedisStore(app) {
  const logger = app.locals?.logger || console;
  
  // MemoryStore fallback
  if (process.env.USE_REDIS !== 'true') {
    logger.info('Session: Using MemoryStore (Redis disabled)');
    return new session.MemoryStore();
  }

  try {
    // Lazy load RedisStore class
    RedisStoreClass = RedisStoreClass || await initializeRedisStore();
    
    // Configure Redis client
    const redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 200, 5000)
      }
    });

    // Error handling
    redisClient.on('error', (err) => 
      logger.error(`Redis client error: ${err.message}`)
    );

    await redisClient.connect();

    // Create session store
    return new RedisStoreClass({
      client: redisClient,
      prefix: 'sess:',
      ttl: Number(process.env.SESSION_TTL) || 86400, // 24h default
      disableTouch: true
    });
  } catch (err) {
    logger.error(`Redis connection failed: ${err.message}`);

    // Production should fail fast
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Production requires Redis');
    }

    // Fallback to MemoryStore in development
    logger.warn('Falling back to MemoryStore');
    return new session.MemoryStore();
  }
}