import { ApiProperty } from '@nestjs/swagger'
import {
    IsEmail,
    IsString,
    Matches,
    MinLength,
} from 'class-validator'

export class CreateUserCollaboratorDto {
    @ApiProperty({
        example: 'johndoe@email.com',
    })
    @IsEmail({}, {
        message: 'Informe um email válido',
    })
    email: string
    @ApiProperty({
        example: 'senhaTeste123@',
    })
    @IsString({
        message: 'A senha deve ser um texto',
    })
    @MinLength(8, {
        message: 'A senha deve ter pelo menos 8 caracteres',
    })
    @Matches(/[a-z]/, {
        message: 'A senha deve conter pelo menos uma letra minúscula',
    })
    @Matches(/[A-Z]/, {
        message: 'A senha deve conter pelo menos uma letra maiúscula',
    })
    @Matches(/\d/, {
        message: 'A senha deve conter pelo menos um número',
    })
    @Matches(/[@$!%*?&]/, {
        message:
            'A senha deve conter pelo menos um caractere especial (@, $, !, %, *, ? ou &)',
    })
    password: string

    @ApiProperty({
        example: 'John Doe',
    })
    @IsString({
        message: 'O nome deve ser um texto',
    })
    @MinLength(3, {
        message: 'O nome deve ter pelo menos 3 caracteres',
    })
    @Matches(/^[A-Za-z ]+$/, {
        message: 'O nome deve conter apenas letras',
    })
    fullName: string
}