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

    const requiredRoles = this.reflector.getAllAndOverride(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredRoles) {
      const { user } = context.switchToHttp().getRequest();
      const isUserHasAccess = user.role.permissions.some(
        (role: string) => role === requiredRoles?.[0],
      );
      return isUserHasAccess;
    }
    return true;
  }
}
