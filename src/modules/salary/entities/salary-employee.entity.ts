import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { Salary } from './salary.entity'
import { Employee } from '../../employee/entities/employee.entity'

@Entity('GP_COLABORADORES_ESTRUTURAS_SALARIAIS')
export class SalaryEmployee {
  @PrimaryColumn({ name: 'CODIGO_ESTRUTURA_SALARIAL', type: 'number' })
  salaryId: number

  @PrimaryColumn({ name: 'CODIGO_COLABORADOR', type: 'number' })
  employeeId: number

  @Column({ name: 'CODIGO_COLABORADOR_CADASTRADOR', type: 'number' })
  createdByEmployeeId: number

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
