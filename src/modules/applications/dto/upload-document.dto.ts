import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsInt, IsNotEmpty } from 'class-validator'

export class UploadDocumentDto {
  @ApiProperty({
    description: 'ID do tipo de documento (ver enum TipoDocumentoNecessario)',
    example: 13,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  documentTypeId: number
}
