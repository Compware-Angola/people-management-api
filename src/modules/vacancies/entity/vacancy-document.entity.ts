import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { Vacancy } from './vacancy.entity'
import { User } from 'src/modules/user/entities/user.entity'

@Entity('GP_VAGAS_DOCUMENTOS')
export class VacancyDocument {
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
    name: 'TIPO',
    type: 'varchar2',
    length: 30,
    nullable: false,
  })
  type: string

  @Column({
    name: 'CAMINHO',
    type: 'varchar2',
    length: 500,
    nullable: false,
  })
  path: string

  @Column({
    name: 'NOME_ORIGINAL',
    type: 'varchar2',
    length: 255,
    nullable: false,
  })
  originalName: string

  @Column({
    name: 'DESCRICAO',
    type: 'varchar2',
    length: 255,
    nullable: true,
  })
  description: string | null

  @Column({
    name: 'ENVIADO_POR',
    type: 'number',
    nullable: false,
  })
  uploadedBy: number

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'ENVIADO_POR' })
  uploadedByUser: User

  @Column({
    name: 'CRIADO_EM',
    type: 'date',
    default: () => 'SYSDATE',
    nullable: false,
  })
  createdAt: Date
}
