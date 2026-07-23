import {
  Entity,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Permission } from './permission.entity';

@Entity('GP_USUARIOS_PERMISSOES')
export class UserPermission {
  @PrimaryColumn({ name: 'CODIGO_USUARIO' })
  userId: number;

  @PrimaryColumn({ name: 'CODIGO_PERMISSAO' })
  permissionId: number;

  @Column({ name: 'ESTADO', type: 'number', default: 1 })
  status: number;

  @CreateDateColumn({ name: 'CRIADO_EM', type: 'date' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.userPermissions)
  @JoinColumn({ name: 'CODIGO_USUARIO' })
  user: User;

  @ManyToOne(() => Permission, (permission) => permission.userPermissions)
  @JoinColumn({ name: 'CODIGO_PERMISSAO' })
  permission: Permission;
}
