import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { promisify } from 'util';

const signAsync = promisify(jwt.sign);
const verifyAsync = promisify(jwt.verify);

// Generate secure random secret if not set
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_COOKIE_EXPIRES = process.env.JWT_COOKIE_EXPIRES || 7;

class JwtTools {
  /**
   * Sign a new JWT token
   * @param {Object} payload - Data to include in token
   * @returns {Promise<string>} JWT token
   */
  static async signToken(payload) {
    return signAsync(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      algorithm: 'HS256'
    });
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token to verify
   * @returns {Promise<Object>} Decoded token payload
   */
  static async verifyToken(token) {
    return verifyAsync(token, JWT_SECRET, {
      algorithms: ['HS256']
    });
  }

  /**
   * Create cookie options for JWT
   * @returns {Object} Cookie options
   */
  static getCookieOptions() {
    const isProduction = process.env.NODE_ENV === 'production';
    
    return {
      expires: new Date(Date.now() + JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      domain: process.env.DOMAIN
    };
  }
}

export default JwtTools;
export { JWT_SECRET };