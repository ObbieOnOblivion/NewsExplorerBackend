import { MongoClient } from 'mongodb';
// consider thinking in the direction of TypeOrm/Prisma/Sequelize

export class MongoDBAdapter {
  #client = null;
  #db = null;
  #logger = null;

  /**
   * Set logger instance
   * @param {object} logger - Logger instance
   */
  setLogger(logger) {
    this.#logger = logger;
  }

  /**
   * Connect to MongoDB
   * @param {object} config - Configuration object
   * @param {string} config.connectionString - MongoDB connection string
   * @param {string} config.dbName - Database name
   * @param {string} [config.username] - Optional username
   * @param {string} [config.password] - Optional password
   */
  async connect(config) {
    try {

      if (config.logger) {
        this.#logger = config.logger;
      }

      const options = {
        retryWrites: true,
        retryReads: true,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000
      };

      // Only add auth if credentials are provided
      if (config.username && config.password) {
        options.auth = {
          username: config.username,
          password: config.password
        };
      }

      // Only enable TLS for remote connections
      if (!config.connectionString.includes('localhost') && 
          !config.connectionString.includes('127.0.0.1')) {
        options.tls = true;
      }

      this.#client = new MongoClient(config.connectionString, options);
      await this.#client.connect();
      this.#db = this.#client.db(config.dbName);
      this.#log(`Connected to MongoDB: ${config.dbName}`);
      return this;
    } catch (error) {
      this.#handleError('Connection failed', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.#client) {
        await this.#client.close();
        this.#log('Disconnected from MongoDB');
      }
    } catch (error) {
      this.#handleError('Disconnection failed', error);
      throw error;
    } finally {
      this.#cleanup();
    }
  }

  async create(collectionName, data) {
    this.#verifyConnection();
    const collection = this.#getCollection(collectionName);
    const result = await collection.insertOne(data);
    return result.insertedId;
  }

  async find(collectionName, query = {}, options = {}) {
    this.#verifyConnection();
    const collection = this.#getCollection(collectionName);
    return collection.find(query, options).toArray();
  }

  async findOne(collectionName, query = {}) {
    this.#verifyConnection();
    const collection = this.#getCollection(collectionName);
    return collection.findOne(query);
  }

  async update(collectionName, query, updates) {
    this.#verifyConnection();
    const collection = this.#getCollection(collectionName);
    const result = await collection.updateMany(query, { $set: updates });
    return result.modifiedCount;
  }

  async delete(collectionName, query) {
    this.#verifyConnection();
    const collection = this.#getCollection(collectionName);
    const result = await collection.deleteMany(query);
    return result.deletedCount;
  }

  // Private methods
  #getCollection(collectionName) {
    if (!collectionName || typeof collectionName !== 'string') {
      throw new Error('Invalid collection name');
    }
    return this.#db.collection(collectionName);
  }

  #verifyConnection() {
    if (!this.#db) {
      throw new Error('Database not connected. Call connect() first.');
    }
  }

  #log(message) {
    if (this.#logger) {
      this.#logger.info(`[MongoDBAdapter] ${message}`);
    } else {
      console.log(`[MongoDBAdapter] ${new Date().toISOString()} - ${message}`);
    }
  }

  #handleError(context, error) {
    if (this.#logger) {
      this.#logger.error(`[MongoDBAdapter] ${context}:`, error);
    } else {
      console.error(`[MongoDBAdapter] ${new Date().toISOString()} - ${context}:`, error.message);
    }
    // this.#cleanup();
  }

  #cleanup() {
    this.#client = null;
    this.#db = null;
  }
}