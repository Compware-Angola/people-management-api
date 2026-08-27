import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ILike, IsNull, Repository } from 'typeorm'
import { PaginatedResponseDto } from 'src/commons/dto/pagination-response.dto'
import {
  VacancyRequestType,
  VacancyRequestTypeStatus,
} from '../entity/vacancy-request-type.entity'

import { CreateVacancyRequestTypeDto } from '../dto/create-vacancy-request-type.dto'
import { UpdateVacancyRequestTypeDto } from '../dto/update-vacancy-request-type.dto'
import { ListVacancyRequestTypeQueryDto } from '../dto/list-vacancy-request-type-query.dto'

@Injectable()
export class VacancyRequestTypeService {
  constructor(
    @InjectRepository(VacancyRequestType)
    private readonly vacancyRequestTypeRepository: Repository<VacancyRequestType>,
  ) {}

  async create(dto: CreateVacancyRequestTypeDto): Promise<VacancyRequestType> {
    const acronym = dto.acronym.trim().toUpperCase()
    const description = dto.description.trim()

    const acronymAlreadyExists =
      await this.vacancyRequestTypeRepository.findOne({
        where: {
          acronym,
          deletedAt: IsNull(),
        },
      })

    if (acronymAlreadyExists) {
      throw new ConflictException(
        `A sigla "${acronym}" já está sendo utilizada`,
      )
    }

    const descriptionAlreadyExists =
      await this.vacancyRequestTypeRepository.findOne({
        where: {
          description,
          deletedAt: IsNull(),
        },
      })

    if (descriptionAlreadyExists) {
      throw new ConflictException(
        `O tipo de requisição com a descrição "${description}" já existe`,
      )
    }

    const vacancyRequestType = this.vacancyRequestTypeRepository.create({
      acronym,
      description,
      status: dto.status ?? VacancyRequestTypeStatus.ACTIVE,
      deletedAt: null,
    })

    return this.vacancyRequestTypeRepository.save(vacancyRequestType)
  }

  async findAll(
    query: ListVacancyRequestTypeQueryDto,
  ): Promise<PaginatedResponseDto<VacancyRequestType>> {
    const { search, status, page = 1, limit = 10 } = query

    const normalizedSearch = search?.trim()

    const where = normalizedSearch
      ? [
          {
            acronym: ILike(`%${normalizedSearch}%`),
            deletedAt: IsNull(),
            ...(status !== undefined ? { status } : {}),
          },
          {
            description: ILike(`%${normalizedSearch}%`),
            deletedAt: IsNull(),
            ...(status !== undefined ? { status } : {}),
          },
        ]
      : {
          deletedAt: IsNull(),
          ...(status !== undefined ? { status } : {}),
        }

    const [data, total] = await this.vacancyRequestTypeRepository.findAndCount({
      where,
      order: {
        id: 'DESC',
      },
      skip: (page - 1) * limit,
      take: limit,
    })

    return PaginatedResponseDto.create(data, total, page, limit)
  }

  async findOne(id: number): Promise<VacancyRequestType> {
    const vacancyRequestType = await this.vacancyRequestTypeRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    })

    if (!vacancyRequestType) {
      throw new NotFoundException(
        `Tipo de requisição de vaga com o código ${id} não encontrado`,
      )
    }

    return vacancyRequestType
  }

  async update(
    id: number,
    dto: UpdateVacancyRequestTypeDto,
  ): Promise<VacancyRequestType> {
    const vacancyRequestType = await this.findOne(id)

    if (dto.acronym !== undefined) {
      const acronym = dto.acronym.trim().toUpperCase()

      const acronymAlreadyExists =
        await this.vacancyRequestTypeRepository.findOne({
          where: {
            acronym,
            deletedAt: IsNull(),
          },
        })

      if (acronymAlreadyExists && acronymAlreadyExists.id !== id) {
        throw new ConflictException(
          `A sigla "${acronym}" já está sendo utilizada`,
        )
      }

      vacancyRequestType.acronym = acronym
    }

    if (dto.description !== undefined) {
      const description = dto.description.trim()

      const descriptionAlreadyExists =
        await this.vacancyRequestTypeRepository.findOne({
          where: {
            description,
            deletedAt: IsNull(),
          },
        })

      if (descriptionAlreadyExists && descriptionAlreadyExists.id !== id) {
        throw new ConflictException(
          `O tipo de requisição com a descrição "${description}" já existe`,
        )
      }

      vacancyRequestType.description = description
    }

    if (dto.status !== undefined) {
      vacancyRequestType.status = dto.status
    }

    return this.vacancyRequestTypeRepository.save(vacancyRequestType)
  }

  async remove(id: number): Promise<void> {
    const vacancyRequestType = await this.findOne(id)

    await this.vacancyRequestTypeRepository.softDelete({
      id: vacancyRequestType.id,
    })
  }
}
