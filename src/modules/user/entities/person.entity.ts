import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'GP_PESSOA' })
export class PersonEntity {
  @PrimaryGeneratedColumn({
    name: 'CODIGO',
    type: 'number',
  })
  id: number

  @Column({
    name: 'NOME',
    type: 'varchar2',
    length: 255,
  })
  name: string

  @Column({
    name: 'BI',
    type: 'varchar2',
    length: 50,
    nullable: true,
  })
  identityDocument: string | null

  @Column({
    name: 'NIF',
    type: 'varchar2',
    length: 50,
    nullable: true,
  })
  taxIdentificationNumber: string | null

  @Column({
    name: 'TELEFONE',
    type: 'varchar2',
    length: 30,
    nullable: true,
  })
  phone: string | null

  @Column({
    name: 'TELEFONE_ALTERNATIVO',
    type: 'varchar2',
    length: 30,
    nullable: true,
  })
  alternativePhone: string | null

  @Column({
    name: 'NOME_MAE',
    type: 'varchar2',
    length: 255,
    nullable: true,
  })
  motherName: string | null

  @Column({
    name: 'NOME_PAI',
    type: 'varchar2',
    length: 255,
    nullable: true,
  })
  fatherName: string | null

  @Column({
    name: 'CODIGO_NACIONALIDADE',
    type: 'number',
    nullable: true,
  })
  nationalityId: number | null

  @Column({
    name: 'CODIGO_ESTADO_CIVIL',
    type: 'number',
    nullable: true,
  })
  maritalStatusId: number | null

  @Column({
    name: 'CODIGO_GENERO',
    type: 'number',
    nullable: true,
  })
  genderId: number | null

  @Column({
    name: 'DATA_NASCIMENTO',
    type: 'date',
    nullable: true,
  })
  birthDate: Date | null

  @Column({
    name: 'DATA_DE_EMISSAO_DOCUMENTO',
    type: 'date',
    nullable: true,
  })
  documentIssueDate: Date | null

  @Column({
    name: 'DATA_DE_EXPIRACAO_DOCUMENTO',
    type: 'date',
    nullable: true,
  })
  documentExpirationDate: Date | null

  @Column({
    name: 'STATUS',
    type: 'number',
    precision: 1,
    default: 1,
  })
  status: number
}
