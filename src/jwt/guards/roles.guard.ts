import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/decorators/roles.decorator';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Injectable()
export class RoleGuards implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) return true;

    // Define the type for the request object
    const request = context
      .switchToHttp()
      .getRequest<Record<string, unknown>>();
    const user = request.user as { role: UserRole };
    const hasRole = requiredRoles.includes(user?.role);
    if (!hasRole) {
      throw new ForbiddenException('You do not have permission!');
    }

    // Otherwise, allow access
    return true;
  }
}
