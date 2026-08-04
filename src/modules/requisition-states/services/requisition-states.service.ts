import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ILike, Repository } from 'typeorm'
import { RequisitionState } from '../entity/requisition-state.entity'
import { PaginatedResponseDto } from 'src/commons/dto/pagination-response.dto'
import { ListRequisitionStatesQueryDto } from '../dto/list-requisition-states-query.dto'

@Injectable()
export class RequisitionStatesService {
  constructor(
    @InjectRepository(RequisitionState)
    private readonly gpRequisitionStateRepository: Repository<RequisitionState>,
  ) {}

  async findAll(
    query: ListRequisitionStatesQueryDto,
  ): Promise<PaginatedResponseDto<RequisitionState>> {
    const { search, acronym, code, page, limit, offset } = query

    const [data, total] = await this.gpRequisitionStateRepository.findAndCount({
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

  async findOne(code: number): Promise<RequisitionState> {
    const state = await this.gpRequisitionStateRepository.findOne({
      where: { code },
    })
    if (!state) {
      throw new NotFoundException(
        `Estado de requisição com o código ${code} não encontrado`,
      )
    }
    return state
  }
}
