// Global test setup
process.env.NODE_ENV = 'test';

// Mock logger to prevent test logs from cluttering output
jest.mock('../config/logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
}));