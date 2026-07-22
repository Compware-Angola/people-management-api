import { CreateUserDto } from '../dto/create-user.dto'
import { ListUserDto } from '../dto/list-user.dto'
import { UpdateUserDto } from '../dto/update-user.dto'
import { UserEntity } from '../entity/user.entity'

export type PaginatedResult<T> = {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
type CreateUserParams = CreateUserDto & {
  password: string
}
export abstract class UserRepository {
  abstract create(data: CreateUserParams): Promise<UserEntity>
  abstract findById(id: number): Promise<UserEntity | null>
  abstract findByEmail(email: string): Promise<UserEntity | null>
  abstract list(params: ListUserDto): Promise<PaginatedResult<UserEntity>>
  abstract update(id: number, data: UpdateUserDto): Promise<UserEntity>
}
