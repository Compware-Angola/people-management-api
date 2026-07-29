import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common'
import { VacationService } from './vacation.service'
import { CreateVacationDto } from './dto/create-vacation.dto'
import { UpdateVacationDto } from './dto/update-vacation.dto'
import { VacationQueryDto } from './dto/vacation-query.dto'
import { ApiTags, ApiOperation } from '@nestjs/swagger'

@Controller('vacations')
@ApiTags('Vacations')
export class VacationController {
  constructor(private readonly vacationService: VacationService) {}

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Solicitar férias' })
  async create(@Body() dto: CreateVacationDto) {
    await this.vacationService.create(dto)
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as férias' })
  findAll(@Query() query: VacationQueryDto) {
    return this.vacationService.findAll(query)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de um registro de férias' })
  findOne(@Param('id') id: string) {
    return this.vacationService.findOne(+id)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar registro de férias' })
  update(@Param('id') id: string, @Body() dto: UpdateVacationDto) {
    return this.vacationService.update(+id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir registro de férias' })
  async remove(@Param('id') id: string) {
    await this.vacationService.remove(+id)
  }
}
