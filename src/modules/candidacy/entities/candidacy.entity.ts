import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm'
import { Vacancy } from 'src/modules/vacancies/entity/vacancy.entity'
import { CandidacyHistory } from './candidacy-history.entity'

/**
 * Estados possíveis de uma candidatura a uma vaga.
 * O valor numérico é o que fica persistido na coluna GP_CANDIDATURAS.ESTADO.
 */
export enum CandidacyStateCode {
  /** Candidatura submetida pelo candidato, ainda não triada. */
  SUBMITTED = 1,
  /** Em análise pela equipa de recrutamento. */
  UNDER_REVIEW = 2,
  /** Admitida para as fases seguintes do processo. */
  ADMITTED = 3,
  /** Rejeitada pela equipa de recrutamento. */
  REJECTED = 4,
  /** Retirada/desistida pelo próprio candidato. */
  WITHDRAWN = 5,
}

export const CANDIDACY_STATE_LABEL: Record<number, string> = {
  [CandidacyStateCode.SUBMITTED]: 'SUBMETIDA',
  [CandidacyStateCode.UNDER_REVIEW]: 'EM_ANALISE',
  [CandidacyStateCode.ADMITTED]: 'ADMITIDA',
  [CandidacyStateCode.REJECTED]: 'REJEITADA',
  [CandidacyStateCode.WITHDRAWN]: 'RETIRADA',
}

@Entity('GP_CANDIDATURAS')
export class Candidacy {
  @PrimaryGeneratedColumn({
    name: 'CODIGO',
    type: 'number',
  })
  code: number

  @Column({
    name: 'CODIGO_VAGA',
    type: 'number',
    nullable: false,
  })
  vacancyId: number

  @ManyToOne(() => Vacancy, { eager: false })
  @JoinColumn({ name: 'CODIGO_VAGA' })
  vacancy: Vacancy

  /**
   * Código do perfil de candidatura (FK2_MGD_TB_CANDIDATURA.CODIGO) do candidato.
   * É resolvido a partir do utilizador autenticado no momento da candidatura.
   */
  @Column({
    name: 'CODIGO_CANDIDATO',
    type: 'number',
    nullable: false,
  })
  candidateId: number

  @Column({
    name: 'ESTADO',
    type: 'number',
    nullable: false,
  })
  state: CandidacyStateCode

  @Column({
    name: 'CRIADO_EM',
    type: 'date',
    default: () => 'SYSDATE',
    nullable: false,
  })
  createdAt: Date

  @Column({
    name: 'ATUALIZADO_EM',
    type: 'date',
    nullable: true,
  })
  updatedAt: Date | null

  @OneToMany(() => CandidacyHistory, (history) => history.candidacy)
  history: CandidacyHistory[]
}
