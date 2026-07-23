import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto, UpdatePermissionDto, UpdateRelationStatusDto } from './dto/permission.dto';
import { CreateGroupDto, UpdateGroupDto, AssignPermissionsDto, AssignUsersDto } from './dto/group.dto';

@ApiTags('Permissions & Groups')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get('groups')
  @ApiOperation({ summary: 'Listar todos os grupos' })
  findAllGroups() {
    return this.permissionsService.findAllGroups();
  }

  @Post('groups')
  @ApiOperation({ summary: 'Criar um novo grupo' })
  createGroup(@Body() createGroupDto: CreateGroupDto) {
    return this.permissionsService.createGroup(createGroupDto);
  }

  @Post()
  @ApiOperation({ summary: 'Criar uma nova permissão' })
  @ApiResponse({ status: 201, description: 'Permissão criada com sucesso.' })
  createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.createPermission(createPermissionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as permissões' })
  findAllPermissions() {
    return this.permissionsService.findAllPermissions();
  }

  @Get('groups/:id')
  @ApiOperation({ summary: 'Obter um grupo por ID' })
  findOneGroup(@Param('id') id: string) {
    return this.permissionsService.findOneGroup(+id);
  }

  @Patch('groups/:id')
  @ApiOperation({ summary: 'Atualizar um grupo' })
  updateGroup(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
    return this.permissionsService.updateGroup(+id, updateGroupDto);
  }

  @Delete('groups/:id')
  @ApiOperation({ summary: 'Remover um grupo' })
  removeGroup(@Param('id') id: string) {
    return this.permissionsService.removeGroup(+id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter uma permissão por ID' })
  findOnePermission(@Param('id') id: string) {
    return this.permissionsService.findOnePermission(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma permissão' })
  updatePermission(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto) {
    return this.permissionsService.updatePermission(+id, updatePermissionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma permissão' })
  removePermission(@Param('id') id: string) {
    return this.permissionsService.removePermission(+id);
  }

  @Post('groups/:id/permissions')
  @ApiOperation({ summary: 'Atribuir permissões a um grupo' })
  assignPermissionsToGroup(@Param('id') id: string, @Body() assignPermissionsDto: AssignPermissionsDto) {
    return this.permissionsService.assignPermissionsToGroup(+id, assignPermissionsDto);
  }

  @Post('groups/:id/users')
  @ApiOperation({ summary: 'Atribuir usuários a um grupo' })
  assignUsersToGroup(@Param('id') id: string, @Body() assignUsersDto: AssignUsersDto) {
    return this.permissionsService.assignUsersToGroup(+id, assignUsersDto);
  }

  @Post('users/:userId/direct-permissions')
  @ApiOperation({ summary: 'Atribuir permissões diretas a um usuário' })
  assignDirectPermissionsToUser(@Param('userId') userId: string, @Body() assignPermissionsDto: AssignPermissionsDto) {
    return this.permissionsService.assignDirectPermissionsToUser(+userId, assignPermissionsDto);
  }

  @Get('users/:userId/groups')
  @ApiOperation({ summary: 'Listar grupos de um usuário' })
  findUserGroups(@Param('userId') userId: string) {
    return this.permissionsService.findUserGroups(+userId);
  }

  @Patch('groups/:groupId/permissions/:permissionId/status')
  @ApiOperation({ summary: 'Mudar o estado de uma permissão no grupo' })
  updateGroupPermissionStatus(
    @Param('groupId') groupId: string,
    @Param('permissionId') permissionId: string,
    @Body() updateStatusDto: UpdateRelationStatusDto,
  ) {
    return this.permissionsService.updateGroupPermissionStatus(+groupId, +permissionId, updateStatusDto);
  }

  @Patch('users/:userId/permissions/:permissionId/status')
  @ApiOperation({ summary: 'Mudar o estado de uma permissão no usuário' })
  updateUserPermissionStatus(
    @Param('userId') userId: string,
    @Param('permissionId') permissionId: string,
    @Body() updateStatusDto: UpdateRelationStatusDto,
  ) {
    return this.permissionsService.updateUserPermissionStatus(+userId, +permissionId, updateStatusDto);
  }
}
