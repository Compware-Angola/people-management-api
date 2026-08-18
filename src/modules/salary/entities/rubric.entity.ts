import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

export enum RubricType {
  EARNING = 'PROVENTO',
  DISCOUNT = 'DESCONTO',
}

export enum ValueType {
  PERCENTAGE = 'PERCENTUAL',
  FIXED = 'FIXO',
  HOURLY = 'HORA_EXTRA',
}

@Entity('GP_RUBRICAS')
export class Rubric {
  @PrimaryGeneratedColumn({ name: 'CODIGO' })
  code: number

  @Column({ name: 'DESCRICAO', type: 'varchar2', length: 255 })
  description: string

  @Column({ name: 'TIPO', type: 'varchar2', length: 20 })
  type: RubricType

  @Column({ name: 'TIPO_VALOR', type: 'varchar2', length: 20 })
  valueType: ValueType

  @Column({ name: 'VALOR', type: 'number', precision: 10, scale: 2 })
  value: number

  @Column({ name: 'ESTADO', type: 'number', default: 1 })
  status: number

  @Column({
    name: 'CRIADO_EM',
    type: 'date',
    nullable: true,
  })
  createdAt: Date
}
