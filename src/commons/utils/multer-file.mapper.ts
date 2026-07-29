import { ApplicationFile } from '../types/application-file.type'

export function mapMulterFile(file: Express.Multer.File): ApplicationFile {
  return {
    fieldName: file.fieldname,

    originalName: file.originalname,

    mimeType: file.mimetype,

    size: file.size,

    buffer: file.buffer,
  }
}
