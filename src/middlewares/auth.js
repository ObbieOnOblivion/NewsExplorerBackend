import JwtTools from '../utils/jwtTools.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';

/**
 * Middleware: Verifies JWT and attaches authenticated user context to the request.
 * Rejects requests without valid tokens or with tokens linked to outdated credentials.
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // Extract token from Authorization header or cookie
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      throw new UnauthorizedError('Authentication required.');
    }

    // Decode and validate token signature
    const decoded = await JwtTools.verifyToken(token);

    // Ensure associated user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      throw new UnauthorizedError('User no longer exists.');
    }

    // Invalidate token if credentials were changed after issuance
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      throw new UnauthorizedError('Token expired due to recent password change.');
    }

    // Set user context for downstream access
    req.user = decoded;
    res.locals.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware: Enforces role-based access control.
 * @param  {...string} roles - List of authorized roles for the route.
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('Insufficient permissions.');
    }
    next();
  };
};

/**
 * Utility: Issues JWT, sets it as a cookie, and sends sanitized user response.
 * @param {Object} user - Authenticated user object
 * @param {number} statusCode - HTTP status code
 * @param {Object} res - Express response object
 */
export const sendTokenResponse = (user, statusCode, res) => {
  const token = JwtTools.signToken({ id: user._id, role: user.role });
  const cookieOptions = JwtTools.getCookieOptions();

  res.cookie('jwt', token, cookieOptions);

  // Exclude sensitive fields before response
  user.password = undefined;
  user.passwordChangedAt = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user }
  });
};
