export class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
      this.isOperational = true;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized access') {
      super(message, 401);
    }
  }
  
  export class ForbiddenError extends AppError {
    constructor(message = 'Forbidden access') {
      super(message, 403);
    }
  }