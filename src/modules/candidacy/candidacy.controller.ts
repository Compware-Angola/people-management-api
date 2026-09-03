import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { CandidacyService } from './candidacy.service'
import { CreateCandidacyDto } from './dto/create-candidacy.dto'
import { ListCandidaciesQueryDto } from './dto/list-candidacies-query.dto'
import { ListMyCandidaciesQueryDto } from './dto/list-my-candidacies-query.dto'
import { ChangeCandidacyStateDto } from './dto/change-candidacy-state.dto'
import { WithdrawCandidacyDto } from './dto/withdraw-candidacy.dto'
import { RemoteJwtAuthGuard } from 'src/commons/guards/remote-jwt-auth.guard'
import { PermissionsGuard } from 'src/commons/guards/permissions.guard'
import { Permissions } from 'src/commons/decorators/permissions.decorator'
import { PermissionsEnum } from 'src/commons/enums/permissions.enum'
import { AuthSource, AuthSourceEnum } from 'src/commons/decorators/auth-source.decorator'

@ApiTags('Candidacy')
@ApiBearerAuth()
@Controller('candidacy')
@UseGuards(RemoteJwtAuthGuard, PermissionsGuard)
export class CandidacyController {
  constructor(private readonly candidacyService: CandidacyService) { }

  // -------------------------------------------------------------------------
  // Visão do candidato (basta estar autenticado)
  // -------------------------------------------------------------------------
  @AuthSource(AuthSourceEnum.PORTAL_CAND)
  @Post()
  @ApiOperation({
    summary: 'Candidatar-se a uma vaga publicada (candidato autenticado)',
  })
  @ApiResponse({
    status: 201,
    description: 'Candidatura submetida com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Vaga não publicada ou prazo encerrado.',
  })
  @ApiResponse({
    status: 409,
    description: 'Já existe uma candidatura em curso para esta vaga.',
  })
  apply(@Body() dto: CreateCandidacyDto, @Req() req: any) {
    return this.candidacyService.apply(dto, req.user.username, req.user.sub)
  }

  @Get('me')
  @AuthSource(AuthSourceEnum.PORTAL_CAND)
  @ApiOperation({
    summary: 'Listar as minhas candidaturas (visão do candidato)',
  })
  @ApiResponse({ status: 200, description: 'Lista paginada das candidaturas.' })
  findMine(@Query() query: ListMyCandidaciesQueryDto, @Req() req: any) {
    return this.candidacyService.findMine(req.user.username, query)
  }

  @AuthSource(AuthSourceEnum.PORTAL_CAND)
  @Get('me/:code')
  @ApiOperation({
    summary: 'Detalhe de uma das minhas candidaturas, com histórico',
  })
  @ApiParam({ name: 'code', description: 'Código da candidatura', example: 1 })
  @ApiResponse({ status: 200, description: 'Candidatura encontrada.' })
  @ApiResponse({ status: 404, description: 'Candidatura não encontrada.' })
  findMineOne(@Param('code', ParseIntPipe) code: number, @Req() req: any) {
    return this.candidacyService.findMineOne(req.user.username, code)
  }

  @AuthSource(AuthSourceEnum.PORTAL_CAND)
  @Patch('me/:code/withdraw')
  @ApiOperation({
    summary: 'Retirar/desistir de uma candidatura ainda em curso',
  })
  @ApiParam({ name: 'code', description: 'Código da candidatura', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Candidatura retirada com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'A candidatura já não pode ser retirada.',
  })
  withdraw(
    @Param('code', ParseIntPipe) code: number,
    @Body() dto: WithdrawCandidacyDto,
    @Req() req: any,
  ) {
    return this.candidacyService.withdraw(
      req.user.username,
      req.user.sub,
      code,
      dto,
    )
  }

  // -------------------------------------------------------------------------
  // Visão administrativa (requer permissões)
  // -------------------------------------------------------------------------

  @Get()
  @Permissions(PermissionsEnum.READ_CANDIDACIES)
  @ApiOperation({
    summary:
      'Listar todas as candidaturas (visão administrativa, com paginação e filtros)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de todas as candidaturas.',
  })
  findAll(@Query() query: ListCandidaciesQueryDto) {
    return this.candidacyService.findAll(query)
  }

  @Get(':code')
  @Permissions(PermissionsEnum.READ_CANDIDACIES)
  @ApiOperation({
    summary: 'Detalhe de qualquer candidatura, com candidato e histórico',
  })
  @ApiParam({ name: 'code', description: 'Código da candidatura', example: 1 })
  @ApiResponse({ status: 200, description: 'Candidatura encontrada.' })
  @ApiResponse({ status: 404, description: 'Candidatura não encontrada.' })
  findOne(@Param('code', ParseIntPipe) code: number) {
    return this.candidacyService.findOne(code)
  }

  @Patch(':code/state')
  @Permissions(PermissionsEnum.WRITE_CANDIDACIES)
  @ApiOperation({
    summary: 'Alterar o estado de uma candidatura (equipa de recrutamento)',
  })
  @ApiParam({ name: 'code', description: 'Código da candidatura', example: 1 })
  @ApiResponse({ status: 200, description: 'Estado atualizado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Transição de estado inválida.' })
  @ApiResponse({ status: 404, description: 'Candidatura não encontrada.' })
  changeState(
    @Param('code', ParseIntPipe) code: number,
    @Body() dto: ChangeCandidacyStateDto,
    @Req() req: any,
  ) {
    return this.candidacyService.changeState(code, dto, req.user.sub)
  }
}
