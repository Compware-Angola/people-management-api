// src/commons/decorators/auth-source.decorator.ts
import { SetMetadata } from '@nestjs/common'

export const AUTH_SOURCE_KEY = 'authSource'

export enum AuthSourceEnum {
    DEFAULT = 'DEFAULT',
    PORTAL_CAND = 'PORTAL_CAND',
}

/**
 * Define qual serviço/endpoint remoto deve validar o token nesta rota.
 * Não torna a rota pública — o token continua obrigatório.
 */
export const AuthSource = (source: AuthSourceEnum) =>
    SetMetadata(AUTH_SOURCE_KEY, source)