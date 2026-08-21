import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

export enum ContractType {
  CONTRACTED = 'CONTRATADO',
  HOURLY = 'HORISTA',
  FIXED = 'FIXO',
}

export enum ContractStatus {
  ACTIVE = 'ATIVO',
  INACTIVE = 'INATIVO',
}

@Entity('GP_CONTRATOS')
export class Contract {
  @PrimaryGeneratedColumn({ name: 'CODIGO' })
  id: number

  @Column({ name: 'TIPO', type: 'varchar2', length: 20 })
  type: ContractType

  @Column({
    name: 'ESTADO',
    type: 'varchar2',
    length: 20,
    default: ContractStatus.ACTIVE,
  })
  status: ContractStatus

  @Column({ name: 'PERMITE_HORA_EXTRA', type: 'number', default: 0 })
  allowsOvertime: number

  @Column({ name: 'HORAS_MENSAIS', type: 'number', precision: 5, scale: 2 })
  monthlyHours: number

  @Column({
    name: 'CRIADO_EM',
    type: 'date',
    default: () => 'SYSDATE',
  })
  createdAt: Date
}
