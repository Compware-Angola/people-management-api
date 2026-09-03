import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ILike, Repository } from 'typeorm'

import { PaginatedResponseDto } from 'src/commons/dto/pagination-response.dto'

import { InterviewScheduleStateEntity } from '../entities/interview-schedule-state.entity'
import { ListLookupQueryDto } from '../dto/list-lookup-query.dto'

@Injectable()
export class InterviewScheduleStateService {
  constructor(
    @InjectRepository(InterviewScheduleStateEntity)
    private readonly stateRepository: Repository<InterviewScheduleStateEntity>,
  ) {}

  async findAll(
    query: ListLookupQueryDto,
  ): Promise<PaginatedResponseDto<InterviewScheduleStateEntity>> {
    const { search, page = 1, limit = 10 } = query
    const term = search?.trim()

    const [data, total] = await this.stateRepository.findAndCount({
      where: term ? { designation: ILike(`%${term}%`) } : {},
      order: { designation: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    })

    return PaginatedResponseDto.create(data, total, page, limit)
  }

  async findOne(id: number): Promise<InterviewScheduleStateEntity> {
    const state = await this.stateRepository.findOne({ where: { id } })

    if (!state) {
      throw new NotFoundException(
        `Estado de agendamento com o código ${id} não encontrado`,
      )
    }

    return state
  }
}
