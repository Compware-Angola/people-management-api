import {
  Entity,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm'
import { User } from '../../user/entities/user.entity'
import { Group } from './group.entity'

@Entity('GP_GRUPOS_USUARIOS')
export class UserGroup {
  @PrimaryColumn({ name: 'CODIGO_GRUPO' })
  groupId: number

  @PrimaryColumn({ name: 'CODIGO_USUARIO' })
  userId: number

  @Column({ name: 'ESTADO', type: 'number', default: 1 })
  status: number

  @CreateDateColumn({ name: 'CRIADO_EM', type: 'date' })
  createdAt: Date

  @ManyToOne(() => Group, (group) => group.userGroups)
  @JoinColumn({ name: 'CODIGO_GRUPO' })
  group: Group

  @ManyToOne(() => User, (user) => user.userGroups)
  @JoinColumn({ name: 'CODIGO_USUARIO' })
  user: User
}
