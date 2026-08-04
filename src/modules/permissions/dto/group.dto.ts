import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
} from 'class-validator'

export class CreateGroupDto {
  @ApiProperty({
    description: 'Descrição do grupo',
    example: 'Administradores',
  })
  @IsString()
  @IsNotEmpty()
  description: string

  @ApiPropertyOptional({
    description:
      'Departamento a que o grupo pertence (um grupo pertence a um único departamento)',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  departmentId?: number

  @ApiPropertyOptional({
    description: 'Estado do grupo (0 = Inativo, 1 = Ativo)',
    default: 1,
    enum: [0, 1],
  })
  @IsNumber()
  @IsOptional()
  @IsEnum([0, 1])
  status?: number
}

export class UpdateGroupDto {
  @ApiPropertyOptional({
    description: 'Descrição do grupo',
    example: 'Administradores',
  })
  @IsString()
  @IsOptional()
  description?: string

  @ApiPropertyOptional({
    description:
      'Departamento a que o grupo pertence (um grupo pertence a um único departamento)',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  departmentId?: number

  @ApiPropertyOptional({
    description: 'Estado do grupo (0 = Inativo, 1 = Ativo)',
    default: 1,
    enum: [0, 1],
  })
  @IsNumber()
  @IsOptional()
  @IsEnum([0, 1])
  status?: number
}

export class AssignPermissionsDto {
  @ApiProperty({ type: [Number], description: 'IDs das permissões' })
  @IsArray()
  @IsNumber({}, { each: true })
  permissionIds: number[]
}

export class AssignUsersDto {
  @ApiProperty({ type: [Number], description: 'IDs dos usuários' })
  @IsArray()
  @IsNumber({}, { each: true })
  userIds: number[]
}
