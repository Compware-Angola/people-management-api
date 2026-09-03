import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ILike, Repository } from 'typeorm'

import { PaginatedResponseDto } from 'src/commons/dto/pagination-response.dto'

import { InterviewModalityEntity } from '../entities/interview-modality.entity'
import { ListLookupQueryDto } from '../dto/list-lookup-query.dto'

@Injectable()
export class InterviewModalityService {
  constructor(
    @InjectRepository(InterviewModalityEntity)
    private readonly modalityRepository: Repository<InterviewModalityEntity>,
  ) {}

  async findAll(
    query: ListLookupQueryDto,
  ): Promise<PaginatedResponseDto<InterviewModalityEntity>> {
    const { search, page = 1, limit = 10 } = query
    const term = search?.trim()

    const [data, total] = await this.modalityRepository.findAndCount({
      where: term ? { designation: ILike(`%${term}%`) } : {},
      order: { designation: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    })

    return PaginatedResponseDto.create(data, total, page, limit)
  }

  async findOne(id: number): Promise<InterviewModalityEntity> {
    const modality = await this.modalityRepository.findOne({ where: { id } })

    if (!modality) {
      throw new NotFoundException(
        `Modalidade com o código ${id} não encontrada`,
      )
    }

    return modality
  }
}
