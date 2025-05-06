// userRepository.js
export class UserRepository {
    constructor(mongooseModel, rawAdapter) {
      this.model = mongooseModel;
      this.adapter = rawAdapter;
    }
  
    // Use Mongoose for normal operations 
    async createUser(userData) {
      return this.model.create(userData); // Gets all Mongoose benefits
    }
  
    async deleteUser(userData) {
      return this.model.delete(userData); // Gets all Mongoose benefits
    }
  
    // Use raw adapter for bulk/batch operations

    async bulkInsertUsers(usersArray) {
      return this.adapter.createMany('users', usersArray); // Faster for bulk
    }
  
    // Use raw for complex aggregations
    async getUserAnalytics() {
      return this.adapter.aggregate('users', [
        { $match: { active: true }},
        { $group: { _id: '$role', count: { $sum: 1 }}}
      ]);
    }
  }