import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Column } from 'typeorm'
import { Salary } from './salary.entity'
import { Rubric } from './rubric.entity'
import { Employee } from '../../employee/entities/employee.entity'

@Entity('GP_RUBRICAS_ESTRUTURAS_SALARIAIS')
export class SalaryRubric {
  @PrimaryColumn({ name: 'CODIGO_ESTRUTURA_SALARIAL', type: 'number' })
  salaryStructureCode: number

  @PrimaryColumn({ name: 'CODIGO_RUBRICA', type: 'number' })
  rubricCode: number

  @Column({ name: 'CODIGO_COLABORADOR_CADASTRADOR', type: 'number' })
  createdByEmployeeCode: number

  @ManyToOne(() => Salary, { eager: false })
  @JoinColumn({
    name: 'CODIGO_ESTRUTURA_SALARIAL',
    referencedColumnName: 'id',
  })
  salaryStructure: Salary

  @ManyToOne(() => Rubric, { eager: false })
  @JoinColumn({ name: 'CODIGO_RUBRICA', referencedColumnName: 'code' })
  rubric: Rubric

  @ManyToOne(() => Employee, { eager: false })
  @JoinColumn({
    name: 'CODIGO_COLABORADOR_CADASTRADOR',
    referencedColumnName: 'id',
  })
  createdByEmployee: Employee
}
