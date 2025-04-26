// src/controllers/userController.js
import User from '../models/users.js';

// @desc    Get all users
// @route   GET /api/users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message,
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'No user found',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(`Error fetching user ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message,
    });
  }
};

// @desc    Create user
// @route   POST /api/users
export const createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: messages,
      });
    }
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message,
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
export const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'No user found',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: messages,
      });
    }
    console.error(`Error updating user ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message,
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'No user found',
      });
    }

    res.json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error(`Error deleting user ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message,
    });
  }
};
