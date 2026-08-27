/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { DataSource } from 'typeorm'
import type { Request } from 'express'

import { PERMISSIONS_KEY } from '../decorators/permissions.decorator'
import { PermissionsEnum } from '../enums/permissions.enum'

interface AuthenticatedUser {
  sub: number
  username?: string
  email?: string
}

declare module 'express' {
  interface Request {
    user: AuthenticatedUser
  }
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const enablePermissionGuard =
      process.env.ENABLE_PERMISSION_GUARD !== 'false'

    if (!enablePermissionGuard) {
      return true
    }

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    )

    if (!requiredPermissions?.length) {
      return true
    }

    const request = context.switchToHttp().getRequest<Request>()

    const user = request.user

    if (!user?.sub) {
      throw new ForbiddenException('Usuário não autenticado')
    }

    const userId = Number(user.sub)

    if (Number.isNaN(userId)) {
      throw new ForbiddenException('ID de usuário inválido')
    }

    const permissions = await this.getUserPermissions(userId)
    console.log({ permissions })

    if (permissions.includes(PermissionsEnum.FULL_ACCESS.toLowerCase())) {
      return true
    }

    const hasPermission = requiredPermissions.every((permission) =>
      permissions.includes(permission.toLowerCase()),
    )

    if (!hasPermission) {
      throw new ForbiddenException('Acesso negado: permissões insuficientes')
    }

    return true
  }

  private async getUserPermissions(userId: number): Promise<string[]> {
    const sql = `
    WITH PERMISSOES_ORIGEM AS (
        SELECT
            up.CODIGO_PERMISSAO,
            up.ESTADO,
            1 AS PRIORIDADE
        FROM GP_USUARIOS_PERMISSOES up
        WHERE up.CODIGO_USUARIO = :CODIGO_USUARIO

        UNION ALL

        SELECT
            gp.CODIGO_PERMISSAO,
            1 AS ESTADO,
            2 AS PRIORIDADE
        FROM GP_GRUPOS_USUARIOS gu
        JOIN GP_GRUPOS g
            ON g.CODIGO = gu.CODIGO_GRUPO
           AND g.ESTADO = 1
        JOIN GP_GRUPOS_PERMISSOES gp
            ON gp.CODIGO_GRUPO = gu.CODIGO_GRUPO
           AND gp.ESTADO = 1
        WHERE gu.CODIGO_USUARIO = :CODIGO_USUARIO
          AND gu.ESTADO = 1
    ),
    PERMISSOES_PRIORIZADAS AS (
        SELECT
            CODIGO_PERMISSAO,
            ESTADO,
            ROW_NUMBER() OVER (
                PARTITION BY CODIGO_PERMISSAO
                ORDER BY PRIORIDADE
            ) AS RN
        FROM PERMISSOES_ORIGEM
    )
    SELECT
        p.CODIGO,
        p.SLUG,
        p.DESCRICAO
    FROM PERMISSOES_PRIORIZADAS pp
    JOIN GP_PERMISSOES p
        ON p.CODIGO = pp.CODIGO_PERMISSAO
       AND p.ESTADO = 1
    WHERE pp.RN = 1
      AND pp.ESTADO = 1
    ORDER BY p.DESCRICAO
  `

    const rows = await this.dataSource.query(sql, [userId, userId])

    return rows.map((permission) => permission.SLUG.toLowerCase())
  }
}
