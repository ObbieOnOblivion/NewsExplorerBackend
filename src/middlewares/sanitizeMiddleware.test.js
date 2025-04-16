const SecuritySanitizer = require('./sanitizeMiddleware');
const request = require('supertest');
const express = require('express');

// Mock logger globally
jest.mock('../config/logger', () => ({
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
}));
const logger = require('../config/logger');

describe('SecuritySanitizer', () => {
  let app;
  
  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(SecuritySanitizer.middleware());
    app.post('/test', (req, res) => res.json(req.body));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('blocks prototype pollution', async () => {
    const response = await request(app)
      .post('/test')
      .send({ __proto__: { isAdmin: true } });
    
    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/security violation/i);
    expect(logger.warn).toHaveBeenCalled();
  });

  test('allows safe objects', async () => {
    const response = await request(app)
      .post('/test')
      .send({ user: 'safe' });
    
    expect(response.status).toBe(200);
    expect(logger.warn).not.toHaveBeenCalled();
  });

  test('logs constructor prototype attacks', async () => {
    await request(app)
      .post('/test')
      .send({ constructor: { prototype: {} } });
    
    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        securityEvent: 'PROTOTYPE_POLLUTION',
        action: 'neutralized'
      })
    );
  });

  test('blocks MongoDB operators', async () => {
    const response = await request(app)
      .post('/test')
      .send({ $where: 'malicious' });
    
    expect(response.status).toBe(400);
    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        securityEvent: 'DANGEROUS_INPUT',
        maliciousInput: expect.objectContaining({
          type: 'mongo_operator_or_prototype_access'
        })
      })
    );
  });
});