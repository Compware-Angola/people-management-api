import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity('GP_CRITERIOS_VAGAS')
@Index('UQ_CRIT_VAGAS_VAGA_CRITERIO', ['vacancyId', 'criteriaId'], {
  unique: true,
})
export class CriteriaVacancy {
  @PrimaryGeneratedColumn({
    name: 'CODIGO',
    type: 'number',
  })
  declare id: number

  @Column({
    name: 'VAGA_ID',
    type: 'number',
  })
  declare vacancyId: number

  @Column({
    name: 'CRITERIO_ID',
    type: 'number',
  })
  declare criteriaId: number

  @Column({
    name: 'PESO',
    type: 'number',
    precision: 5,
    scale: 2,
  })
  declare weight: number

  @CreateDateColumn({
    name: 'CRIADO_EM',
    type: 'date',
    default: () => 'SYSDATE',
  })
  declare createdAt: Date
}
