import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ILike, IsNull, Repository } from 'typeorm'
import { HiringType } from '../entity/hiring-type.entity'
import { PaginatedResponseDto } from 'src/commons/dto/pagination-response.dto'
import { ListHiringTypesQueryDto } from '../dto/list-hiring-types-query.dto'

@Injectable()
export class HiringTypesService {
  constructor(
    @InjectRepository(HiringType)
    private readonly gpHiringTypeRepository: Repository<HiringType>,
  ) {}

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
}
