import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
  ManyToMany,
  ManyToOne,
  JoinColumn,
  JoinTable,
} from 'typeorm'
import { User } from '../../user/entities/user.entity'
import { Department } from '../../department/entity/department.entity'
import { Permission } from './permission.entity'
import { UserGroup } from './user-group.entity'
import { GroupPermission } from './group-permission.entity'

@Entity('GP_GRUPOS')
export class Group {
  @PrimaryGeneratedColumn('identity', { name: 'CODIGO' })
  id: number

  @Column({
    name: 'DEPARTAMENTO_ID',
    type: 'number',
    nullable: true,
  })
  departmentId: number | null

  @ManyToOne(() => Department, { eager: false })
  @JoinColumn({ name: 'DEPARTAMENTO_ID' })
  department: Department

  @Column({ name: 'DESCRICAO', unique: true })
  description: string

  @Column({ name: 'ESTADO', type: 'number', default: 1 })
  status: number

  @CreateDateColumn({ name: 'CRIADO_EM', type: 'date' })
  createdAt: Date

  @OneToMany(() => UserGroup, (userGroup) => userGroup.group)
  userGroups: UserGroup[]

  @OneToMany(() => GroupPermission, (groupPermission) => groupPermission.group)
  groupPermissions: GroupPermission[]

  @ManyToMany(() => User, (user) => user.groups)
  @JoinTable({
    name: 'GP_GRUPOS_USUARIOS',
    joinColumn: { name: 'CODIGO_GRUPO', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'CODIGO_USUARIO', referencedColumnName: 'id' },
  })
  users: User[]

  @ManyToMany(() => Permission, (permission) => permission.groups)
  @JoinTable({
    name: 'GP_GRUPOS_PERMISSOES',
    joinColumn: { name: 'CODIGO_GRUPO', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'CODIGO_PERMISSAO', referencedColumnName: 'id' },
  })
  permissions: Permission[]
}
