import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { AttendanceService } from './attendance.service'
import { CreateAttendanceDto } from './dto/create-attendance.dto'
import { UpdateAttendanceDto } from './dto/update-attendance.dto'
import { PaginationQueryDto } from '../../commons/dto/pagination.dto'

@ApiTags('Attendance')
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar assiduidade' })
  create(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.create(createAttendanceDto)
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as assiduidades' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.attendanceService.findAll(query)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de uma assiduidade' })
  findOne(@Param('id') id: string) {
    return this.attendanceService.findOne(+id)
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Listar assiduidades de um colaborador' })
  findByEmployee(
    @Param('employeeId') employeeId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.attendanceService.findByEmployee(+employeeId, query)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar registro de assiduidade' })
  update(
    @Param('id') id: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
  ) {
    return this.attendanceService.update(+id, updateAttendanceDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover registro de assiduidade' })
  remove(@Param('id') id: string) {
    return this.attendanceService.remove(+id)
  }
}
