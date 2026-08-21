import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common'

import axios, { AxiosInstance, isAxiosError } from 'axios'
import { EnvService } from '../utils/env/env.service'

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
  private readonly authServiceUrl: string

  constructor(private readonly envService: EnvService) {
    this.http = axios.create({ timeout: 8000 })

    const baseUrl = this.envService.get('HASH_SERVICE_URL')
    if (!baseUrl) {
      throw new Error('HASH_SERVICE_URL não configurada')
    }
    this.authServiceUrl = `${baseUrl}/auth/validate-token`
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const token = this.extractTokenFromHeader(request)

    if (!token) {
      throw new UnauthorizedException('Token não fornecido')
    }

    const user = await this.validateToken(token)
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

  private async validateToken(token: string): Promise<DecodedUserPayload> {
    try {
      const { data } = await this.http.get<ValidateTokenResponse>(
        this.authServiceUrl,
        { headers: { Authorization: `Bearer ${token}` } },
      )

      if (!data.valid || !data.user) {
        throw new UnauthorizedException(
          'Token inválido ou usuário não encontrado',
        )
      }

      return data.user
    } catch (error) {
      // Se já é uma exceção HTTP nossa (ex: UnauthorizedException acima), apenas repropaga
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
