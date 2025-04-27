const { MongoDBAdapter } = require('./MongoDBAdapter');
const { MongoMemoryServer } = require('mongodb-memory-server');

describe('MongoDBAdapter', () => {
  let mongoServer;
  let adapter;

  beforeEach(async () => {
    mongoServer = await MongoMemoryServer.create();
    adapter = new MongoDBAdapter();
  });

  afterEach(async () => {
    if (adapter) await adapter.disconnect();
    if (mongoServer) await mongoServer.stop();
  });

  it('should connect and disconnect', async () => {
    const config = {
      connectionString: mongoServer.getUri(),
      dbName: 'testdb'
    };
    await expect(adapter.connect(config)).resolves.toBe(true);
    await expect(adapter.disconnect()).resolves.not.toThrow();
  });
});