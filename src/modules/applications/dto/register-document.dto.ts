import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsString, IsNotEmpty } from 'class-validator'

export class RegisterDocumentDto {
  @ApiProperty()
  @IsInt()
  declare documentTypeId: number

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  declare key: string
}
