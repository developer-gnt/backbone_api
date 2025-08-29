import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from './enum';
import { PermissionKey } from './permission-key.enum';

export const Authorize = (roles: PermissionKey[]) =>
  SetMetadata(ROLES_KEY, roles);
