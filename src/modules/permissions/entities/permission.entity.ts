import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Group } from './group.entity';
import { UserPermission } from './user-permission.entity';
import { GroupPermission } from './group-permission.entity';

@Entity('GP_PERMISSOES')
export class Permission {
  @PrimaryGeneratedColumn('identity', { name: 'CODIGO' })
  id: number;

  @Column({ name: 'DESCRICAO', unique: true })
  description: string;

  @Column({ name: 'ESTADO', type: 'number', default: 1 })
  status: number;

  @CreateDateColumn({ name: 'CRIADO_EM', type: 'date' })
  createdAt: Date;

  @OneToMany(() => UserPermission, (userPermission) => userPermission.permission)
  userPermissions: UserPermission[];

  @OneToMany(() => GroupPermission, (groupPermission) => groupPermission.permission)
  groupPermissions: GroupPermission[];

  @ManyToMany(() => User, (user) => user.permissions)
  @JoinTable({
    name: 'GP_USUARIOS_PERMISSOES',
    joinColumn: { name: 'CODIGO_PERMISSAO', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'CODIGO_USUARIO', referencedColumnName: 'id' },
  })
  users: User[];

  @ManyToMany(() => Group, (group) => group.permissions)
  groups: Group[];
}
