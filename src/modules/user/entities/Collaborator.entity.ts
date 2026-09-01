import { Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'GP_USER_COLABORADOR' })
export class Collaborator {
  @PrimaryGeneratedColumn('identity', { name: 'CODIGO' })
  declare id: number

  declare personId: number
  declare EMAIL: string
  declare USERNAME: string
}
