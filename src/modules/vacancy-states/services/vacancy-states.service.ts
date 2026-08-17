import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ILike, Repository } from 'typeorm'
import { VacancyState } from '../entity/vacancy-state.entity'
import { PaginatedResponseDto } from 'src/commons/dto/pagination-response.dto'
import { ListVacancyStatesQueryDto } from '../dto/list-vacancy-states-query.dto'

@Injectable()
export class VacancyStatesService {
  constructor(
    @InjectRepository(VacancyState)
    private readonly gpVacancyStateRepository: Repository<VacancyState>,
  ) {}

  async findAll(
    query: ListVacancyStatesQueryDto,
  ): Promise<PaginatedResponseDto<VacancyState>> {
    const { search, acronym, code, page, limit, offset } = query

    const [data, total] = await this.gpVacancyStateRepository.findAndCount({
      where: {
        ...(search ? { description: ILike(`%${search}%`) } : {}),
        ...(acronym ? { acronym } : {}),
        ...(code !== undefined ? { code } : {}),
      },
      order: { order: 'ASC' },
      skip: offset,
      take: limit,
    })

    return PaginatedResponseDto.create(data, total, page, limit)
  }

  async findOne(code: number): Promise<VacancyState> {
    const state = await this.gpVacancyStateRepository.findOne({
      where: { code },
    })
    if (!state) {
      throw new NotFoundException(
        `Estado de vaga com o código ${code} não encontrado`,
      )
    }
    return state
  }
}
