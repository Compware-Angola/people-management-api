import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { EnvService } from 'src/commons/utils/env/env.service'

@Injectable()
export class HashService {
  private readonly hashServiceUrl: string

  constructor(private readonly envService: EnvService) {
    this.hashServiceUrl = this.envService.get('HASH_SERVICE_URL') || ''
  }

  async hash(text: string): Promise<string> {
    try {
      const response = await fetch(`${this.hashServiceUrl}/hash`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ texto: text }),
      })

      if (!response.ok) {
        throw new Error(`Hash service returned ${response.status}`)
      }

      const data = await response.json()
      return data.hash
    } catch (error) {
      console.error('Error calling hash service:', error)
      throw new InternalServerErrorException('Erro ao gerar hash da senha')
    }
  }

  async verify(text: string, hash: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.hashServiceUrl}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ texto: text, hash }),
      })

      if (!response.ok) {
        throw new Error(`Hash service returned ${response.status}`)
      }

      const data = await response.json()
      return Boolean(data.match ?? data.valid ?? data.isValid)
    } catch (error) {
      console.error('Error calling hash verify service:', error)
      throw new InternalServerErrorException('Erro ao verificar a senha')
    }
  }
}
