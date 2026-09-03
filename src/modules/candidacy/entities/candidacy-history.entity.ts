import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { Candidacy } from './candidacy.entity'

@Entity('GP_CANDIDATURAS_HISTORICO')
export class CandidacyHistory {
  @PrimaryGeneratedColumn({
    name: 'CODIGO',
    type: 'number',
  })
  code: number

  @Column({
    name: 'CODIGO_CANDIDATURA',
    type: 'number',
    nullable: false,
  })
  candidacyId: number

  @ManyToOne(() => Candidacy, (candidacy) => candidacy.history, {
    eager: false,
  })
  @JoinColumn({ name: 'CODIGO_CANDIDATURA' })
  candidacy: Candidacy

  @Column({
    name: 'ACAO',
    type: 'varchar2',
    length: 50,
    nullable: false,
  })
  action: string

  @Column({
    name: 'ESTADO_ANTERIOR',
    type: 'number',
    nullable: true,
  })
  previousState: number | null

  @Column({
    name: 'ESTADO_NOVO',
    type: 'number',
    nullable: true,
  })
  newState: number | null

  /**
   * Utilizador responsável pela ação. É nulo quando a ação é despoletada
   * de forma automática pelo sistema.
   */
  @Column({
    name: 'RESPONSAVEL_ID',
    type: 'number',
    nullable: true,
  })
  responsibleId: number | null

  @Column({
    name: 'OBSERVACAO',
    type: 'varchar2',
    length: 2000,
    nullable: true,
  })
  note: string | null

  @Column({
    name: 'DATA',
    type: 'date',
    default: () => 'SYSDATE',
    nullable: false,
  })
  date: Date
}
