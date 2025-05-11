/**
 * Base Controller Class
 * @class BaseController
 * @description Provides foundational controller methods for success/error responses,
 * input validation, and common error handling. All application controllers should
 * extend this class for consistent behavior.
 */
export class BaseController {
    /**
     * Send a standardized success response
     * @static
     * @param {Object} res - Express response object
     * @param {Object} options - Response configuration
     * @param {*} [options.data=null] - Response payload data
     * @param {string} [options.message='Success'] - Human-readable message
     * @param {number} [options.statusCode=200] - HTTP status code
     * @example
     * BaseController.sendSuccess(res, {
     *   data: user,
     *   message: 'User created',
     *   statusCode: 201
     * });
     */
    static sendSuccess(res, { data = null, message = 'Success', statusCode = 200 }) {
        res.status(statusCode).json({
            success: true,
            message,
            data,
        });
    }

    /**
     * Send a standardized error response
     * @static
     * @param {Object} res - Express response object
     * @param {Object} options - Error configuration
     * @param {string} [options.message='Error'] - Human-readable error message
     * @param {number} [options.statusCode=500] - HTTP status code
     * @param {Error} [options.error=null] - Original Error object
     * @example
     * BaseController.sendError(res, {
     *   message: 'Validation failed',
     *   statusCode: 400,
     *   error: validationError
     * });
     */
    static sendError(res, { message = 'Error', statusCode = 500, error = null }) {
        res.status(statusCode).json({
            success: false,
            message,
            error: error?.message || null, // Safely access error message
        });
    }

    /**
     * Validate required fields in request body
     * @static
     * @param {Object} body - Request body object
     * @param {string[]} requiredFields - Array of required field names
     * @throws {Error} 400 - If any required fields are missing
     * @example
     * BaseController.validateFields(req.body, ['email', 'password']);
     */
    static validateFields(body, requiredFields) {
        const missingFields = requiredFields.filter((field) => !body[field]);
        if (missingFields.length > 0) {
            const err = new Error(`Missing required fields: ${missingFields.join(', ')}`);
            err.statusCode = 400;
            throw err;
        }
    }

    /**
     * Handle MongoDB duplicate key errors
     * @static
     * @param {MongoError} error - MongoDB error object
     * @returns {Error} Formatted error with status code
     * @description Specifically handles E11000 duplicate key errors for email fields.
     * Returns original error for non-duplicate-key cases.
     */
    static handleDuplicateKeyError(error) {
        if (error.code === 11000 && error.keyPattern?.email) {
            const err = new Error('Email already exists');
            err.statusCode = 409; // Conflict status code
            return err;
        }
        return error;
    }

    /**
     * Handle MongoDB database timeout errors
     * @static
     * @param {MongoServerError} error - MongoDB server error
     * @returns {Error} Formatted error with status code
     * @description Identifies and transforms MongoDB timeout errors (code 50)
     * into 504 Gateway Timeout responses.
     */
    static handleDatabaseError(error) {
        if (error.name === 'MongoServerError' && error.code === 50) {
            const err = new Error('Database timeout');
            err.statusCode = 504;
            return err;
        }
        return error;
    }
}