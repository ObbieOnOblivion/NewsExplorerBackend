import JwtTools from '../utils/jwtTools.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';

/**
 * Protect routes - require valid JWT
 */
export const protect = async (req, res, next) => {
  try {
    // 1) Get token from headers, cookies, or query
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      throw new UnauthorizedError('You are not logged in! Please log in to get access.');
    }

    // 2) Verify token
    const decoded = await JwtTools.verifyToken(token);

    // 3) Check if user still exists (optional - could be DB call)
    // const currentUser = await User.findById(decoded.id);
    // if (!currentUser) {
    //   throw new UnauthorizedError('The user belonging to this token no longer exists.');
    // }

    // 4) Check if user changed password after token was issued
    // if (currentUser.changedPasswordAfter(decoded.iat)) {
    //   throw new UnauthorizedError('User recently changed password! Please log in again.');
    // }

    // Grant access to protected route
    req.user = decoded;
    res.locals.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Restrict routes to specific roles
 * @param  {...string} roles - Allowed roles
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('You do not have permission to perform this action');
    }
    next();
  };
};

/**
 * Generate and send JWT token
 */
export const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = JwtTools.signToken({ id: user._id, role: user.role });

  // Cookie options
  const cookieOptions = JwtTools.getCookieOptions();

  // Send cookie
  res.cookie('jwt', token, cookieOptions);

  // Remove sensitive data from output
  user.password = undefined;
  user.passwordChangedAt = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user }
  });
};