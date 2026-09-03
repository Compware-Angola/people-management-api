import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm'

export enum AcademicDegreeStatus {
  INACTIVE = 0,
  ACTIVE = 1,
}

@Entity('GP_GRAU_ACADEMICO')
@Index('UQ_GP_GRAU_ACAD_DESIGNACAO_ATIVA', ['designation'], {
  unique: true,
  where: '"DELETADO_EM" IS NULL',
})
@Index('UQ_GP_GRAU_ACAD_SIGLA_ATIVA', ['acronym'], {
  unique: true,
  where: '"DELETADO_EM" IS NULL',
})
export class AcademicDegree {
  @PrimaryGeneratedColumn({
    name: 'CODIGO',
    type: 'number',
  })
  declare id: number

  @Column({
    name: 'DESIGNACAO',
    type: 'varchar2',
    length: 100,
  })
  declare designation: string

  @Column({
    name: 'SIGLA',
    type: 'varchar2',
    length: 30,
    nullable: true,
  })
  declare acronym: string | null

  @Column({
    name: 'ORDEM',
    type: 'number',
  })
  declare order: number

  @Column({
    name: 'ESTADO',
    type: 'number',
    precision: 1,
    scale: 0,
    default: AcademicDegreeStatus.ACTIVE,
  })
  declare status: AcademicDegreeStatus

  @CreateDateColumn({
    name: 'CRIADO_EM',
    type: 'date',
    default: () => 'SYSDATE',
  })
  declare createdAt: Date

  @DeleteDateColumn({
    name: 'DELETADO_EM',
    type: 'date',
    nullable: true,
  })
  declare deletedAt: Date | null
}
