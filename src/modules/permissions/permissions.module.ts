import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PermissionsService } from './permissions.service'
import { PermissionsController } from './permissions.controller'
import { Permission } from './entities/permission.entity'
import { Group } from './entities/group.entity'
import { User } from '../user/entities/user.entity'
import { Department } from '../department/entity/department.entity'
import { UserGroup } from './entities/user-group.entity'
import { GroupPermission } from './entities/group-permission.entity'
import { UserPermission } from './entities/user-permission.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Permission,
      Group,
      User,
      Department,
      UserGroup,
      GroupPermission,
      UserPermission,
    ]),
  ],
  controllers: [PermissionsController],
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}
