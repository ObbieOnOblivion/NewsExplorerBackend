import { startServer, connectDB } from '../src/server.js';
import mongoose from 'mongoose';
import app from '../src/app.js';
import logger from '../src/config/logger.js';

jest.mock('../src/app.js', () => {
  const mockApp = {
    locals: {},
    get: jest.fn(),
    listen: jest.fn(() => ({
      close: jest.fn(cb => cb())
    })),
    _test: {
      routes: {
        "GET /health": [
          (req, res) => res.json({ status: 'ok' }) // Actual implementation
        ],
        "GET /": [
          (req, res) => res.send('Server is running')
        ]
      }
    }
  };
  return mockApp;
});

jest.mock('../src/config/logger.js', () => ({
  info: jest.fn(),
  error: jest.fn()
}));

jest.mock('mongoose', () => ({
  connect: jest.fn(),
  connection: {
    readyState: 0
  }
}));

describe('Server Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('connectDB()', () => {
    it('should successfully connect to MongoDB', async () => {
      mongoose.connect.mockResolvedValueOnce();
      await connectDB();
      expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGODB_URI);
      expect(logger.info).toHaveBeenCalledWith('✅ MongoDB connected');
    });

    it('should handle connection errors', async () => {
      const testError = new Error('Connection failed');
      mongoose.connect.mockRejectedValueOnce(testError);
      await expect(connectDB()).rejects.toThrow(testError);
      expect(logger.error).toHaveBeenCalledWith(
        '❌ MongoDB connection error:',
        testError
      );
    });
  });

  describe('startServer()', () => {
    it('should initialize server correctly', async () => {
      mongoose.connect.mockResolvedValueOnce();
      const mockServer = { close: jest.fn() };
      app.listen.mockImplementationOnce((port, callback) => {
        callback();
        return mockServer;
      });

      const server = await startServer();

      expect(app.get).toHaveBeenCalledWith('/', expect.any(Function));
      
      expect(app.listen).toHaveBeenCalledWith(3000, expect.any(Function));
      expect(logger.info).toHaveBeenCalledWith('🚀 Server running on port 3000');
      
      process.emit('SIGTERM');
      expect(mockServer.close).toHaveBeenCalled();
    });

    it('should handle startup failures', async () => {
      const testError = new Error('DB connection failed');
      mongoose.connect.mockRejectedValueOnce(testError);
      
      await expect(startServer()).rejects.toThrow(testError);
      expect(logger.error).toHaveBeenCalledWith(
        '🔥 Failed to start server:',
        testError
      );
    });
  });

  describe('GET /', () => {
    it('should return "Server is running"', async () => {
      await startServer();
      const routeHandler = app.get.mock.calls.find(call => call[0] === '/')[1];
      
      const req = {};
      const res = { send: jest.fn() };
      await routeHandler(req, res);
      
      expect(res.send).toHaveBeenCalledWith('Server is running');
    });
  });
});