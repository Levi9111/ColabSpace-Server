import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

export const generateToken = (
  jwtPayload: {
    userId: string;
    email: string;
    isAuthenticated: boolean;
  },
  secret: string,
  expiresIn: string,
) => {
  return jwt.sign(jwtPayload, secret, {
    expiresIn,
  });
};

export const verifyToken = (token: string, secret: string) => {
  try {
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch {
    throw new UnauthorizedException('Unauthorized Access!');
  }
};
