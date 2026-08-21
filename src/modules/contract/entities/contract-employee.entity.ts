import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { Contract } from './contract.entity'
import { Employee } from '../../employee/entities/employee.entity'

export enum ContractEmployeeStatus {
  ACTIVE = 'ATIVO',
  INACTIVE = 'INATIVO',
}

@Entity('GP_COLABORADORES_CONTRATOS')
export class ContractEmployee {
  @PrimaryGeneratedColumn({ name: 'CODIGO' })
  id: number

  @Column({ name: 'CODIGO_CONTRATO', type: 'number' })
  contractId: number

  @Column({ name: 'CODIGO_COLABORADOR', type: 'number' })
  employeeId: number

  @Column({
    name: 'ESTADO',
    type: 'varchar2',
    length: 20,
    default: ContractEmployeeStatus.ACTIVE,
  })
  status: ContractEmployeeStatus

  @Column({
    name: 'DATA_INICIO',
    type: 'date',
    default: () => 'SYSDATE',
  })
  startDate: Date

  @Column({ name: 'DATA_FIM', type: 'date', nullable: true })
  endDate?: Date | null

  @ManyToOne(() => Contract, { eager: false })
  @JoinColumn({ name: 'CODIGO_CONTRATO', referencedColumnName: 'id' })
  contract: Contract

  @ManyToOne(() => Employee, { eager: false })
  @JoinColumn({ name: 'CODIGO_COLABORADOR', referencedColumnName: 'id' })
  employee: Employee
}
