import { PersonEntity } from 'src/modules/user/entities/person.entity'
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity({ name: 'GP_EXP_PROFISSIONAL' })
export class ProfessionalExperienceEntity {
  @PrimaryGeneratedColumn({
    name: 'CODIGO',
    type: 'number',
  })
  id: number

  @Column({
    name: 'INSTITUICAO',
    type: 'varchar2',
    length: 255,
    nullable: true,
  })
  institution: string | null

  @Column({
    name: 'AREA',
    type: 'varchar2',
    length: 255,
    nullable: true,
  })
  area: string | null

  @Column({
    name: 'FUNCAO',
    type: 'varchar2',
    length: 255,
    nullable: true,
  })
  function: string | null

  @Column({
    name: 'CARGO',
    type: 'varchar2',
    length: 255,
    nullable: true,
  })
  position: string | null

  @Column({
    name: 'ANO_INICIO',
    type: 'number',
    nullable: true,
  })
  startYear: number | null

  @Column({
    name: 'ANO_FIM',
    type: 'number',
    nullable: true,
  })
  endYear: number | null

  @Column({
    name: 'CRIADO_EM',
    type: 'date',
    default: () => 'SYSDATE',
  })
  createdAt: Date

  @Column({
    name: 'CODIGO_PESSOA',
    type: 'number',
    nullable: true,
  })
  personId: number | null

  @ManyToOne(() => PersonEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'CODIGO_PESSOA',
    referencedColumnName: 'id',
  })
  person: PersonEntity | null
}
