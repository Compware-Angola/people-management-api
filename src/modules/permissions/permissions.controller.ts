import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { PermissionsService } from './permissions.service'
import {
  CreatePermissionDto,
  UpdatePermissionDto,
  UpdateRelationStatusDto,
} from './dto/permission.dto'
import {
  CreateGroupDto,
  UpdateGroupDto,
  AssignPermissionsDto,
  AssignUsersDto,
} from './dto/group.dto'
import { RemoteJwtAuthGuard } from 'src/commons/guards/remote-jwt-auth.guard'
import { PermissionsGuard } from 'src/commons/guards/permissions.guard'
import { Permissions } from 'src/commons/decorators/permissions.decorator'
import { PermissionsEnum } from 'src/commons/enums/permissions.enum'

@ApiTags('Permissions & Groups')
@ApiBearerAuth()
@UseGuards(RemoteJwtAuthGuard, PermissionsGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}
  @Get('me')
  async myPermissions(@Req() req: any) {
    const permissions = await this.permissionsService.myPermissions(
      Number(req.user.sub),
    )
    return { permissions }
  }

  @Get('groups')
  @Permissions(PermissionsEnum.READ_PERMISSIONS)
  @ApiOperation({
    summary: 'Listar todos os grupos (filtro opcional por departamento)',
  })
  findAllGroups(@Query('departmentId') departmentId?: string) {
    return this.permissionsService.findAllGroups(
      departmentId !== undefined ? +departmentId : undefined,
    )
  }

  @Post('groups')
  @Permissions(PermissionsEnum.WRITE_PERMISSIONS)
  @ApiOperation({ summary: 'Criar um novo grupo' })
  createGroup(@Body() createGroupDto: CreateGroupDto) {
    return this.permissionsService.createGroup(createGroupDto)
  }

  @Post()
  @Permissions(PermissionsEnum.WRITE_PERMISSIONS)
  @ApiOperation({ summary: 'Criar uma nova permissão' })
  @ApiResponse({ status: 201, description: 'Permissão criada com sucesso.' })
  createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.createPermission(createPermissionDto)
  }

  @Get()
  @Permissions(PermissionsEnum.READ_PERMISSIONS)
  @ApiOperation({ summary: 'Listar todas as permissões' })
  findAllPermissions() {
    return this.permissionsService.findAllPermissions()
  }

  @Get('groups/:id')
  @Permissions(PermissionsEnum.READ_PERMISSIONS)
  @ApiOperation({ summary: 'Obter um grupo por ID' })
  findOneGroup(@Param('id') id: string) {
    return this.permissionsService.findOneGroup(+id)
  }

  @Patch('groups/:id')
  @Permissions(PermissionsEnum.WRITE_PERMISSIONS)
  @ApiOperation({ summary: 'Atualizar um grupo' })
  updateGroup(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
    return this.permissionsService.updateGroup(+id, updateGroupDto)
  }

  @Delete('groups/:id')
  @Permissions(PermissionsEnum.WRITE_PERMISSIONS)
  @ApiOperation({ summary: 'Remover um grupo' })
  removeGroup(@Param('id') id: string) {
    return this.permissionsService.removeGroup(+id)
  }

  @Get(':id')
  @Permissions(PermissionsEnum.READ_PERMISSIONS)
  @ApiOperation({ summary: 'Obter uma permissão por ID' })
  findOnePermission(@Param('id') id: string) {
    return this.permissionsService.findOnePermission(+id)
  }

  @Patch(':id')
  @Permissions(PermissionsEnum.WRITE_PERMISSIONS)
  @ApiOperation({ summary: 'Atualizar uma permissão' })
  updatePermission(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionsService.updatePermission(+id, updatePermissionDto)
  }

  @Delete(':id')
  @Permissions(PermissionsEnum.WRITE_PERMISSIONS)
  @ApiOperation({ summary: 'Remover uma permissão' })
  removePermission(@Param('id') id: string) {
    return this.permissionsService.removePermission(+id)
  }

  @Post('groups/:id/permissions')
  @Permissions(PermissionsEnum.WRITE_PERMISSIONS)
  @ApiOperation({ summary: 'Atribuir permissões a um grupo' })
  assignPermissionsToGroup(
    @Param('id') id: string,
    @Body() assignPermissionsDto: AssignPermissionsDto,
  ) {
    return this.permissionsService.assignPermissionsToGroup(
      +id,
      assignPermissionsDto,
    )
  }

  @Post('groups/:id/users')
  @Permissions(PermissionsEnum.WRITE_PERMISSIONS)
  @ApiOperation({ summary: 'Atribuir usuários a um grupo' })
  assignUsersToGroup(
    @Param('id') id: string,
    @Body() assignUsersDto: AssignUsersDto,
  ) {
    return this.permissionsService.assignUsersToGroup(+id, assignUsersDto)
  }

  @Post('users/:userId/direct-permissions')
  @Permissions(PermissionsEnum.WRITE_PERMISSIONS)
  @ApiOperation({ summary: 'Atribuir permissões diretas a um usuário' })
  assignDirectPermissionsToUser(
    @Param('userId') userId: string,
    @Body() assignPermissionsDto: AssignPermissionsDto,
  ) {
    return this.permissionsService.assignDirectPermissionsToUser(
      +userId,
      assignPermissionsDto,
    )
  }

  @Get('users/:userId/groups')
  @Permissions(PermissionsEnum.READ_PERMISSIONS)
  @ApiOperation({ summary: 'Listar grupos de um usuário' })
  findUserGroups(@Param('userId') userId: string) {
    return this.permissionsService.findUserGroups(+userId)
  }

  @Patch('groups/:groupId/permissions/:permissionId/status')
  @Permissions(PermissionsEnum.WRITE_PERMISSIONS)
  @ApiOperation({ summary: 'Mudar o estado de uma permissão no grupo' })
  updateGroupPermissionStatus(
    @Param('groupId') groupId: string,
    @Param('permissionId') permissionId: string,
    @Body() updateStatusDto: UpdateRelationStatusDto,
  ) {
    return this.permissionsService.updateGroupPermissionStatus(
      +groupId,
      +permissionId,
      updateStatusDto,
    )
  }

  @Patch('users/:userId/permissions/:permissionId/status')
  @Permissions(PermissionsEnum.WRITE_PERMISSIONS)
  @ApiOperation({ summary: 'Mudar o estado de uma permissão no usuário' })
  updateUserPermissionStatus(
    @Param('userId') userId: string,
    @Param('permissionId') permissionId: string,
    @Body() updateStatusDto: UpdateRelationStatusDto,
  ) {
    return this.permissionsService.updateUserPermissionStatus(
      +userId,
      +permissionId,
      updateStatusDto,
    )
  }
}
