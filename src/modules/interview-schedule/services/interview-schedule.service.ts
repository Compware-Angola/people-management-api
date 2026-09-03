import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ILike, Repository } from 'typeorm'

import { PaginatedResponseDto } from 'src/commons/dto/pagination-response.dto'

import { InterviewScheduleEntity } from '../entities/interview-schedule.entity'
import { InterviewScheduleInterviewerEntity } from '../entities/interview-schedule-interviewer.entity'
import { InterviewModalityEntity } from '../entities/interview-modality.entity'
import { InterviewScheduleStateEntity } from '../entities/interview-schedule-state.entity'

import { CreateInterviewScheduleDto } from '../dto/create-interview-schedule.dto'
import { UpdateInterviewScheduleDto } from '../dto/update-interview-schedule.dto'
import { ListInterviewScheduleQueryDto } from '../dto/list-interview-schedule-query.dto'

const DEFAULT_STATE_DESIGNATION = 'AGENDADA'

@Injectable()
export class InterviewScheduleService {
  constructor(
    @InjectRepository(InterviewScheduleEntity)
    private readonly scheduleRepository: Repository<InterviewScheduleEntity>,
    @InjectRepository(InterviewScheduleInterviewerEntity)
    private readonly interviewerRepository: Repository<InterviewScheduleInterviewerEntity>,
    @InjectRepository(InterviewModalityEntity)
    private readonly modalityRepository: Repository<InterviewModalityEntity>,
    @InjectRepository(InterviewScheduleStateEntity)
    private readonly stateRepository: Repository<InterviewScheduleStateEntity>,
  ) {}

  async create(
    dto: CreateInterviewScheduleDto,
    createdById?: number | null,
  ): Promise<InterviewScheduleEntity> {
    await this.assertModalityExists(dto.modalityId)

    const stateId =
      dto.stateId !== undefined
        ? await this.assertStateExists(dto.stateId)
        : await this.resolveDefaultStateId()

    return this.scheduleRepository.manager.transaction(async (manager) => {
      const schedule = manager.create(InterviewScheduleEntity, {
        applicationId: dto.applicationId,
        interviewDate: new Date(dto.interviewDate),
        durationMinutes: dto.durationMinutes ?? null,
        endTime: dto.endTime ?? null,
        modalityId: dto.modalityId,
        location: dto.location?.trim() || null,
        link: dto.link?.trim() || null,
        note: dto.note?.trim() || null,
        justification: dto.justification?.trim() || null,
        stateId,
        createdById: createdById ?? null,
      })

      let saved: InterviewScheduleEntity

      try {
        saved = await manager.save(InterviewScheduleEntity, schedule)
      } catch (error) {
        this.handleDatabaseError(error)
      }

      if (dto.interviewerUserIds?.length) {
        await this.replaceInterviewers(
          manager.getRepository(InterviewScheduleInterviewerEntity),
          saved!.id,
          dto.interviewerUserIds,
        )
      }

      return this.findOneWith(
        manager.getRepository(InterviewScheduleEntity),
        saved!.id,
      )
    })
  }

  async findAll(
    query: ListInterviewScheduleQueryDto,
  ): Promise<PaginatedResponseDto<InterviewScheduleEntity>> {
    const {
      search,
      applicationId,
      modalityId,
      stateId,
      page = 1,
      limit = 10,
    } = query

    const qb = this.scheduleRepository
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.modality', 'modality')
      .leftJoinAndSelect('schedule.state', 'state')
      .leftJoinAndSelect('schedule.interviewers', 'interviewers')
      .leftJoinAndSelect('interviewers.user', 'interviewerUser')
      .orderBy('schedule.interviewDate', 'DESC')
      .addOrderBy('schedule.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)

    if (search && search.trim().length > 0) {
      const term = `%${search.trim().toLowerCase()}%`
      qb.andWhere(
        `(
          LOWER(schedule.location) LIKE :term
          OR LOWER(schedule.link) LIKE :term
          OR LOWER(schedule.note) LIKE :term
          OR LOWER(schedule.justification) LIKE :term
        )`,
        { term },
      )
    }

    if (applicationId !== undefined) {
      qb.andWhere('schedule.applicationId = :applicationId', { applicationId })
    }

    if (modalityId !== undefined) {
      qb.andWhere('schedule.modalityId = :modalityId', { modalityId })
    }

    if (stateId !== undefined) {
      qb.andWhere('schedule.stateId = :stateId', { stateId })
    }

    const [data, total] = await qb.getManyAndCount()

    return PaginatedResponseDto.create(data, total, page, limit)
  }

  async findOne(id: number): Promise<InterviewScheduleEntity> {
    return this.findOneWith(this.scheduleRepository, id)
  }

  async update(
    id: number,
    dto: UpdateInterviewScheduleDto,
  ): Promise<InterviewScheduleEntity> {
    const schedule = await this.findOne(id)

    if (dto.modalityId !== undefined) {
      await this.assertModalityExists(dto.modalityId)
      schedule.modalityId = dto.modalityId
    }

    if (dto.stateId !== undefined) {
      await this.assertStateExists(dto.stateId)
      schedule.stateId = dto.stateId
    }

    if (dto.applicationId !== undefined) {
      schedule.applicationId = dto.applicationId
    }
    if (dto.interviewDate !== undefined) {
      schedule.interviewDate = new Date(dto.interviewDate)
    }
    if (dto.durationMinutes !== undefined) {
      schedule.durationMinutes = dto.durationMinutes
    }
    if (dto.endTime !== undefined) {
      schedule.endTime = dto.endTime
    }
    if (dto.location !== undefined) {
      schedule.location = dto.location?.trim() || null
    }
    if (dto.link !== undefined) {
      schedule.link = dto.link?.trim() || null
    }
    if (dto.note !== undefined) {
      schedule.note = dto.note?.trim() || null
    }
    if (dto.justification !== undefined) {
      schedule.justification = dto.justification?.trim() || null
    }

    return this.scheduleRepository.manager.transaction(async (manager) => {
      try {
        await manager.save(InterviewScheduleEntity, schedule)
      } catch (error) {
        this.handleDatabaseError(error)
      }

      if (dto.interviewerUserIds !== undefined) {
        await this.replaceInterviewers(
          manager.getRepository(InterviewScheduleInterviewerEntity),
          id,
          dto.interviewerUserIds,
        )
      }

      return this.findOneWith(
        manager.getRepository(InterviewScheduleEntity),
        id,
      )
    })
  }

  async remove(id: number): Promise<void> {
    const schedule = await this.findOne(id)
    // As linhas de entrevistadores são removidas pela FK ON DELETE CASCADE.
    await this.scheduleRepository.delete({ id: schedule.id })
  }

  async setInterviewers(
    id: number,
    userIds: number[],
  ): Promise<InterviewScheduleEntity> {
    await this.findOne(id)

    await this.replaceInterviewers(this.interviewerRepository, id, userIds)

    return this.findOne(id)
  }

  async addInterviewer(
    id: number,
    userId: number,
  ): Promise<InterviewScheduleEntity> {
    await this.findOne(id)

    const existing = await this.interviewerRepository.findOne({
      where: { interviewScheduleId: id, userId },
    })

    if (existing) {
      throw new ConflictException(
        'Este utilizador já é entrevistador deste agendamento',
      )
    }

    try {
      await this.interviewerRepository.save(
        this.interviewerRepository.create({
          interviewScheduleId: id,
          userId,
        }),
      )
    } catch (error) {
      this.handleDatabaseError(error)
    }

    return this.findOne(id)
  }

  async removeInterviewer(id: number, userId: number): Promise<void> {
    const existing = await this.interviewerRepository.findOne({
      where: { interviewScheduleId: id, userId },
    })

    if (!existing) {
      throw new NotFoundException(
        'Este utilizador não é entrevistador deste agendamento',
      )
    }

    await this.interviewerRepository.delete({ id: existing.id })
  }

  private async findOneWith(
    repository: Repository<InterviewScheduleEntity>,
    id: number,
  ): Promise<InterviewScheduleEntity> {
    const schedule = await repository.findOne({
      where: { id },
      relations: {
        modality: true,
        state: true,
        createdBy: true,
        interviewers: { user: true },
      },
    })

    if (!schedule) {
      throw new NotFoundException(
        `Agendamento de entrevista com o código ${id} não encontrado`,
      )
    }

    return schedule
  }

  private async replaceInterviewers(
    repository: Repository<InterviewScheduleInterviewerEntity>,
    interviewScheduleId: number,
    userIds: number[],
  ): Promise<void> {
    await repository.delete({ interviewScheduleId })

    const uniqueUserIds = [...new Set(userIds)]

    if (uniqueUserIds.length === 0) {
      return
    }

    const rows = uniqueUserIds.map((userId) =>
      repository.create({ interviewScheduleId, userId }),
    )

    try {
      await repository.save(rows)
    } catch (error) {
      this.handleDatabaseError(error)
    }
  }

  private async assertModalityExists(id: number): Promise<number> {
    const modality = await this.modalityRepository.findOne({ where: { id } })

    if (!modality) {
      throw new BadRequestException(
        `Modalidade com o código ${id} não encontrada`,
      )
    }

    return modality.id
  }

  private async assertStateExists(id: number): Promise<number> {
    const state = await this.stateRepository.findOne({ where: { id } })

    if (!state) {
      throw new BadRequestException(
        `Estado de agendamento com o código ${id} não encontrado`,
      )
    }

    return state.id
  }

  private async resolveDefaultStateId(): Promise<number> {
    const state = await this.stateRepository.findOne({
      where: { designation: ILike(DEFAULT_STATE_DESIGNATION) },
    })

    if (!state) {
      throw new BadRequestException(
        `Estado padrão "${DEFAULT_STATE_DESIGNATION}" não encontrado. Informe o campo stateId.`,
      )
    }

    return state.id
  }

  private handleDatabaseError(error: unknown): never {
    const err = error as { code?: string; message?: string } | null
    const message = typeof err?.message === 'string' ? err.message : ''
    const code = typeof err?.code === 'string' ? err.code : ''

    if (code === 'ORA-00001' || message.includes('ORA-00001')) {
      throw new ConflictException(
        'Registo duplicado: o entrevistador já está associado a este agendamento',
      )
    }

    if (code === 'ORA-02291' || message.includes('ORA-02291')) {
      throw new BadRequestException(
        'Referência inválida: verifique candidatura, modalidade, estado ou utilizador informados',
      )
    }

    throw error
  }
}
