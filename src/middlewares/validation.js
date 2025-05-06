import Joi from 'joi';
import validator from 'validator';

class Validator {
  // Validate registration (email, password, name)
  static validateRegister(req, res, next) {
    const schema = Joi.object({
      email: Joi.string()
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
        }),
      password: Joi.string()
        .required()
        .min(8)
        .messages({
          'string.empty': 'Password is required',
          'string.min': 'Password must be at least 8 characters',
          'any.required': 'Password is required',
        }),
      name: Joi.string()
        .required()
        .trim()
        .max(50)
        .messages({
          'string.empty': 'Name is required',
          'string.max': 'Name cannot exceed 50 characters',
          'any.required': 'Name is required',
        }),
    });

    Validator._validateSchema(schema, req, res, next);
  }

  // Validate login (email and password only)
  static validateLogin(req, res, next) {
    const schema = Joi.object({
      email: Joi.string()
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
        }),
      password: Joi.string()
        .required()
        .messages({
          'string.empty': 'Password is required',
          'any.required': 'Password is required',
        }),
    });

    Validator._validateSchema(schema, req, res, next);
  }

  // Private helper to avoid duplicate validation logic
  static _validateSchema(schema, req, res, next) {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((err) => ({
        field: err.path[0],
        message: err.message,
      }));
      return res.status(400).json({ errors });
    }
    next();
  }
}

export default Validator;