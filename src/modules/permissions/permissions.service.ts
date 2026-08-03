import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, In } from 'typeorm'
import { Permission } from './entities/permission.entity'
import { Group } from './entities/group.entity'
import { User } from '../user/entities/user.entity'
import { UserGroup } from './entities/user-group.entity'
import { GroupPermission } from './entities/group-permission.entity'
import { UserPermission } from './entities/user-permission.entity'
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

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserGroup)
    private readonly userGroupRepository: Repository<UserGroup>,
    @InjectRepository(GroupPermission)
    private readonly groupPermissionRepository: Repository<GroupPermission>,
    @InjectRepository(UserPermission)
    private readonly userPermissionRepository: Repository<UserPermission>,
  ) {}

  // Permissions
  async createPermission(
    createPermissionDto: CreatePermissionDto,
  ): Promise<Permission> {
    const permission = this.permissionRepository.create(createPermissionDto)
    return this.permissionRepository.save(permission)
  }

  async findAllPermissions(): Promise<Permission[]> {
    return this.permissionRepository.find()
  }

  async findOnePermission(id: number): Promise<Permission> {
    if (isNaN(id)) {
      throw new BadRequestException('ID de permissão inválido')
    }
    const permission = await this.permissionRepository.findOne({
      where: { id },
    })
    if (!permission) {
      throw new NotFoundException(`Permissão com ID ${id} não encontrada`)
    }
    return permission
  }

  async updatePermission(
    id: number,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission> {
    await this.findOnePermission(id)
    await this.permissionRepository.update(id, updatePermissionDto)
    return this.findOnePermission(id)
  }

  async removePermission(id: number): Promise<void> {
    const permission = await this.findOnePermission(id)
    await this.permissionRepository.remove(permission)
  }

  // Groups
  async createGroup(createGroupDto: CreateGroupDto): Promise<Group> {
    const group = this.groupRepository.create(createGroupDto)
    return this.groupRepository.save(group)
  }

  async findAllGroups(): Promise<Group[]> {
    return this.groupRepository.find({
      relations: {
        permissions: true,
      },
    })
  }

  async findOneGroup(id: number): Promise<Group> {
    if (isNaN(id)) {
      throw new BadRequestException('ID de grupo inválido')
    }
    const group = await this.groupRepository.findOne({
      where: { id },
      relations: {
        permissions: true,
        users: true,
      },
    })
    if (!group) {
      throw new NotFoundException(`Grupo com ID ${id} não encontrado`)
    }
    return group
  }

  async updateGroup(
    id: number,
    updateGroupDto: UpdateGroupDto,
  ): Promise<Group> {
    await this.findOneGroup(id)
    await this.groupRepository.update(id, updateGroupDto)
    return this.findOneGroup(id)
  }

  async removeGroup(id: number): Promise<void> {
    const group = await this.findOneGroup(id)
    await this.groupRepository.remove(group)
  }

  // Assignments
  async assignPermissionsToGroup(
    groupId: number,
    assignPermissionsDto: AssignPermissionsDto,
  ): Promise<Group> {
    const group = await this.findOneGroup(groupId)
    const permissions = await this.permissionRepository.findBy({
      id: In(assignPermissionsDto.permissionIds),
    })
    group.permissions = permissions
    return this.groupRepository.save(group)
  }

  async assignUsersToGroup(
    groupId: number,
    assignUsersDto: AssignUsersDto,
  ): Promise<Group> {
    const group = await this.findOneGroup(groupId)
    const users = await this.userRepository.findBy({
      id: In(assignUsersDto.userIds),
    })
    group.users = users
    return this.groupRepository.save(group)
  }

  async assignDirectPermissionsToUser(
    userId: number,
    assignPermissionsDto: AssignPermissionsDto,
  ): Promise<User> {
    if (isNaN(userId)) {
      throw new BadRequestException('ID de usuário inválido')
    }
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: {
        permissions: true,
      },
    })
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`)
    }
    const permissions = await this.permissionRepository.findBy({
      id: In(assignPermissionsDto.permissionIds),
    })
    user.permissions = permissions
    return this.userRepository.save(user)
  }

  async findUserGroups(userId: number): Promise<Group[]> {
    if (isNaN(userId)) {
      throw new BadRequestException('ID de usuário inválido')
    }
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: {
        groups: {
          permissions: true,
        },
      },
    })
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado`)
    }
    return user.groups
  }

  async updateGroupPermissionStatus(
    groupId: number,
    permissionId: number,
    updateStatusDto: UpdateRelationStatusDto,
  ): Promise<GroupPermission> {
    const groupPermission = await this.groupPermissionRepository.findOne({
      where: { groupId, permissionId },
    })
    if (!groupPermission) {
      throw new NotFoundException(
        'Vínculo entre grupo e permissão não encontrado',
      )
    }
    groupPermission.status = updateStatusDto.status
    return this.groupPermissionRepository.save(groupPermission)
  }

  async updateUserPermissionStatus(
    userId: number,
    permissionId: number,
    updateStatusDto: UpdateRelationStatusDto,
  ): Promise<UserPermission> {
    const userPermission = await this.userPermissionRepository.findOne({
      where: { userId, permissionId },
    })
    if (!userPermission) {
      throw new NotFoundException(
        'Vínculo entre usuário e permissão não encontrado',
      )
    }
    userPermission.status = updateStatusDto.status
    return this.userPermissionRepository.save(userPermission)
  }
}
