import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Index,
  DeleteDateColumn,
} from 'typeorm'
export enum CriteriaStatus {
  INACTIVE = 0,
  ACTIVE = 1,
}
@Entity('GP_CRITERIOS')
@Index('UQ_GP_CRITERIOS_DESCRICAO_ATIVA', ['description'], {
  unique: true,
  where: '"DELETADO_EM" IS NULL',
})
export class Criteria {
  @PrimaryGeneratedColumn({
    name: 'CODIGO',
    type: 'number',
  })
  declare id: number

  @Column({
    name: 'DESCRICAO',
    type: 'varchar2',
    length: 255,
  })
  declare description: string

  @Column({
    name: 'ESTADO',
    type: 'number',
    precision: 1,
    scale: 0,
    default: CriteriaStatus.ACTIVE,
  })
  declare status: CriteriaStatus

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
