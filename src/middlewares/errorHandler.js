import logger from '../config/logger.js';
import AppError from '../utils/error/AppError.js';

const errorHandler = (err, req, res, next) => {
  // Convert Error to AppError if needed
  if (!(err instanceof AppError)) {
    err = new AppError(
      err.message || 'Something went wrong',
      err.statusCode || 500,
      err.details || {}
    );
  }

  // Log the error
  logger.error({
    message: err.message,
    statusCode: err.statusCode,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    timestamp: new Date().toISOString(),
  });

  // Response for development
  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
      details: err.details,
    });
  }

  // Production error response
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    ...(err.details && { details: err.details }),
  });
};

export default errorHandler;