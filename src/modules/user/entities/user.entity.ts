import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm'
import { Group } from '../../permissions/entities/group.entity'
import { Permission } from '../../permissions/entities/permission.entity'
import { UserGroup } from '../../permissions/entities/user-group.entity'
import { UserPermission } from '../../permissions/entities/user-permission.entity'
import { PersonEntity } from './person.entity'

@Entity('GP_USUARIOS')
export class User {
  @PrimaryGeneratedColumn('identity', {
    name: 'CODIGO',
    type: 'number',
  })
  id: number

  @Column({
    name: 'EMAIL',
    type: 'varchar2',
    length: 150,
    unique: true,
  })
  email: string

  @Column({
    name: 'EXTERNAL_ID',
    type: 'number',
    nullable: true,
  })
  externalId: number | null

  @Column({
    name: 'ID_PESSOA',
    type: 'number',
    nullable: true,
    unique: true,
  })
  personId: number | null

  @OneToOne(() => PersonEntity, {
    nullable: true,
  })
  @JoinColumn({
    name: 'ID_PESSOA',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_GP_USUARIOS_PESSOA',
  })
  person: PersonEntity

  @OneToMany(() => UserGroup, (userGroup) => userGroup.user)
  userGroups: UserGroup[]

  @OneToMany(() => UserPermission, (userPermission) => userPermission.user)
  userPermissions: UserPermission[]

  @ManyToMany(() => Group, (group) => group.users)
  groups: Group[]

  @ManyToMany(() => Permission, (permission) => permission.users)
  permissions: Permission[]
}
