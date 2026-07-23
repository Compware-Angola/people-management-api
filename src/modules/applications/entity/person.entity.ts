import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'FK2_TB_PESSOA' })
export class PersonEntity {
  @PrimaryGeneratedColumn({
    name: 'PK_PESSOA',
    type: 'number',
  })
  declare id: number

  @Column({
    name: 'NOME_COMPLETO',
    type: 'varchar2',
    length: 100,
    nullable: true,
  })
  fullName?: string

  @Column({
    name: 'NOME_DO_PAI',
    type: 'varchar2',
    length: 100,
    nullable: true,
  })
  fatherName?: string

  @Column({
    name: 'NOME_DA_MAE',
    type: 'varchar2',
    length: 100,
    nullable: true,
  })
  motherName?: string

  @Column({
    name: 'DATA_DE_NASCIMENTO',
    type: 'date',
    nullable: true,
  })
  birthDate?: Date

  @Column({
    name: 'NUM_DOC_IDENTIFICACAO',
    type: 'varchar2',
    length: 100,
    nullable: true,
  })
  documentNumber?: string

  @Column({
    name: 'FK_TIPO_DOCUMENTO_IDENTIFICACAO',
    type: 'number',
    nullable: true,
  })
  documentTypeId?: number

  @Column({
    name: 'DATA_DE_EMISSAO_DOCUMENTO',
    type: 'date',
    nullable: true,
  })
  documentIssueDate?: Date

  @Column({
    name: 'DATA_DE_EXPIRACAO_DOCUMENTO',
    type: 'date',
    nullable: true,
  })
  documentExpirationDate?: Date

  @Column({
    name: 'FK_GENERO',
    type: 'number',
    nullable: true,
  })
  genderId?: number

  @Column({
    name: 'FK_NACIONALIDADE',
    type: 'number',
    nullable: true,
  })
  nationalityId?: number

  @Column({
    name: 'ENDERECO',
    type: 'varchar2',
    length: 255,
    nullable: true,
  })
  address?: string

  @Column({
    name: 'FK_NATURALIDADE',
    type: 'number',
    nullable: true,
  })
  birthplaceId?: number

  @Column({
    name: 'FK_ESTADO_CIVIL',
    type: 'number',
    nullable: true,
  })
  maritalStatusId?: number

  @Column({
    name: 'TELEFONE1',
    type: 'varchar2',
    length: 50,
    nullable: true,
  })
  phone?: string

  @Column({
    name: 'TELEFONE2',
    type: 'varchar2',
    length: 50,
    nullable: true,
  })
  alternativePhone?: string

  @Column({
    name: 'EMAIL',
    type: 'varchar2',
    length: 50,
    nullable: true,
  })
  email?: string

  @Column({
    name: 'CREATED_BY',
    type: 'number',
    nullable: true,
  })
  createdBy?: number

  @Column({
    name: 'LAST_UPDATED_BY',
    type: 'number',
    nullable: true,
  })
  updatedBy?: number

  @Column({
    name: 'CREATED_AT',
    type: 'date',
    nullable: true,
  })
  createdAt?: Date

  @Column({
    name: 'UPDATED_AT',
    type: 'date',
    nullable: true,
  })
  updatedAt?: Date

  @Column({
    name: 'ACTIVE_STATE',
    type: 'number',
    nullable: true,
  })
  activeState?: number
}
