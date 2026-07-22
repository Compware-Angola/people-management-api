import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { CreateUserDto } from '../dto/create-user.dto'
import { UpdateUserDto } from '../dto/update-user.dto'
import {
  UserRepository,
  
} from '../repositories/user-repository'
import { ListUserDto } from '../dto/list-user.dto'

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(dto: CreateUserDto) {
    const existingUser = await this.userRepository.findByEmail(dto.email)

    if (existingUser) {
      throw new ConflictException('User email already exists')
    }
    /* 
    TODO:   FAZER HASH DA SENHA
            TRANSACTION AO CRIAR UMA COMNTA TBM CRIA UM CANDIDATO
    */
    const passwordHash = dto.bi
    return this.userRepository.create({ ...dto, password: passwordHash })
  }

  async findAll(params: ListUserDto) {
    return this.userRepository.list(params)
  }

  async findOne(id: number) {
    const user = await this.userRepository.findById(id)

    if (!user) {
      throw new NotFoundException('Usuario nao encontrado!')
    }

    return user
  }

  async update(id: number, dto: UpdateUserDto) {
    await this.findOne(id)

    return this.userRepository.update(id, dto)
  }
}
