import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ILike, IsNull, Not, Raw, Repository } from 'typeorm'
import { HiringType } from '../entity/hiring-type.entity'
import { PaginatedResponseDto } from 'src/commons/dto/pagination-response.dto'
import { ListHiringTypesQueryDto } from '../dto/list-hiring-types-query.dto'
import { CreateHiringTypeDto } from '../dto/create-hiring-type.dto'
import { UpdateHiringTypeDto } from '../dto/update-hiring-type.dto'

@Injectable()
export class HiringTypesService {
  constructor(
    @InjectRepository(HiringType)
    private readonly gpHiringTypeRepository: Repository<HiringType>,
  ) {}

  async create(dto: CreateHiringTypeDto): Promise<HiringType> {
    const payload = this.normalize(dto)

    await this.assertDescriptionAvailable(payload.description)
    await this.assertAcronymAvailable(payload.acronym)

    const hiringType = this.gpHiringTypeRepository.create(payload)
    return this.gpHiringTypeRepository.save(hiringType)
  }

  async findAll(
    query: ListHiringTypesQueryDto,
  ): Promise<PaginatedResponseDto<HiringType>> {
    const { search, acronym, status, page, limit, offset } = query

    const [data, total] = await this.gpHiringTypeRepository.findAndCount({
      where: {
        deletedAt: IsNull(),
        ...(search ? { description: ILike(`%${search}%`) } : {}),
        ...(acronym ? { acronym } : {}),
        ...(status !== undefined ? { status } : {}),
      },
      order: { code: 'ASC' },
      skip: offset,
      take: limit,
    })

    return PaginatedResponseDto.create(data, total, page, limit)
  }

  async findOne(code: number): Promise<HiringType> {
    const hiringType = await this.gpHiringTypeRepository.findOne({
      where: { code, deletedAt: IsNull() },
    })
    if (!hiringType) {
      throw new NotFoundException(
        `Tipo de contratação com o código ${code} não encontrado`,
      )
    }
    return hiringType
  }

  async update(code: number, dto: UpdateHiringTypeDto): Promise<HiringType> {
    const hiringType = await this.findOne(code)
    const payload = this.normalize(dto)

    if (payload.description !== undefined) {
      await this.assertDescriptionAvailable(payload.description, code)
    }

    if (payload.acronym !== undefined) {
      await this.assertAcronymAvailable(payload.acronym, code)
    }

    Object.assign(hiringType, payload)
    return this.gpHiringTypeRepository.save(hiringType)
  }

  async remove(code: number): Promise<void> {
    const hiringType = await this.findOne(code)
    await this.gpHiringTypeRepository.softDelete({ code: hiringType.code })
  }

  private normalize<T extends CreateHiringTypeDto | UpdateHiringTypeDto>(
    dto: T,
  ): T {
    return {
      ...dto,
      ...(dto.acronym !== undefined ? { acronym: dto.acronym.trim() } : {}),
      ...(dto.description !== undefined
        ? { description: dto.description.trim() }
        : {}),
    }
  }

  private async assertDescriptionAvailable(
    description: string,
    excludeCode?: number,
  ): Promise<void> {
    const existing = await this.gpHiringTypeRepository.findOne({
      where: {
        description: Raw((alias) => `LOWER(${alias}) = LOWER(:description)`, {
          description: description.trim(),
        }),
        ...(excludeCode !== undefined ? { code: Not(excludeCode) } : {}),
      },
    })
    if (existing) {
      throw new ConflictException(
        `Tipo de contratação com a descrição ${description} já existe`,
      )
    }
  }

  private async assertAcronymAvailable(
    acronym: string,
    excludeCode?: number,
  ): Promise<void> {
    const existing = await this.gpHiringTypeRepository.findOne({
      where: {
        acronym: Raw((alias) => `LOWER(${alias}) = LOWER(:acronym)`, {
          acronym: acronym.trim(),
        }),
        ...(excludeCode !== undefined ? { code: Not(excludeCode) } : {}),
      },
    })
    if (existing) {
      throw new ConflictException(
        `Tipo de contratação com a sigla ${acronym} já existe`,
      )
    }
  }
}
