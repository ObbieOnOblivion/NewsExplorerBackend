import { startServer, connectAdapter, dbAdapter } from '../src/server.js';
import app from '../src/app.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

beforeAll(() => {
  process.env.MONGODB_URI = 'mongodb://localhost:27017/testdb';
  process.env.PORT = '3000';
});

beforeEach(() => {
  jest.clearAllMocks();
});

jest.mock('../src/app.js', () => ({
  locals: {},
  get: jest.fn(),
  listen: jest.fn(() => ({
    close: jest.fn(cb => cb())
  }))
}));


jest.mock('../src/adapters/MongoDBAdapter.js', () => {
  return {
    MongoDBAdapter: jest.fn().mockImplementation(() => ({
      setLogger: jest.fn(),
      connect: jest.fn().mockResolvedValue({}),
      disconnect: jest.fn().mockResolvedValue({})
    }))
  };
});

jest.mock('../src/config/logger.js', () => ({
  info: jest.fn(),
  error: jest.fn()
}));

jest.mock('mongoose', () => ({
  connect: jest.fn(() => ({
    connection: {
      readyState: 1,
      on: jest.fn()
    }
  })),
  connection: {
    readyState: 0,
    on: jest.fn()
  }
}));

describe('Server Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('connects mongoose', () => {
    it('connects to MongoDB via Adapter successfully', async () => {
      await connectAdapter();
      
      expect(dbAdapter.connect).toHaveBeenCalledWith({
        connectionString: process.env.MONGODB_URI,
        dbName: expect.any(String), // or specific name if you extract it
        useNewUrlParser: true,
        useUnifiedTopology: true
      });      
    });
  });

  describe('startServer()', () => {
    it('starts the server correctly', async () => {
      await startServer();
      expect(app.listen).toHaveBeenCalledWith(3000, expect.any(Function));
    });
  });
});