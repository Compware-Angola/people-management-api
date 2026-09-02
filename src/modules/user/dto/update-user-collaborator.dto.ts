import { ApiPropertyOptional } from '@nestjs/swagger'
import {
    IsDateString,
    IsEmail,
    IsIn,
    IsInt,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator'

export class UpdateUserCollaboratorDto {
    @ApiPropertyOptional({
        example: 'johndoe@email.com',
        description: 'Email de acesso do colaborador',
    })
    @IsOptional()
    @IsEmail({}, {
        message: 'Informe um email válido',
    })
    email?: string

    @ApiPropertyOptional({
        example: 'john.doe',
        description: 'Nome de utilizador de acesso',
    })
    @IsOptional()
    @IsString({
        message: 'O username deve ser um texto',
    })
    @MinLength(3, {
        message: 'O username deve ter pelo menos 3 caracteres',
    })
    @MaxLength(100)
    username?: string

    @ApiPropertyOptional({
        example: 'John Doe',
        description: 'Nome completo da pessoa',
    })
    @IsOptional()
    @IsString({
        message: 'O nome deve ser um texto',
    })
    @MinLength(3, {
        message: 'O nome deve ter pelo menos 3 caracteres',
    })
    @MaxLength(255)
    fullName?: string

    @ApiPropertyOptional({
        example: '004567890LA042',
        description: 'Número do bilhete de identidade',
    })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    identityDocument?: string

    @ApiPropertyOptional({
        example: '5417896523',
        description: 'Número de identificação fiscal (NIF)',
    })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    taxIdentificationNumber?: string

    @ApiPropertyOptional({
        example: '923000000',
    })
    @IsOptional()
    @IsString()
    @MaxLength(30)
    phone?: string

    @ApiPropertyOptional({
        example: '912000000',
    })
    @IsOptional()
    @IsString()
    @MaxLength(30)
    alternativePhone?: string

    @ApiPropertyOptional({
        example: 'Maria da Silva',
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    motherName?: string

    @ApiPropertyOptional({
        example: 'Manuel da Silva',
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    fatherName?: string

    @ApiPropertyOptional({
        example: 1,
        description: 'Código da nacionalidade',
    })
    @IsOptional()
    @IsInt()
    nationalityId?: number

    @ApiPropertyOptional({
        example: 1,
        description: 'Código do estado civil',
    })
    @IsOptional()
    @IsInt()
    maritalStatusId?: number

    @ApiPropertyOptional({
        example: 1,
        description: 'Código do género',
    })
    @IsOptional()
    @IsInt()
    genderId?: number

    @ApiPropertyOptional({
        example: '1995-06-15',
        description: 'Data de nascimento (YYYY-MM-DD)',
    })
    @IsOptional()
    @IsDateString({}, {
        message: 'A data de nascimento deve estar no formato YYYY-MM-DD',
    })
    birthDate?: string

    @ApiPropertyOptional({
        example: '2018-06-15',
        description: 'Data de emissão do documento (YYYY-MM-DD)',
    })
    @IsOptional()
    @IsDateString({}, {
        message: 'A data de emissão deve estar no formato YYYY-MM-DD',
    })
    documentIssueDate?: string

    @ApiPropertyOptional({
        example: '2028-06-15',
        description: 'Data de expiração do documento (YYYY-MM-DD)',
    })
    @IsOptional()
    @IsDateString({}, {
        message: 'A data de expiração deve estar no formato YYYY-MM-DD',
    })
    documentExpirationDate?: string

    @ApiPropertyOptional({
        example: 1,
        description: 'Estado da pessoa (1 = ativo, 0 = inativo)',
    })
    @IsOptional()
    @IsIn([0, 1], {
        message: 'O estado deve ser 0 ou 1',
    })
    status?: number
}
