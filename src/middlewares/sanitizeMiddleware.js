import logger from '../config/logger.js';
import {safeStringify} from '../utils/helpers.js';

class SecuritySanitizer {
  static #dangerousKeys = new Set(['__proto__', 'constructor', 'prototype']);

  static #isDangerous(key) {
    return key.startsWith('$') || key.includes('.') || this.#dangerousKeys.has(key);
  }

  static #sanitizeObject(obj, path = '', req) {
    if (!obj || typeof obj !== 'object') return;

    if (obj.constructor?.name !== 'Object') {
      this.#logPrototypeViolation(obj, path, req);
      this.#neutralizeObject(obj);
      return;
    }

    Object.keys(obj).forEach((key) => {
      const currentPath = path ? `${path}.${key}` : key;

      if (this.#isDangerous(key)) {
        this.#logDangerousKey(key, currentPath, req);
        delete obj[key];
        return;
      }

      if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.#sanitizeObject(obj[key], currentPath, req);
      }

      if (Array.isArray(obj[key])) {
        obj[key].forEach((item, index) => {
          this.#sanitizeObject(item, `${currentPath}[${index}]`, req);
        });
      }
    });
  }

  static #neutralizeObject(obj) {
    Object.setPrototypeOf(obj, null);
    delete obj.constructor;

    if (['__proto__', 'constructor'].some((k) => k in obj)) {
      Object.keys(obj).forEach((key) => delete obj[key]);
    }
  }

  static #logPrototypeViolation(obj, path, req) {
    logger.warn('Prototype pollution attempt detected', {
      securityEvent: 'PROTOTYPE_POLLUTION',
      requestContext: {
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      },
      maliciousPayload: {
        type: obj.constructor?.name,
        path: path,
        value: safeStringify(obj),
      },
      action: 'neutralized',
    });
  }

  static #logDangerousKey(key, path, req) {
    logger.warn('Blocked dangerous input', {
      securityEvent: 'DANGEROUS_INPUT',
      requestContext: {
        method: req.method,
        path: req.path,
        ip: req.ip,
      },
      maliciousInput: {
        key: key,
        path: path,
        type: 'mongo_operator_or_prototype_access',
      },
      action: 'removed',
    });
  }

  static middleware() {
    return (req, _, next) => {
      ['body', 'query', 'params'].forEach((prop) => {
        if (req[prop]) {
          logger.debug(`Sanitizing request ${prop}`, {
            requestInfo: {
              method: req.method,
              path: req.path,
              ip: req.ip,
            },
          });
          this.#sanitizeObject(req[prop], prop, req);
        }
      });
      next();
    };
  }
}

// Export the middleware directly
export default SecuritySanitizer.middleware();