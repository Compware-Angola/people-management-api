import { Injectable } from '@nestjs/common'
import { UserRepository } from './user-repository'
import { UserEntity } from '../entity/user.entity'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { CreateUserDto } from '../dto/create-user.dto'
import { UpdateUserDto } from '../dto/update-user.dto'
import { ListUserDto } from '../dto/list-user.dto'


@Injectable()
export class TypeormUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  async create(data: CreateUserDto): Promise<UserEntity> {
    const user = this.repository.create({
      ...data,
      status: 1,
      mustChangePassword: 1,
    })
    return this.repository.save(user)
  }

  async findById(id: number): Promise<UserEntity | null> {
    return this.repository.findOne({
      where: {
        id,
      },
    })
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.repository.findOne({
      where: {
        email,
      },
    })
  }

async list(params: ListUserDto) {
  const {
    page = 1,
    limit = 20,
    search,
    status,
  } = params


  const query =
    this.repository.createQueryBuilder('user')


  if (search) {

    const normalizedSearch =
      search
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()


    query.andWhere(
      `
      (
        LOWER(
          TRANSLATE(
            user.NOME,
            'ÁÀÃÂÄÉÈÊËÍÌÎÏÓÒÕÔÖÚÙÛÜÇáàãâäéèêëíìîïóòõôöúùûüç',
            'AAAAAEEEEIIIIOOOOOUUUUCaaaaaeeeeiiiiooooouuuuc'
          )
        ) LIKE :search

        OR

        LOWER(
          TRANSLATE(
            user.EMAIL,
            'ÁÀÃÂÄÉÈÊËÍÌÎÏÓÒÕÔÖÚÙÛÜÇáàãâäéèêëíìîïóòõôöúùûüç',
            'AAAAAEEEEIIIIOOOOOUUUUCaaaaaeeeeiiiiooooouuuuc'
          )
        ) LIKE :search

        OR

        LOWER(user.BI) LIKE :search
      )
      `,
      {
        search: `%${normalizedSearch}%`,
      },
    )
  }


  if (status !== undefined) {
    query.andWhere(
      'user.ESTADO = :status',
      {
        status,
      },
    )
  }


  const [
    data,
    total,
  ] = await query
    .skip((page - 1) * limit)
    .take(limit)
    .getManyAndCount()


  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

  async update(id: number, data: UpdateUserDto) {
    await this.repository.update(id, data)

    const user = await this.findById(id)

    if (!user) {
      throw new Error('User not found')
    }

    return user
  }
}
