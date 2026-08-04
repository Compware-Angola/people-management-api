import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  DeleteDateColumn,
  Unique,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { Department } from './department.entity'

@Entity('GP_CENTROS_CUSTO')
@Unique('UQ_GP_CENTROS_CUSTO_DESCRICAO', ['description'])
export class CostCenter {
  @PrimaryGeneratedColumn({
    name: 'CODIGO',
    type: 'number',
  })
  code: number

  @Column({
    name: 'DEPARTAMENTO_ID',
    type: 'number',
    nullable: false,
  })
  departmentId: number

  @ManyToOne(() => Department, { eager: false })
  @JoinColumn({ name: 'DEPARTAMENTO_ID' })
  department: Department

  @Column({
    name: 'DESCRICAO',
    type: 'varchar2',
    length: 150,
    nullable: false,
  })
  description: string

  @Column({
    name: 'ESTADO',
    type: 'number',
    precision: 1,
    scale: 0,
    default: 1,
    nullable: false,
  })
  status: number

  @Column({
    name: 'CRIADO_EM',
    type: 'date',
    default: () => 'SYSDATE',
    nullable: false,
  })
  createdAt: Date

  @DeleteDateColumn({
    name: 'DELETADO_EM',
    type: 'date',
  })
  deletedAt: Date | null
}
