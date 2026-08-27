import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { LeavesService } from './leaves.service'
import { CreateLeaveDto } from './dto/create-leave.dto'
import { UpdateLeaveDto } from './dto/update-leave.dto'
import { LeaveQueryDto } from './dto/leave-query.dto'
import { RemoteJwtAuthGuard } from '../../commons/guards/remote-jwt-auth.guard'
import { PermissionsGuard } from '../../commons/guards/permissions.guard'
import { Permissions } from '../../commons/decorators/permissions.decorator'
import { PermissionsEnum } from '../../commons/enums/permissions.enum'

@ApiTags('Licenças')
@ApiBearerAuth()
@Controller('leaves')
@UseGuards(RemoteJwtAuthGuard, PermissionsGuard)
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  @Post()
  @Permissions(PermissionsEnum.WRITE_LEAVES)
  @ApiOperation({ summary: 'Registrar uma nova licença' })
  create(@Body() createLeaveDto: CreateLeaveDto) {
    return this.leavesService.create(createLeaveDto)
  }

  @Get()
  @Permissions(PermissionsEnum.READ_LEAVES)
  @ApiOperation({ summary: 'Listar licenças com filtros' })
  findAll(@Query() query: LeaveQueryDto) {
    return this.leavesService.findAll(query)
  }

  @Patch(':id')
  @Permissions(PermissionsEnum.WRITE_LEAVES)
  @ApiOperation({ summary: 'Atualizar estado de uma licença' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLeaveDto: UpdateLeaveDto,
    @Req() req: any,
  ) {
    const userId = req.user.sub
    return this.leavesService.update(id, updateLeaveDto, userId)
  }
}
