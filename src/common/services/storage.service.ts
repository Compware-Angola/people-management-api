import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
import { ApplicationFile } from '../types/application-file.type'

type ResponseUpload = {
  message: string
  file: {
    filename: string
    originalname: string
    path: string
    size: number
  }
}

const UPLOAD_API_URL = process.env.UPLOAD_API_URL ?? 'http://[::1]:3001'

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name)

  async upload(file: ApplicationFile): Promise<ResponseUpload> {
    const formData = new FormData()
    const blob = new Blob([Buffer.from(file.buffer)], { type: file.mimeType })
    formData.append('file', blob, file.originalName)

    let response: Response
    try {
      response = await fetch(`${UPLOAD_API_URL}/upload/single`, {
        method: 'POST',
        body: formData,
      })
    } catch (error) {
      this.logger.error('Erro de rede ao contactar o serviço de upload', error)
      throw new InternalServerErrorException(
        'Não foi possível contactar o serviço de armazenamento',
      )
    }

    if (!response.ok) {
      this.logger.error(
        `Upload falhou: ${response.status} ${response.statusText}`,
      )
      throw new InternalServerErrorException('Não foi possível enviar o ficheiro')
    }

    const data = (await response.json()) as ResponseUpload

    return data
  }
}