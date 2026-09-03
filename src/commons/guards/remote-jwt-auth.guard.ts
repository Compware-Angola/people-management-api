import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import axios, { AxiosInstance, isAxiosError } from 'axios'
import { EnvService } from '../utils/env/env.service'
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'
import {
  AUTH_SOURCE_KEY,
  AuthSourceEnum,
} from '../decorators/auth-source.decorator'

interface ValidateTokenResponse {
  valid: boolean
  user?: DecodedUserPayload
}

export interface DecodedUserPayload {
  username: string
  nome: string
  sub: number
  permissions: string[]
  groups: any[]
  iat: number
  exp: number
}

@Injectable()
export class RemoteJwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(RemoteJwtAuthGuard.name)
  private readonly http: AxiosInstance
  private readonly authServiceUrls: Record<AuthSourceEnum, string>

  constructor(
    private readonly envService: EnvService,
    private readonly reflector: Reflector,
  ) {
    this.http = axios.create({ timeout: 8000 })

    const baseUrl = this.envService.get('HASH_SERVICE_URL')
    if (!baseUrl) {
      throw new Error('HASH_SERVICE_URL não configurada')
    }

    this.authServiceUrls = {
      [AuthSourceEnum.DEFAULT]: `${baseUrl}/global/auth/current-user`,
      [AuthSourceEnum.PORTAL_CAND]: `${baseUrl}/auth/validate-token`,
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    )

    const authSource =
      this.reflector.getAllAndOverride<AuthSourceEnum>(AUTH_SOURCE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? AuthSourceEnum.DEFAULT

    const request = context.switchToHttp().getRequest()
    const token = this.extractTokenFromHeader(request)

    // Rota pública: só valida o token se ele vier, mas não bloqueia se não vier
    if (isPublic) {
      if (!token) {
        return true
      }

      try {
        request.user = await this.validateToken(token, authSource)
      } catch {
        // token inválido/expirado em rota pública: ignora e segue como anônimo
      }

      return true
    }

    // Rota protegida normal, mas validando contra a fonte definida (default ou outra)
    if (!token) {
      throw new UnauthorizedException('Token não fornecido')
    }

    const user = await this.validateToken(token, authSource)
    request.user = user
    return true
  }

  private extractTokenFromHeader(request: any): string | null {
    const authHeader = request.headers?.authorization
    if (!authHeader || typeof authHeader !== 'string') return null

    const [scheme, token] = authHeader.split(' ')
    if (scheme?.toLowerCase() !== 'bearer' || !token) return null

    return token
  }

  private async validateToken(
    token: string,
    source: AuthSourceEnum,
  ): Promise<DecodedUserPayload> {
    const url = this.authServiceUrls[source]
    if (!url) {
      this.logger.error(`Nenhuma URL de validação configurada para '${source}'`)
      throw new ServiceUnavailableException(
        'Serviço de autenticação indisponível',
      )
    }

    try {
      const { data } = await this.http.get<ValidateTokenResponse>(url, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!data.valid || !data.user) {
        throw new UnauthorizedException(
          'Token inválido ou usuário não encontrado',
        )
      }

      return data.user
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }

      if (isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new ServiceUnavailableException('Auth service timeout')
        }
        if (error.response?.status === 401) {
          throw new UnauthorizedException('Token inválido')
        }

        this.logger.error('Falha ao validar token remotamente', {
          message: error.message,
          code: error.code,
          status: error.response?.status,
          source,
        })
      } else {
        this.logger.error('Erro inesperado ao validar token', error)
      }

      throw new ServiceUnavailableException(
        'Serviço de autenticação indisponível',
      )
    }
  }
}