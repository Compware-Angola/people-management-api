import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class CancelRequisitionDto {
  @ApiProperty({
    description: 'Justificativa do cancelamento (obrigatória)',
    example: 'A necessidade foi suprida por outra contratação.',
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  justification: string
}
