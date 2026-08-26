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
  UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { AttendanceService } from './attendance.service'
import { CreateAttendanceDto } from './dto/create-attendance.dto'
import { UpdateAttendanceDto } from './dto/update-attendance.dto'
import { PaginationQueryDto } from '../../commons/dto/pagination.dto'
import { RemoteJwtAuthGuard } from '../../commons/guards/remote-jwt-auth.guard'
import { PermissionsGuard } from '../../commons/guards/permissions.guard'
import { Permissions } from '../../commons/decorators/permissions.decorator'
import { PermissionsEnum } from '../../commons/enums/permissions.enum'

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(RemoteJwtAuthGuard, PermissionsGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @Permissions(PermissionsEnum.WRITE_ATTENDANCE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar assiduidade' })
  create(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.create(createAttendanceDto)
  }

  @Get()
  @Permissions(PermissionsEnum.READ_ATTENDANCE)
  @ApiOperation({ summary: 'Listar todas as assiduidades' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.attendanceService.findAll(query)
  }

  @Get(':id')
  @Permissions(PermissionsEnum.READ_ATTENDANCE)
  @ApiOperation({ summary: 'Obter detalhes de uma assiduidade' })
  findOne(@Param('id') id: string) {
    return this.attendanceService.findOne(+id)
  }

  @Get('employee/:employeeId')
  @Permissions(PermissionsEnum.READ_ATTENDANCE)
  @ApiOperation({ summary: 'Listar assiduidades de um colaborador' })
  findByEmployee(
    @Param('employeeId') employeeId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.attendanceService.findByEmployee(+employeeId, query)
  }

  @Patch(':id')
  @Permissions(PermissionsEnum.WRITE_ATTENDANCE)
  @ApiOperation({ summary: 'Atualizar registro de assiduidade' })
  update(
    @Param('id') id: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
  ) {
    return this.attendanceService.update(+id, updateAttendanceDto)
  }

  @Delete(':id')
  @Permissions(PermissionsEnum.WRITE_ATTENDANCE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover registro de assiduidade' })
  remove(@Param('id') id: string) {
    return this.attendanceService.remove(+id)
  }
}
