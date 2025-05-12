/**
 * User Controller Module
 * @module controllers/userController
 * @description Handles all user-related operations including registration, 
 * login, updates, and deletions. Extends BaseController for common functionality.
 */

import { BaseController } from './baseController.js';
import { UserRepository } from '../repositories/userRepository.js';
import { User } from '../models/schema.js';
import { MongoDBAdapter } from '../adapters/MongoDBAdapter.js';

// we need a logger here 

// Initialize User Repository with Mongoose model and DB adapter
const userRepo = new UserRepository(User, MongoDBAdapter);

/**
 * User Controller Class
 * @class UserController
 * @extends BaseController
 * @description Provides static methods for user management operations
 */
export default class UserController extends BaseController {
    /**
     * Register a new user
     * @static
     * @async
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     * @returns {Promise<void>}
     * @throws {UnauthorizedError} If email already exists
     */
    static async register(req, res, next) {
        try {
            // Validate required fields
            BaseController.validateFields(req.body, ['email', 'password', 'name']);

            // Create user in database
            const user = await userRepo.createUser(req.body);

            // Remove sensitive data before response
            const userWithoutPassword = user.toObject();
            delete userWithoutPassword.password;

            // Send success response
            BaseController.sendSuccess(res, {
                data: { user: userWithoutPassword },
                message: 'User registered successfully',
                statusCode: 201,
            });

        } catch (error) {
            // Handle duplicate email errors
            next(BaseController.handleDuplicateKeyError(error));
        }
    }

    /**
     * Authenticate user and return JWT token
     * @static
     * @async
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     * @returns {Promise<void>}
     * @throws {UnauthorizedError} If credentials are invalid
     */
    static async login(req, res, next) {
        try {
            // Validate required fields
            BaseController.validateFields(req.body, ['email', 'password']);

            // 1) Check if user exists and password is correct
            // const currentUser = await User.findOne(
            //     { email: req.body.email },
            //     { select: '+password +role' } // Include password and role
            // );

             const currentUser = await User.findOne({ email: req.body.email })
              .select('+password +role');

            // 2) Verify user exists and password matches
            if (!currentUser || !(await currentUser.correctPassword(req.body.password))) {
                return BaseController.sendError(res, {
                    statusCode: 401,
                    message: 'Incorrect email or password',
                });
            }

            // 3) Update last login timestamp
            currentUser.lastLogin = Date.now();
            await currentUser.save({ validateBeforeSave: false });

            // 4) Generate JWT token
            const token = currentUser.generateAuthToken();

            // 5) Remove password from output
            const userWithoutPassword = currentUser.toObject();
            delete userWithoutPassword.password;

            // 6) Send token to client
            BaseController.sendSuccess(res, {
                data: {
                    token,
                    user: userWithoutPassword
                },
                message: 'Login successful'
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * Update user information
     * @static
     * @async
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     * @returns {Promise<void>}
     * @throws {NotFoundError} If user not found
     * @throws {DatabaseError} If database operation fails
     */
    static async update(req, res, next) {
        try {
            // Validate required fields
            BaseController.validateFields(req.body, ['id', 'name']);

            // Update user in database
            const updatedUser = await userRepo.updateUser(
                { _id: req.body.id }, // Filter by ID
                { $set: { name: req.body.name } }, // Update operation
                {
                    new: true, // Return updated document
                    projection: { password: 0 } // Exclude password field
                }
            );

            // Handle user not found
            if (!updatedUser) {
                return BaseController.sendError(res, {
                    statusCode: 404,
                    message: 'User not found',
                });
            }

            // Send success response with updated user
            BaseController.sendSuccess(res, { data: updatedUser });

        } catch (error) {
            // Handle database errors
            next(BaseController.handleDatabaseError(error));
        }
    }

    /**
     * Delete a user
     * @static
     * @async
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     * @returns {Promise<void>}
     * @throws {NotFoundError} If user not found
     */
    static async delete(req, res, next) {
        try {
            // Validate required field
            BaseController.validateFields(req.query, ['id']);

            // Delete user from database
            const user = await userRepo.deleteUser(
                { _id: req.query.id }, // Filter by ID
                { projection: { password: 0 } } // Exclude password field
            );

            // Handle user not found
            if (!user) {
                return BaseController.sendError(res, {
                    statusCode: 404,
                    message: 'User not found',
                });
            }

            // Send success response with deleted user
            BaseController.sendSuccess(res, { data: user });

        } catch (error) {
            // Forward error to error handler
            next(error);
        }
    }
}