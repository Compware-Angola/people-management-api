import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
  ManyToMany,
} from 'typeorm'
import { Group } from '../../permissions/entities/group.entity'
import { Permission } from '../../permissions/entities/permission.entity'
import { UserGroup } from '../../permissions/entities/user-group.entity'
import { UserPermission } from '../../permissions/entities/user-permission.entity'

@Entity('GP_USUARIOS')
export class User {
  @PrimaryGeneratedColumn('identity', { name: 'CODIGO' })
  id: number

  @Column({ name: 'NOME' })
  name: string

  @Column({ name: 'BI', unique: true })
  bi: string

  @Column({ name: 'NIF', unique: true, nullable: true })
  nif?: string

  @Column({ name: 'TELEFONE' })
  phone: string

  @Column({ name: 'TELEFONE_ALTERNATIVO', nullable: true })
  alternativePhone?: string

  @Column({ name: 'PROVINCIA' })
  province: string

  @Column({ name: 'MUNICIPIO' })
  municipality: string

  @Column({ name: 'MORADA' })
  address: string

  @Column({ name: 'EMAIL', unique: true })
  email: string

  @Column({ name: 'SENHA', select: false })
  password?: string

  @Column({ name: 'PRECISA_MUDAR_SENHA', type: 'number', default: 1 })
  mustChangePassword: number

  @Column({ name: 'ESTADO', type: 'number', default: 1 })
  status: number

  @CreateDateColumn({ name: 'CRIADO_EM', type: 'date' })
  createdAt: Date

  @OneToMany(() => UserGroup, (userGroup) => userGroup.user)
  userGroups: UserGroup[]

  @OneToMany(() => UserPermission, (userPermission) => userPermission.user)
  userPermissions: UserPermission[]

  @ManyToMany(() => Group, (group) => group.users)
  groups: Group[]

  @ManyToMany(() => Permission, (permission) => permission.users)
  permissions: Permission[]
}
