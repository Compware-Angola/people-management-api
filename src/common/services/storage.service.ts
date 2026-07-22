import { Injectable } from '@nestjs/common'
import { ApplicationFile } from '../types/application-file.type'

@Injectable()
export class StorageService {
  upload(file: ApplicationFile) {
    console.log(file.originalName)
    console.log(file.mimeType)
    console.log(file.buffer)
    return 'https://storage/cv.pdf'
  }
}
