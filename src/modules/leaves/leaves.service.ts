import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm'
import { CreateLeaveDto } from './dto/create-leave.dto'
import { UpdateLeaveDto, LeaveStatus } from './dto/update-leave.dto'
import { LeaveQueryDto } from './dto/leave-query.dto'
import { Leave } from './entities/leave.entity'

@Injectable()
export class LeavesService {
  constructor(
    @InjectRepository(Leave)
    private readonly leaveRepository: Repository<Leave>,
  ) {}

  async create(createDto: CreateLeaveDto) {
    if (new Date(createDto.endDate) <= new Date(createDto.startDate)) {
      throw new BadRequestException(
        'A data de fim deve ser superior à data de início',
      )
    }

    try {
      const leave = this.leaveRepository.create({
        employeeId: createDto.employeeId,
        type: createDto.type,
        startDate: new Date(createDto.startDate),
        endDate: new Date(createDto.endDate),
        documentId: createDto.documentId,
        observation: createDto.observation,
        status: LeaveStatus.PENDING,
      })

      await this.leaveRepository.save(leave)
    } catch (error) {
      this.handleDatabaseError(error, 'registrar licença')
    }
  }

  async findAll(query: LeaveQueryDto) {
    const where: any = {}

    if (query.employeeId) {
      where.employeeId = query.employeeId
    }

    if (query.type) {
      where.type = query.type
    }

    if (query.status) {
      where.status = query.status
    }

    if (query.startDate && query.endDate) {
      where.startDate = MoreThanOrEqual(new Date(query.startDate))
      where.endDate = LessThanOrEqual(new Date(query.endDate))
    } else if (query.startDate) {
      where.startDate = MoreThanOrEqual(new Date(query.startDate))
    } else if (query.endDate) {
      where.endDate = LessThanOrEqual(new Date(query.endDate))
    }

    const [data, total] = await this.leaveRepository.findAndCount({
      where,
      order: { id: 'DESC' },
      skip: query.offset,
      take: query.limit,
    })

    return {
      data,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    }
  }

  async update(id: number, updateDto: UpdateLeaveDto, approverId: number) {
    if (
      (updateDto.status === LeaveStatus.REJECTED ||
        updateDto.status === LeaveStatus.CANCELLED) &&
      !updateDto.observation
    ) {
      throw new BadRequestException(
        `Observação é obrigatória quando o estado é ${updateDto.status}`,
      )
    }

    const leave = await this.leaveRepository.findOneBy({ id })

    if (!leave) {
      throw new NotFoundException(`Licença com código ${id} não encontrada`)
    }

    try {
      await this.leaveRepository.update(id, {
        status: updateDto.status,
        approverId,
        observation: updateDto.observation,
      })
    } catch (error) {
      this.handleDatabaseError(error, 'atualizar licença')
    }
  }

  private handleDatabaseError(error: any, action: string) {
    console.error(`Erro ao ${action}:`, error)

    const message = error?.message || ''

    if (error.code === 'ORA-00001' || message.includes('unique constraint')) {
      throw new BadRequestException(`Erro de duplicidade ao ${action}`)
    }
    if (
      error.code === 'ORA-02291' ||
      message.includes('foreign key constraint')
    ) {
      throw new BadRequestException(
        `Erro de integridade (chave estrangeira) ao ${action}`,
      )
    }
    throw new InternalServerErrorException(`Erro interno ao ${action}`)
  }
}
