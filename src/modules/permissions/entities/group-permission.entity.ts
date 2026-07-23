import {
  Entity,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { Group } from './group.entity';
import { Permission } from './permission.entity';

@Entity('GP_GRUPOS_PERMISSOES')
export class GroupPermission {
  @PrimaryColumn({ name: 'CODIGO_GRUPO' })
  groupId: number;

  @PrimaryColumn({ name: 'CODIGO_PERMISSAO' })
  permissionId: number;

  @Column({ name: 'ESTADO', type: 'number', default: 1 })
  status: number;

  @CreateDateColumn({ name: 'CRIADO_EM', type: 'date' })
  createdAt: Date;

  @ManyToOne(() => Group, (group) => group.groupPermissions)
  @JoinColumn({ name: 'CODIGO_GRUPO' })
  group: Group;

  @ManyToOne(() => Permission, (permission) => permission.groupPermissions)
  @JoinColumn({ name: 'CODIGO_PERMISSAO' })
  permission: Permission;
}
