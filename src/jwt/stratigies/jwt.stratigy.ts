import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_ACCESS_SECRET')!,
    });
  }

  validate(payload: {
    userId: string;
    email: string;
    role: string;
    isAuthenticated: boolean;
  }) {
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      isAuthenticated: payload.isAuthenticated,
    };
  }
}
