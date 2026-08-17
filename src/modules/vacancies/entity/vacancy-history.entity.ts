import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { Vacancy } from './vacancy.entity'
import { User } from 'src/modules/user/entities/user.entity'

@Entity('GP_VAGAS_HISTORICO')
export class VacancyHistory {
  @PrimaryGeneratedColumn({
    name: 'CODIGO',
    type: 'number',
  })
  code: number

  @Column({
    name: 'VAGA_ID',
    type: 'number',
    nullable: false,
  })
  vacancyId: number

  @ManyToOne(() => Vacancy, { eager: false })
  @JoinColumn({ name: 'VAGA_ID' })
  vacancy: Vacancy

  @Column({
    name: 'ACAO',
    type: 'varchar2',
    length: 50,
    nullable: false,
  })
  action: string

  @Column({
    name: 'RESPONSAVEL_ID',
    type: 'number',
    nullable: false,
  })
  responsibleId: number

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'RESPONSAVEL_ID' })
  responsible: User

  @Column({
    name: 'DATA',
    type: 'date',
    default: () => 'SYSDATE',
    nullable: false,
  })
  date: Date

  @Column({
    name: 'OBSERVACAO',
    type: 'varchar2',
    length: 2000,
    nullable: true,
  })
  observation: string | null

  @Column({
    name: 'JUSTIFICATIVA',
    type: 'varchar2',
    length: 1000,
    nullable: true,
  })
  justification: string | null
}
