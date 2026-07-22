import { ApiProperty } from '@nestjs/swagger'

export class ApplicationFilesDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  declare identificationDocument: Express.Multer.File

  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  declare cv: Express.Multer.File

  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  declare courseCertificate: Express.Multer.File

  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  declare pedagogicalAggregation: Express.Multer.File

  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
  })
  declare certificates: Express.Multer.File[]
}
