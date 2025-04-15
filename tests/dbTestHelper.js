// tests/dbTestHelper.js
const { connectDB, mongoose } = require('../src/config/db');

module.exports = {
  setupTestDB: async () => {
    await connectDB();
  },
  clearTestDB: async () => {
    await mongoose.connection.dropDatabase();
  },
  closeTestDB: async () => {
    await mongoose.connection.close();
  }
};