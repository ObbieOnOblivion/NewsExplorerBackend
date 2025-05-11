import Joi from 'joi';
import validator from 'validator';
import mongoose from 'mongoose';
import { validate as validateUUID } from 'uuid';

class Validator {
  // Common validation rules
  static #emailRule = Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!validator.isEmail(value)) {
        return helpers.message('Please provide a valid email');
      }
      return value;
    })
    .messages({
      'string.empty': 'Email is required',
      'any.required': 'Email is required',
    });

  static #passwordRule = Joi.string()
    .required()
    .min(8)
    .max(100)
    // Require at least 1 uppercase, 1 lowercase, 1 number, and 1 special character
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required',
    });

  static #nameRule = Joi.string()
    .required()
    .trim()
    .max(50)
    .messages({
      'string.empty': 'Name is required',
      'string.max': 'Name cannot exceed 50 characters',
      'any.required': 'Name is required',
    });

  // Versatile ID validation (MongoDB ObjectId, UUID, or number)
  static #idRule = Joi.alternatives().try(
    Joi.string().custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }, 'MongoDB ObjectId'),
    Joi.number().integer().positive(),
    Joi.string().custom((value, helpers) => {
      if (!validateUUID(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }, 'UUID')
  ).messages({
    'alternatives.match': 'Invalid ID format. Must be a valid MongoDB ObjectId, UUID, or positive number'
  });

  // Validate registration
  static validateRegister(req, res, next) {
    const schema = Joi.object({
      email: Validator.#emailRule,
      password: Validator.#passwordRule,
      name: Validator.#nameRule
    });

    Validator._validateSchema(schema, req, res, next);
  }

  // Validate update
  static validateUpdate(req, res, next) {
    const schema = Joi.object({
      id: Validator.#idRule.required(),
      name: Validator.#nameRule
    });

    Validator._validateSchema(schema, req, res, next);
  }

  // Validate login
  static validateLogin(req, res, next) {
    const schema = Joi.object({
      email: Validator.#emailRule,
      password: Validator.#passwordRule,
    });

    Validator._validateSchema(schema, req, res, next);
  }

  // Private validation handler
  static _validateSchema(schema, req, res, next) {
    const validationOptions = {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    };

    const { error, value } = schema.validate(req.body, validationOptions);
    
    if (error) {
      const errors = error.details.map((err) => ({
        field: err.path[0],
        message: err.message.replace(/['"]/g, ''),
        type: err.type
      }));
      return res.status(400).json({ errors });
    }

    // Replace req.body with the validated and sanitized values
    req.body = value;
    next();
  }
}

export default Validator;