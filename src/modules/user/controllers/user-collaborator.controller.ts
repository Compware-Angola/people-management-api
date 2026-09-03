import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger'

import { CreateUserCollaboratorDto } from '../dto/create-user-collaborator.dto'
import { UpdateUserCollaboratorDto } from '../dto/update-user-collaborator.dto'
import { ListUserCollaboratorQueryDto } from '../dto/list-user-collaborator-query.dto'
import { UserCollaboratorService } from '../services/user-collaborator.service'
import {
  DecodedUserPayload,
  RemoteJwtAuthGuard,
} from 'src/commons/guards/remote-jwt-auth.guard'
import { PermissionsGuard } from 'src/commons/guards/permissions.guard'
import { AuthSource, AuthSourceEnum } from 'src/commons/decorators/auth-source.decorator'

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
    description: 'Pessoa e conta de colaborador criadas com sucesso.',
  })
  @ApiBadRequestResponse({
    description: 'Dados enviados são inválidos.',
  })
  @ApiConflictResponse({
    description: 'Já existe uma conta utilizando o email informado.',
  })
  async create(@Body() dto: CreateUserCollaboratorDto) {
    return this.userCollaboratorService.create(dto)
  }

  @Get()
  @UseGuards(RemoteJwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar colaboradores',
    description:
      'Lista paginada de colaboradores com pesquisa por nome, email, username ou bilhete de identidade. Cada item já traz todos os dados da pessoa combinados.',
  })
  @ApiOkResponse({
    description: 'Lista paginada de colaboradores.',
  })
  async findAll(@Query() query: ListUserCollaboratorQueryDto) {
    return this.userCollaboratorService.findAll(query)
  }

  @AuthSource(AuthSourceEnum.PORTAL_CAND)
  @Get('me')
  @UseGuards(RemoteJwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obter o colaborador autenticado',
    description:
      'Retorna a conta de colaborador do utilizador autenticado, combinada com todos os dados da pessoa.',
  })
  @ApiOkResponse({
    description: 'Colaborador autenticado encontrado.',
  })
  @ApiNotFoundResponse({
    description: 'Não existe colaborador associado ao token.',
  })
  async me(@Req() req: { user: DecodedUserPayload }) {
    return this.userCollaboratorService.findMe(req.user)
  }

  @AuthSource(AuthSourceEnum.PORTAL_CAND)
  @Get('me/completion')
  @UseGuards(RemoteJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Verificar se o colaborador autenticado tem todos os dados devidos',
    description:
      'Indica se o perfil do utilizador autenticado está completo e quais campos obrigatórios ainda faltam preencher.',
  })
  @ApiOkResponse({
    description:
      'Estado de preenchimento do perfil, com percentagem e campos em falta.',
  })
  @ApiNotFoundResponse({
    description: 'Não existe colaborador associado ao token.',
  })
  async checkMyCompletion(@Req() req: { user: DecodedUserPayload }) {
    return this.userCollaboratorService.checkMyCompletion(req.user)
  }

  @AuthSource(AuthSourceEnum.PORTAL_CAND)
  @Patch('me')
  @UseGuards(RemoteJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualizar os próprios dados',
    description:
      'O utilizador autenticado atualiza os seus dados de pessoa e de conta. O id vem do token, não é enviado por parâmetro. Apenas os campos enviados são alterados.',
  })
  @ApiOkResponse({
    description: 'Dados atualizados com sucesso.',
  })
  @ApiBadRequestResponse({
    description: 'Dados enviados são inválidos.',
  })
  @ApiNotFoundResponse({
    description: 'Não existe colaborador associado ao token.',
  })
  @ApiConflictResponse({
    description:
      'Já existe uma conta utilizando o email ou username informado.',
  })
  updateMe(
    @Req() req: { user: DecodedUserPayload },
    @Body() dto: UpdateUserCollaboratorDto,
  ) {
    return this.userCollaboratorService.updateMe(req.user, dto)
  }

  @Get(':id')
  @UseGuards(RemoteJwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obter colaborador com todos os dados',
    description:
      'Retorna a conta de colaborador combinada com todos os dados da pessoa associada.',
  })
  @ApiParam({
    name: 'id',
    description: 'Código do colaborador',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Colaborador encontrado.',
  })
  @ApiNotFoundResponse({
    description: 'Colaborador não encontrado.',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userCollaboratorService.findOne(id)
  }

  @Patch(':id')
  @UseGuards(RemoteJwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualizar todos os dados do colaborador',
    description:
      'Atualiza, numa única transação, os dados da pessoa e da conta de colaborador. Apenas os campos enviados são alterados.',
  })
  @ApiParam({
    name: 'id',
    description: 'Código do colaborador',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Colaborador atualizado com sucesso.',
  })
  @ApiBadRequestResponse({
    description: 'Dados enviados são inválidos.',
  })
  @ApiNotFoundResponse({
    description: 'Colaborador não encontrado.',
  })
  @ApiConflictResponse({
    description:
      'Já existe uma conta utilizando o email ou username informado.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserCollaboratorDto,
  ) {
    return this.userCollaboratorService.update(id, dto)
  }

  @Delete(':id')
  @UseGuards(RemoteJwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Desativar colaborador',
    description:
      'Desativa logicamente o colaborador (estado da pessoa passa a 0). Os registos não são apagados fisicamente.',
  })
  @ApiParam({
    name: 'id',
    description: 'Código do colaborador',
    example: 1,
  })
  @ApiNoContentResponse({
    description: 'Colaborador desativado com sucesso.',
  })
  @ApiNotFoundResponse({
    description: 'Colaborador não encontrado.',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.userCollaboratorService.remove(id)
  }
}
