import jwt from 'jsonwebtoken';
import { env } from './env.js';

export const jwtConfig = {
  secret: env.JWT_SECRET,
  expiresIn: env.JWT_EXPIRES_IN
};

export const signToken = (payload, options = {}) => {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
    ...options
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, jwtConfig.secret);
};

export default {
  jwtConfig,
  signToken,
  verifyToken
};

