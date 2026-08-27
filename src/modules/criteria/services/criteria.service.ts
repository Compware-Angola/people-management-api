import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ILike, IsNull, Repository } from 'typeorm'
import { PaginatedResponseDto } from 'src/commons/dto/pagination-response.dto'
import { Criteria, CriteriaStatus } from '../entity/criteria.entity'
import { CreateCriteriaDto } from '../dto/create-criteria.dto'
import { UpdateCriteriaDto } from '../dto/update-criteria.dto'
import { ListCriteriaQueryDto } from '../dto/list-criteria-query.dto'

@Injectable()
export class CriteriaService {
  constructor(
    @InjectRepository(Criteria)
    private readonly criteriaRepository: Repository<Criteria>,
  ) {}

  async create(dto: CreateCriteriaDto): Promise<Criteria> {
    const description = dto.description.trim()

    const criteriaAlreadyExists = await this.criteriaRepository.findOne({
      where: {
        description,
        deletedAt: IsNull(),
      },
    })

    if (criteriaAlreadyExists) {
      throw new ConflictException(
        `Critério com a descrição "${description}" já existe`,
      )
    }

    const criteria = this.criteriaRepository.create({
      description,
      status: dto.status ?? CriteriaStatus.ACTIVE,
      deletedAt: null,
    })

    return this.criteriaRepository.save(criteria)
  }

  async findAll(
    query: ListCriteriaQueryDto,
  ): Promise<PaginatedResponseDto<Criteria>> {
    const { search, status, page = 1, limit = 10 } = query

    const [data, total] = await this.criteriaRepository.findAndCount({
      where: {
        deletedAt: IsNull(),
        ...(search
          ? {
              description: ILike(`%${search.trim()}%`),
            }
          : {}),
        ...(status !== undefined
          ? {
              status,
            }
          : {}),
      },
      order: {
        id: 'DESC',
      },
      skip: (page - 1) * limit,
      take: limit,
    })

    return PaginatedResponseDto.create(data, total, page, limit)
  }

  async findOne(id: number): Promise<Criteria> {
    const criteria = await this.criteriaRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    })

    if (!criteria) {
      throw new NotFoundException(`Critério com o código ${id} não encontrado`)
    }

    return criteria
  }

  async update(id: number, dto: UpdateCriteriaDto): Promise<Criteria> {
    const criteria = await this.findOne(id)

    if (dto.description !== undefined) {
      const description = dto.description.trim()

      const criteriaAlreadyExists = await this.criteriaRepository.findOne({
        where: {
          description,
          deletedAt: IsNull(),
        },
      })

      if (criteriaAlreadyExists && criteriaAlreadyExists.id !== id) {
        throw new ConflictException(
          `Critério com a descrição "${description}" já existe`,
        )
      }

      criteria.description = description
    }

    if (dto.status !== undefined) {
      criteria.status = dto.status
    }

    return this.criteriaRepository.save(criteria)
  }

  async remove(id: number): Promise<void> {
    const criteria = await this.findOne(id)

    await this.criteriaRepository.softDelete({
      id: criteria.id,
    })
  }
}
