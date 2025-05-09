// baseController.js
export class BaseController {
    /**
     * Standard success response
     */
    static sendSuccess(res, { data = null, message = 'Success', statusCode = 200 }) {
        res.status(statusCode).json({
            success: true,
            message,
            data,
        });
    }

    /**
     * Standard error response
     */
    static sendError(res, { message = 'Error', statusCode = 500, error = null }) {
        res.status(statusCode).json({
            success: false,
            message,
            error: error?.message || null,
        });
    }

    /**
     * Validate required fields in request body
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
     * Handle duplicate key errors (MongoDB E11000)
     */
    static handleDuplicateKeyError(error) {
        if (error.code === 11000 && error.keyPattern?.email) {
            const err = new Error('Email already exists');
            err.statusCode = 409;
            return err;
        }
        return error;
    }

    /**
     * Handle database timeouts
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