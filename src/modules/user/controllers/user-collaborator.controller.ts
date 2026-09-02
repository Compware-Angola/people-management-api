import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
} from '@nestjs/common'
import {
    ApiBadRequestResponse,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger'

import { CreateUserCollaboratorDto } from '../dto/create-user-collaborator.dto'
import { UserCollaboratorService } from '../services/user-collaborator.service'

@ApiTags('User Collaborators')
@Controller('users/collaborators')
export class UserCollaboratorController {
    constructor(
        private readonly userCollaboratorService: UserCollaboratorService,
    ) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Criar conta de colaborador',
        description:
            'Cria uma pessoa e a respetiva conta de colaborador dentro de uma única transação.',
    })
    @ApiCreatedResponse({
        description:
            'Pessoa e conta de colaborador criadas com sucesso.',
    })
    @ApiBadRequestResponse({
        description:
            'Dados enviados são inválidos.',
    })
    @ApiConflictResponse({
        description:
            'Já existe uma conta utilizando o email informado.',
    })
    async create(
        @Body() dto: CreateUserCollaboratorDto,
    ) {
        return this.userCollaboratorService.create(dto)
    }
}