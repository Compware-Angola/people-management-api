import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity('GP_ESTRUTURAS_SALARIAIS')
export class Salary {
  @PrimaryGeneratedColumn({ name: 'CODIGO' })
  id: number

  @Column({ name: 'CARGO', type: 'varchar2', length: 150 })
  position: string

  @Column({ name: 'CATEGORIA', type: 'varchar2', length: 100 })
  category: string

  @Column({ name: 'DESCRICAO', type: 'varchar2', length: 255, nullable: true })
  description: string

  @Column({ name: 'ESTADO', type: 'number', default: 1 })
  status: number

  @Column({
    name: 'CRIADO_EM',
    type: 'date',
    default: () => 'SYSDATE',
  })
  createdAt: Date
}
