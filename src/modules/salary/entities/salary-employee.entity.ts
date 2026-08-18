import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { Salary } from './salary.entity'
import { Employee } from '../../employee/entities/employee.entity'

export enum SalaryEmployeeStatus {
  ACTIVE = 'ATIVA',
  INACTIVE = 'INATIVA',
}

@Entity('GP_COLABORADORES_ESTRUTURAS_SALARIAIS')
export class SalaryEmployee {
  @PrimaryColumn({ name: 'CODIGO_ESTRUTURA_SALARIAL', type: 'number' })
  salaryId: number

  @PrimaryColumn({ name: 'CODIGO_COLABORADOR', type: 'number' })
  employeeId: number

  @Column({ name: 'CODIGO_COLABORADOR_CADASTRADOR', type: 'number' })
  createdByEmployeeId: number

  @Column({
    name: 'ESTADO',
    type: 'varchar2',
    length: 20,
    default: SalaryEmployeeStatus.ACTIVE,
  })
  status: SalaryEmployeeStatus

  @Column({
    name: 'DATA_INICIO',
    type: 'date',
    default: () => 'SYSDATE',
  })
  startDate: Date

  @Column({ name: 'DATA_FIM', type: 'date', nullable: true })
  endDate?: Date | null

  @ManyToOne(() => Salary, { eager: false })
  @JoinColumn({
    name: 'CODIGO_ESTRUTURA_SALARIAL',
    referencedColumnName: 'id',
  })
  salaryStructure: Salary

  @ManyToOne(() => Employee, { eager: false })
  @JoinColumn({
    name: 'CODIGO_COLABORADOR',
    referencedColumnName: 'id',
  })
  employee: Employee

  @ManyToOne(() => Employee, { eager: false })
  @JoinColumn({
    name: 'CODIGO_COLABORADOR_CADASTRADOR',
    referencedColumnName: 'id',
  })
  createdByEmployee: Employee
}
