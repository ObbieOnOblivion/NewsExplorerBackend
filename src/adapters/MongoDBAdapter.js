import { MongoClient } from 'mongodb';

export class MongoDBAdapter {
  // Private fields
  #client = null;
  #db = null;
  #isConnected = false;

  constructor() {
    // No public properties needed
  }

  async connect(config) {
    try {
      this.#client = new MongoClient(config.connectionString, {
        tls: true,
        auth: {
          username: config.username,
          password: config.password
        },
        retryWrites: true,
        retryReads: true,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000
      });
      
      await this.#client.connect();
      this.#db = this.#client.db(config.dbName);
      this.#isConnected = true;
      this.#log('MongoDB connected successfully');
      return true;
    } catch (error) {
      this.#handleConnectionError(error);
      throw error;
    }
  }

  async disconnect() {
    if (this.#client) {
      await this.#client.close();
      this.#client = null;
      this.#db = null;
      this.#isConnected = false;
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
    if (!this.#isConnected) {
      throw new Error('Database not connected. Call connect() first.');
    }
  }

  #log(message) {
    console.log(`[MongoDBAdapter] ${message}`);
  }

  #handleConnectionError(error) {
    this.#log(`Connection error: ${error.message}`);
    this.#client = null;
    this.#db = null;
    this.#isConnected = false;
  }
}