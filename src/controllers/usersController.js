// userController.js
import { BaseController } from './baseController.js';
import { UserRepository } from '../repositories/userRepository.js';
import { User } from '../models/schema.js';
import { MongoDBAdapter } from '../adapters/MongoDBAdapter.js';

const userRepo = new UserRepository(User, MongoDBAdapter);

export default class UserController extends BaseController {
    static async register(req, res, next) {
        try {
            // Validate fields
            BaseController.validateFields(req.body, ['email', 'password', 'name']);

            // Create user
            const user = await userRepo.createUser(req.body);
            const userWithoutPassword = user.toObject();
            delete userWithoutPassword.password;

            // Success response
            BaseController.sendSuccess(res, {
                data: { user: userWithoutPassword },
                message: 'User registered successfully',
                statusCode: 201,
            });

        } catch (error) {
            next(BaseController.handleDuplicateKeyError(error));
        }
    }

    static async update(req, res, next) {
        try {
            BaseController.validateFields(req.body, ['id', 'name']);

            const updatedUser = await userRepo.updateUser(
                { _id: req.body.id },
                { $set: { name: req.body.name } },
                { new: true, projection: { password: 0 } }
            );

            if (!updatedUser) {
                return BaseController.sendError(res, {
                    statusCode: 404,
                    message: 'User not found',
                });
            }

            BaseController.sendSuccess(res, { data: updatedUser });

        } catch (error) {
            next(BaseController.handleDatabaseError(error));
        }
    }

    static async delete(req, res, next) {
        try {
            BaseController.validateFields(req.query, ['id']);

            const user = await userRepo.deleteUser(
                { _id: req.query.id },
                { projection: { password: 0 } }
            );

            if (!user) {
                return BaseController.sendError(res, {
                    statusCode: 404,
                    message: 'User not found',
                });
            }

            BaseController.sendSuccess(res, { data: user });

        } catch (error) {
            next(error);
        }
    }
}