import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Request } from 'express'
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator'

declare module 'express' {
  interface Request {
    user: any
  }
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const enablePermissionGuard =
      process.env.ENABLE_PERMISSION_GUARD !== 'false';

    if (!enablePermissionGuard) {
      return true;
    }

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    )

    if (!requiredPermissions) {
      return true
    }

    const { user } = context.switchToHttp().getRequest()

    if (!user || !user.permissions) {
      throw new ForbiddenException('Usuário não possui permissões')
    }

    const req = context.switchToHttp().getRequest<Request>()
    const userPermissions: string[] = req.user?.permissions || []

    if (userPermissions.includes('full_access')) {
      return true
    }

    const hasPermission = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    )

    if (!hasPermission) {
      throw new ForbiddenException('Acesso negado: permissões insuficientes')
    }

    return true
  }
}
