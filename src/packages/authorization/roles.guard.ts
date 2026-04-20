import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Scope,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/public-strategy';
import { UserService } from 'src/user/user.service';
import { ROLES_KEY } from './enum';

@Injectable({ scope: Scope.REQUEST })
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles?.length) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      return false;
    }

    if (typeof user.role === 'string' && user.role.toLowerCase() === 'admin') {
      return true;
    }

    const permissions = Array.isArray(user.permissions)
      ? user.permissions
      : Array.isArray(user.role?.permissions)
        ? user.role.permissions
        : [];

    return requiredRoles.some((role: string) => permissions.includes(role));
  }
}
