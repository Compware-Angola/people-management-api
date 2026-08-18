import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  DeleteDateColumn,
  Unique,
} from 'typeorm'

@Entity('GP_DEPARTAMENTOS')
@Unique('UQ_GP_DEPARTAMENTOS_DESCRICAO', ['description'])
export class Department {
  @PrimaryGeneratedColumn({
    name: 'CODIGO',
    type: 'number',
  })
  code: number

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
