import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  DeleteDateColumn,
  Unique,
} from 'typeorm'

export enum HiringTypeCode {
  INDEFINITE_CONTRACT = 'CTI',
  FIXED_TERM_CONTRACT = 'CTD',
  TEMPORARY = 'TEMP',
  INTERNSHIP = 'ESTAGIO',
  SERVICE_PROVISION = 'SERVICO',
  OTHER = 'OUTRO',
}

@Entity('GP_TIPOS_CONTRATACAO')
@Unique('UQ_GP_TIPOS_CONTRATACAO_DESCRICAO', ['description'])
@Unique('UQ_GP_TIPOS_CONTRATACAO_SIGLA', ['acronym'])
export class HiringType {
  @PrimaryGeneratedColumn({
    name: 'CODIGO',
    type: 'number',
  })
  code: number

  @Column({
    name: 'SIGLA',
    type: 'varchar2',
    length: 20,
    nullable: false,
  })
  acronym: string

  @Column({
    name: 'DESCRICAO',
    type: 'varchar2',
    length: 150,
    nullable: false,
  })
  description: string

  @Column({
    name: 'ESTADO',
    type: 'number',
    precision: 1,
    scale: 0,
    default: 1,
    nullable: false,
  })
  status: number

  @Column({
    name: 'CRIADO_EM',
    type: 'date',
    default: () => 'SYSDATE',
    nullable: false,
  })
  createdAt: Date

  @DeleteDateColumn({
    name: 'DELETADO_EM',
    type: 'date',
  })
  deletedAt: Date | null
}
