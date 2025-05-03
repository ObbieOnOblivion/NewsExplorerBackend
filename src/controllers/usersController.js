import { User } from '../models/schema.js';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
import logger from '../config/logger.js';

class UserController {
  /**
   * Register a new user
   */
  async register(req, res, next) {
    try {
      const { email, password, name } = req.body;
      // logger.info(req.headers.nany)
      // logger.info(req.body[0], req.body)
      
      // // Check if user exists
      // const existingUser = await User.findOne({ email });
      // if (existingUser) {
      //   return res.status(400).json({ error: 'Email already in use' });
      // }

      // // Create new user
      // const user = await User.create({
      //   email,
      //   password,
      //   name
      // });

      // // Generate JWT
      // const token = user.generateAuthToken();

      // // Remove password from response
      // user.password = undefined;

      res.status(201).json({
        status: 'success',
        data: `${req.header} ---- ${name} -> ${password}`
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Check if user exists and password is correct
      const user = await User.findOne({ email }).select('+password');
      if (!user || !(await user.correctPassword(password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Update last login
      user.lastLogin = Date.now();
      await user.save();

      // Generate JWT
      const token = user.generateAuthToken();

      // Remove password from response
      user.password = undefined;

      res.json({
        status: 'success',
        data: { user, token }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(req, res, next) {
    try {
      const user = await User.findById(req.user.id);
      res.json({
        status: 'success',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req, res, next) {
    try {
      // Filter out unwanted fields
      const filteredBody = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email
      };

      const user = await User.findByIdAndUpdate(
        req.user.id,
        filteredBody,
        { new: true, runValidators: true }
      );

      res.json({
        status: 'success',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(req, res, next) {
    try {
      await User.findByIdAndUpdate(
        req.user.id,
        { isActive: false },
        { new: true }
      );

      res.status(204).json({
        status: 'success',
        data: null
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();