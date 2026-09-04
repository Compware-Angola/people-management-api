import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Brackets, ILike, Repository } from 'typeorm'

import { PaginatedResponseDto } from 'src/commons/dto/pagination-response.dto'

import { InterviewScheduleEntity } from '../entities/interview-schedule.entity'
import { InterviewScheduleInterviewerEntity } from '../entities/interview-schedule-interviewer.entity'
import { InterviewModalityEntity } from '../entities/interview-modality.entity'
import { InterviewScheduleStateEntity } from '../entities/interview-schedule-state.entity'

import { Candidacy } from 'src/modules/candidacy/entities/candidacy.entity'
import { User } from 'src/modules/user/entities/user.entity'

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
    @InjectRepository(Candidacy)
    private readonly candidacyRepository: Repository<Candidacy>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    dto: CreateInterviewScheduleDto,
    createdById?: number | null,
  ): Promise<InterviewScheduleEntity> {
    await this.assertApplicationExists(dto.applicationId)
    await this.assertModalityExists(dto.modalityId)
    this.assertFutureDateTime(dto.interviewDate)

    if (dto.interviewerUserIds?.length) {
      await this.assertNoScheduleConflict(
        new Date(dto.interviewDate),
        dto.endTime ?? null,
        dto.interviewerUserIds,
      )
    }
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
        createdById: 165,
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
      await this.assertApplicationExists(dto.applicationId)
      schedule.applicationId = dto.applicationId
    }
    if (dto.interviewDate !== undefined) {
      this.assertFutureDateTime(dto.interviewDate)
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

    const hasScheduleChange =
      dto.interviewDate !== undefined || dto.endTime !== undefined
    const hasInterviewersChange = dto.interviewerUserIds !== undefined

    if (hasScheduleChange && hasInterviewersChange) {
      const effectiveInterviewDate = dto.interviewDate
        ? new Date(dto.interviewDate)
        : schedule.interviewDate
      const effectiveEndTime =
        dto.endTime !== undefined ? dto.endTime : schedule.endTime
      const effectiveUserIds = dto.interviewerUserIds ?? []

      if (effectiveUserIds.length) {
        await this.assertNoScheduleConflict(
          effectiveInterviewDate,
          effectiveEndTime,
          effectiveUserIds,
          id,
        )
      }
    } else if (hasScheduleChange && !hasInterviewersChange) {
      const currentInterviewerIds = schedule.interviewers.map((i) => i.userId)
      if (currentInterviewerIds.length) {
        const effectiveInterviewDate = dto.interviewDate
          ? new Date(dto.interviewDate)
          : schedule.interviewDate
        const effectiveEndTime =
          dto.endTime !== undefined ? dto.endTime : schedule.endTime

        await this.assertNoScheduleConflict(
          effectiveInterviewDate,
          effectiveEndTime,
          currentInterviewerIds,
          id,
        )
      }
    } else if (!hasScheduleChange && hasInterviewersChange) {
      const effectiveUserIds = dto.interviewerUserIds ?? []

      if (effectiveUserIds.length) {
        await this.assertNoScheduleConflict(
          schedule.interviewDate,
          schedule.endTime,
          effectiveUserIds,
          id,
        )
      }
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
    await this.assertUserExists(userId)

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

    for (const userId of uniqueUserIds) {
      await this.assertUserExists(userId)
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

  private async assertApplicationExists(id: number): Promise<number> {
    const candidacy = await this.candidacyRepository.findOne({
      where: { code: id },
    })

    if (!candidacy) {
      throw new BadRequestException(
        `Candidatura com o código ${id} não encontrada`,
      )
    }

    return candidacy.code
  }

  private async assertUserExists(id: number): Promise<number> {
    const user = await this.userRepository.findOne({ where: { id } })

    if (!user) {
      throw new BadRequestException(
        `Utilizador com o código ${id} não encontrado`,
      )
    }

    return user.id
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

  private assertFutureDateTime(interviewDate: string): void {
    const scheduled = new Date(interviewDate)
    const now = new Date()

    if (scheduled <= now) {
      throw new BadRequestException(
        'Não é permitido agendar entrevista em data e hora anteriores ao momento atual',
      )
    }
  }

  private async assertNoScheduleConflict(
    interviewDate: Date,
    endTime: string | null,
    interviewerUserIds: number[],
    excludeScheduleId?: number,
    durationMinutes?: number | null,
  ): Promise<void> {
    if (!interviewerUserIds.length) return

    const scheduleStart = new Date(interviewDate)
    const scheduleEnd = this.computeScheduleEnd(
      scheduleStart,
      endTime,
      durationMinutes,
    )

    if (scheduleEnd <= scheduleStart) {
      throw new BadRequestException(
        'A hora de fim da entrevista deve ser posterior à hora de início',
      )
    }

    const qb = this.interviewerRepository
      .createQueryBuilder('ie')
      .innerJoinAndSelect('ie.interviewSchedule', 'schedule')
      .where('ie.userId IN (:...userIds)', { userIds: interviewerUserIds })

    if (excludeScheduleId) {
      qb.andWhere('schedule.id != :excludeId', { excludeId: excludeScheduleId })
    }

    const rows = await qb.getMany()

    for (const row of rows) {
      const existingStart = new Date(row.interviewSchedule.interviewDate)
      const existingEnd = this.computeScheduleEnd(
        existingStart,
        row.interviewSchedule.endTime,
        row.interviewSchedule.durationMinutes,
      )

      const overlaps =
        scheduleStart < existingEnd && scheduleEnd > existingStart

      if (overlaps) {
        throw new BadRequestException(
          `Conflito de agenda: o entrevistador (código ${row.userId}) já possui agendamento no período informado`,
        )
      }
    }
  }
  private computeScheduleEnd(
    start: Date,
    endTime: string | null,
    durationMinutes?: number | null,
  ): Date {
    if (endTime) {
      const [hours, minutes] = endTime.split(':').map(Number)
      const end = new Date(start)
      end.setUTCHours(hours, minutes, 0, 0)
      return end
    }
    const minutes = durationMinutes ?? 60
    return new Date(start.getTime() + minutes * 60 * 1000)
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
