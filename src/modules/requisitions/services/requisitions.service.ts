import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  Between,
  FindOptionsWhere,
  ILike,
  IsNull,
  QueryFailedError,
  Repository,
} from 'typeorm'

import { Requisition } from '../entity/requisition.entity'
import { RequisitionHistory } from '../entity/requisition-history.entity'

import { Department } from 'src/modules/department/entity/department.entity'
import { CostCenter } from 'src/modules/cost-center/entity/cost-center.entity'
import { Position } from 'src/modules/Positions/entity/position.entity'
import { HiringType } from 'src/modules/hiring-types/entity/hiring-type.entity'

import {
  RequisitionState,
  RequisitionStateCode,
} from 'src/modules/requisition-states/entity/requisition-state.entity'

import { User } from 'src/modules/user/entities/user.entity'

import {
  VacancyRequestType,
  VacancyRequestTypeStatus,
} from 'src/modules/vacancy-request-type/entity/vacancy-request-type.entity'

import { PaginatedResponseDto } from 'src/commons/dto/pagination-response.dto'
import { RequisitionResponseDto } from '../dto/requisition-response.dto'

import {
  toRequisitionResponseDto,
  toRequisitionResponseDtoList,
} from './requisitions.mapper'

import { CreateRequisitionDto } from '../dto/create-requisition.dto'
import { UpdateRequisitionDto } from '../dto/update-requisition.dto'
import { ListRequisitionsQueryDto } from '../dto/list-requisitions-query.dto'
import { CancelRequisitionDto } from '../dto/cancel-requisition.dto'
import { AnalyzeRequisitionRhDto } from '../dto/analyze-requisition-rh.dto'

import {
  AnalyzeRequisitionFinancialDto,
  BudgetAvailability,
  FinancialDecision,
} from '../dto/analyze-requisition-financial.dto'

import {
  MAX_CODE_GENERATION_ATTEMPTS,
  REQUISITION_HISTORY_ACTION,
  REQUISITION_RELATIONS,
  RhDecision,
} from '../constants'

interface FinancialDecisionResult {
  targetStateDescription: string
  authorizedQuantity: number | null
}

@Injectable()
export class RequisitionsService {
  constructor(
    @InjectRepository(Requisition)
    private readonly gpRequisitionRepository: Repository<Requisition>,

    @InjectRepository(RequisitionHistory)
    private readonly gpRequisitionHistoryRepository: Repository<RequisitionHistory>,

    @InjectRepository(Department)
    private readonly gpDepartmentRepository: Repository<Department>,

    @InjectRepository(CostCenter)
    private readonly gpCostCenterRepository: Repository<CostCenter>,

    @InjectRepository(Position)
    private readonly gpPositionRepository: Repository<Position>,

    @InjectRepository(HiringType)
    private readonly gpHiringTypeRepository: Repository<HiringType>,

    @InjectRepository(VacancyRequestType)
    private readonly gpVacancyRequestTypeRepository: Repository<VacancyRequestType>,

    @InjectRepository(RequisitionState)
    private readonly gpRequisitionStateRepository: Repository<RequisitionState>,

    @InjectRepository(User)
    private readonly gpUserRepository: Repository<User>,
  ) {}

  async create(
    dto: CreateRequisitionDto,
    authenticatedUserId: number,
  ): Promise<RequisitionResponseDto> {
    const requesterId = authenticatedUserId

    const user = await this.validateActiveUser(requesterId, 'solicitante')

    const department = this.assertUserBelongsToDepartment(
      user,
      dto.departmentId,
    )

    if (department.status !== 1) {
      throw new BadRequestException(
        `O departamento "${department.description}" está inativo`,
      )
    }

    const costCenter = await this.findActiveCostCenter(dto.costCenterId)

    if (costCenter.departmentId !== department.code) {
      throw new BadRequestException(
        `O centro de custo "${costCenter.description}" não está vinculado ao departamento "${department.description}"`,
      )
    }

    await this.findActivePosition(dto.positionId)

    await this.findActiveHiringType(dto.hiringTypeId)

    await this.findActiveVacancyRequestType(dto.vacancyRequestTypeId)

    const draftState = await this.findStateByAcronym(RequisitionStateCode.DRAFT)

    const requisition = await this.createWithUniqueCode({
      departmentId: department.code,
      costCenterId: costCenter.code,
      positionId: dto.positionId,
      quantity: dto.quantity,
      justification: dto.justification,
      hiringTypeId: dto.hiringTypeId,
      vacancyRequestTypeId: dto.vacancyRequestTypeId,
      requesterId,
      stateId: draftState.code,
    })

    await this.registerHistory({
      requisitionId: requisition.code,
      stateId: draftState.code,
      action: REQUISITION_HISTORY_ACTION.CREATE,
      responsibleId: authenticatedUserId,
      observation: 'Requisição criada em rascunho',
    })

    return toRequisitionResponseDto(requisition)
  }

  async findAll(
    query: ListRequisitionsQueryDto,
  ): Promise<PaginatedResponseDto<RequisitionResponseDto>> {
    const {
      search,
      requesterName,
      requesterId,
      departmentId,
      costCenterId,
      positionId,
      hiringTypeId,
      vacancyRequestTypeId,
      stateId,
      startDate,
      endDate,
      page,
      limit,
      offset,
    } = query

    const where: FindOptionsWhere<Requisition> = {
      deletedAt: IsNull(),

      ...(search
        ? {
            requisitionCode: ILike(`%${search}%`),
          }
        : {}),

      ...(requesterName
        ? {
            requester: {
              name: ILike(`%${requesterName}%`),
            },
          }
        : {}),

      ...(requesterId !== undefined
        ? {
            requesterId,
          }
        : {}),

      ...(departmentId !== undefined
        ? {
            departmentId,
          }
        : {}),

      ...(costCenterId !== undefined
        ? {
            costCenterId,
          }
        : {}),

      ...(positionId !== undefined
        ? {
            positionId,
          }
        : {}),

      ...(hiringTypeId !== undefined
        ? {
            hiringTypeId,
          }
        : {}),

      ...(vacancyRequestTypeId !== undefined
        ? {
            vacancyRequestTypeId,
          }
        : {}),

      ...(stateId !== undefined
        ? {
            stateId,
          }
        : {}),

      ...(startDate && endDate
        ? {
            createdAt: Between(
              new Date(`${startDate}T00:00:00`),
              new Date(`${endDate}T23:59:59`),
            ),
          }
        : {}),
    }

    const [data, total] = await this.gpRequisitionRepository.findAndCount({
      where,
      relations: REQUISITION_RELATIONS,
      order: {
        code: 'DESC',
      },
      skip: offset,
      take: limit,
    })

    return PaginatedResponseDto.create(
      toRequisitionResponseDtoList(data),
      total,
      page,
      limit,
    )
  }

  async findOneByCode(
    requisitionCode: string,
  ): Promise<RequisitionResponseDto> {
    const requisition = await this.gpRequisitionRepository.findOne({
      where: {
        requisitionCode,
        deletedAt: IsNull(),
      },

      relations: {
        ...REQUISITION_RELATIONS,

        history: {
          state: true,
          responsible: true,
        },
      },

      order: {
        history: {
          date: 'ASC',
          code: 'ASC',
        },
      },
    })

    if (!requisition) {
      throw new NotFoundException(
        `Requisição "${requisitionCode}" não encontrada`,
      )
    }

    return toRequisitionResponseDto(requisition)
  }

  private async findEntityByCode(
    requisitionCode: string,
  ): Promise<Requisition> {
    const requisition = await this.gpRequisitionRepository.findOne({
      where: {
        requisitionCode,
        deletedAt: IsNull(),
      },

      relations: REQUISITION_RELATIONS,
    })

    if (!requisition) {
      throw new NotFoundException(
        `Requisição "${requisitionCode}" não encontrada`,
      )
    }

    return requisition
  }

  async update(
    requisitionCode: string,
    dto: UpdateRequisitionDto,
  ): Promise<RequisitionResponseDto> {
    const requisition = await this.findEntityByCode(requisitionCode)

    this.assertState(
      requisition,
      [RequisitionStateCode.DRAFT],
      'Uma requisição enviada ou concluída não pode ser alterada',
    )

    if (dto.departmentId !== undefined && dto.costCenterId !== undefined) {
      const department = await this.findActiveDepartment(dto.departmentId)

      const costCenter = await this.findActiveCostCenter(dto.costCenterId)

      if (costCenter.departmentId !== department.code) {
        throw new BadRequestException(
          `O centro de custo "${costCenter.description}" não está vinculado ao departamento "${department.description}"`,
        )
      }
    }

    if (dto.departmentId !== undefined && dto.costCenterId === undefined) {
      await this.findActiveDepartment(dto.departmentId)
    }

    if (dto.costCenterId !== undefined && dto.departmentId === undefined) {
      await this.findActiveCostCenter(dto.costCenterId)
    }

    if (dto.positionId !== undefined) {
      await this.findActivePosition(dto.positionId)
    }

    if (dto.hiringTypeId !== undefined) {
      await this.findActiveHiringType(dto.hiringTypeId)
    }

    if (dto.vacancyRequestTypeId !== undefined) {
      await this.findActiveVacancyRequestType(dto.vacancyRequestTypeId)
    }

    Object.assign(requisition, dto, {
      updatedAt: new Date(),
    })

    const saved = await this.gpRequisitionRepository.save(requisition)

    return toRequisitionResponseDto(saved)
  }

  async remove(requisitionCode: string): Promise<void> {
    const requisition = await this.findEntityByCode(requisitionCode)

    this.assertState(
      requisition,
      [RequisitionStateCode.DRAFT],
      'Depois de enviada, a requisição não pode ser excluída',
    )

    await this.gpRequisitionRepository.softDelete({
      code: requisition.code,
    })
  }

  async send(
    requisitionCode: string,
    authenticatedUserId: number,
  ): Promise<RequisitionResponseDto> {
    const requisition = await this.findEntityByCode(requisitionCode)

    this.assertState(
      requisition,
      [RequisitionStateCode.DRAFT],
      'A requisição deve estar em rascunho para ser enviada',
    )

    const awaitingRhState = await this.findStateByAcronym(
      RequisitionStateCode.AWAITING_RH,
    )

    await this.gpRequisitionRepository.update(
      {
        code: requisition.code,
      },
      {
        stateId: awaitingRhState.code,
        sentAt: new Date(),
        sentBy: authenticatedUserId,
        updatedAt: new Date(),
      },
    )

    await this.registerHistory({
      requisitionId: requisition.code,
      stateId: awaitingRhState.code,
      action: REQUISITION_HISTORY_ACTION.SEND,
      responsibleId: authenticatedUserId,
      observation: 'Requisição enviada para aprovação',
    })

    return this.findOneByCode(requisitionCode)
  }

  async cancel(
    requisitionCode: string,
    dto: CancelRequisitionDto,
    authenticatedUserId: number,
  ): Promise<RequisitionResponseDto> {
    if (!dto.justification?.trim()) {
      throw new BadRequestException(
        'Justificativa obrigatória para cancelar a requisição',
      )
    }

    const requisition = await this.findEntityByCode(requisitionCode)

    this.assertState(
      requisition,
      [
        RequisitionStateCode.DRAFT,
        RequisitionStateCode.AWAITING_RH,
        RequisitionStateCode.AWAITING_FINANCIAL,
      ],
      'Esta requisição já foi concluída e não pode ser cancelada',
    )

    const cancelledState = await this.findStateByAcronym(
      RequisitionStateCode.CANCELLED,
    )

    await this.gpRequisitionRepository.update(
      {
        code: requisition.code,
      },
      {
        stateId: cancelledState.code,
        updatedAt: new Date(),
      },
    )

    await this.registerHistory({
      requisitionId: requisition.code,
      stateId: cancelledState.code,
      action: REQUISITION_HISTORY_ACTION.CANCEL,
      responsibleId: authenticatedUserId,
      observation: dto.justification,
    })

    return this.findOneByCode(requisitionCode)
  }

  async analyzeRh(
    requisitionCode: string,
    dto: AnalyzeRequisitionRhDto,
    authenticatedUserId: number,
  ): Promise<RequisitionResponseDto> {
    const requisition = await this.findEntityByCode(requisitionCode)

    this.assertState(
      requisition,
      [RequisitionStateCode.AWAITING_RH],
      'A requisição deve estar aguardando análise do RH',
    )

    if (dto.decision === RhDecision.REJECT && !dto.justification?.trim()) {
      throw new BadRequestException(
        'Justificativa obrigatória para rejeitar a requisição',
      )
    }

    if (dto.decision === RhDecision.APPROVE) {
      try {
        await this.findActivePosition(requisition.positionId)
      } catch {
        throw new BadRequestException(
          'Não é possível encaminhar ao Financeiro porque o cargo vinculado à requisição está inativo ou não foi encontrado. Regularize o cargo antes de aprovar.',
        )
      }
    }

    const targetStateDescription =
      dto.decision === RhDecision.APPROVE
        ? RequisitionStateCode.AWAITING_FINANCIAL
        : RequisitionStateCode.REJECTED

    const targetState = await this.findStateByAcronym(targetStateDescription)

    await this.gpRequisitionRepository.update(
      {
        code: requisition.code,
      },
      {
        stateId: targetState.code,
        updatedAt: new Date(),
      },
    )

    await this.registerHistory({
      requisitionId: requisition.code,
      stateId: targetState.code,
      action: REQUISITION_HISTORY_ACTION.RH_ANALYSIS,
      decision: dto.decision,
      responsibleId: authenticatedUserId,
      opinion: dto.opinion,
      observation: dto.justification,
    })

    return this.findOneByCode(requisitionCode)
  }

  async analyzeFinancial(
    requisitionCode: string,
    dto: AnalyzeRequisitionFinancialDto,
    authenticatedUserId: number,
  ): Promise<RequisitionResponseDto> {
    const requisition = await this.findEntityByCode(requisitionCode)

    this.assertState(
      requisition,
      [RequisitionStateCode.AWAITING_FINANCIAL],
      'A requisição deve estar aguardando análise financeira',
    )

    const { targetStateDescription, authorizedQuantity } =
      this.resolveFinancialDecision(dto, requisition)

    const targetState = await this.findStateByAcronym(targetStateDescription)

    await this.gpRequisitionRepository.update(
      {
        code: requisition.code,
      },
      {
        stateId: targetState.code,
        authorizedQuantity,
        updatedAt: new Date(),
      },
    )

    await this.registerHistory({
      requisitionId: requisition.code,
      stateId: targetState.code,
      action: REQUISITION_HISTORY_ACTION.FINANCIAL_ANALYSIS,
      decision: dto.decision,
      opinion: dto.opinion,
      budgetAvailability: dto.budgetAvailability,
      authorizedQuantity,
      budgetExercise: dto.budgetExercise,
      responsibleId: authenticatedUserId,
      observation: dto.justification ?? dto.observation,
    })

    return this.findOneByCode(requisitionCode)
  }

  private resolveFinancialDecision(
    dto: AnalyzeRequisitionFinancialDto,
    requisition: Requisition,
  ): FinancialDecisionResult {
    switch (dto.decision) {
      case FinancialDecision.REJECT:
        return this.resolveRejection(dto)

      case FinancialDecision.APPROVE_PARTIAL:
        return this.resolvePartialApproval(dto, requisition)

      case FinancialDecision.APPROVE:
      default:
        return this.resolveFullApproval(dto, requisition)
    }
  }

  private resolveRejection(
    dto: AnalyzeRequisitionFinancialDto,
  ): FinancialDecisionResult {
    if (!dto.justification?.trim()) {
      throw new BadRequestException(
        'Justificativa obrigatória para rejeitar a requisição',
      )
    }

    return {
      targetStateDescription: RequisitionStateCode.REJECTED,
      authorizedQuantity: null,
    }
  }

  private resolvePartialApproval(
    dto: AnalyzeRequisitionFinancialDto,
    requisition: Requisition,
  ): FinancialDecisionResult {
    this.assertBudgetAvailableForApproval(dto)

    if (dto.authorizedQuantity === undefined) {
      throw new BadRequestException(
        'Quantidade autorizada obrigatória na aprovação parcial',
      )
    }

    if (dto.authorizedQuantity > requisition.quantity) {
      throw new BadRequestException(
        'A quantidade autorizada não pode ser superior à quantidade solicitada',
      )
    }

    if (dto.authorizedQuantity >= requisition.quantity) {
      throw new BadRequestException(
        'Na aprovação parcial, a quantidade autorizada deve ser menor que a quantidade solicitada',
      )
    }

    return {
      targetStateDescription: RequisitionStateCode.APPROVED_PARTIAL,
      authorizedQuantity: dto.authorizedQuantity,
    }
  }

  private resolveFullApproval(
    dto: AnalyzeRequisitionFinancialDto,
    requisition: Requisition,
  ): FinancialDecisionResult {
    this.assertBudgetAvailableForApproval(dto)

    if (dto.budgetAvailability === BudgetAvailability.PARTIALLY_AVAILABLE) {
      throw new BadRequestException(
        'Disponibilidade parcialmente disponível exige aprovação parcial com quantidade autorizada menor que a solicitada',
      )
    }

    return {
      targetStateDescription: RequisitionStateCode.APPROVED,
      authorizedQuantity: requisition.quantity,
    }
  }

  private assertBudgetAvailableForApproval(
    dto: AnalyzeRequisitionFinancialDto,
  ): void {
    if (dto.budgetAvailability === BudgetAvailability.UNAVAILABLE) {
      throw new BadRequestException(
        'A requisição não pode ser aprovada com disponibilidade orçamentária indisponível',
      )
    }
  }

  private async registerHistory(entry: {
    requisitionId: number
    stateId: number
    action: string
    decision?: string | null
    opinion?: string | null
    budgetAvailability?: string | null
    authorizedQuantity?: number | null
    budgetExercise?: string | null
    observation?: string | null
    responsibleId: number
  }): Promise<void> {
    const history = this.gpRequisitionHistoryRepository.create({
      requisitionId: entry.requisitionId,
      stateId: entry.stateId,
      action: entry.action,
      decision: entry.decision ?? null,
      opinion: entry.opinion ?? null,
      budgetAvailability: entry.budgetAvailability ?? null,
      authorizedQuantity: entry.authorizedQuantity ?? null,
      budgetExercise: entry.budgetExercise ?? null,
      observation: entry.observation ?? null,
      responsibleId: entry.responsibleId,
    })

    await this.gpRequisitionHistoryRepository.save(history)
  }

  private async createWithUniqueCode(
    data: Partial<Requisition>,
  ): Promise<Requisition> {
    for (let attempt = 1; attempt <= MAX_CODE_GENERATION_ATTEMPTS; attempt++) {
      const requisitionCode = await this.generateRequisitionCode()

      const requisition = this.gpRequisitionRepository.create({
        ...data,
        requisitionCode,
      })

      try {
        return await this.gpRequisitionRepository.save(requisition)
      } catch (error) {
        if (!this.isUniqueViolation(error)) {
          throw error
        }
      }
    }

    throw new ConflictException(
      'Não foi possível gerar um código único para a requisição. Tente novamente.',
    )
  }

  private isUniqueViolation(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) {
      return false
    }

    const driverError = (
      error as QueryFailedError & {
        driverError?: {
          message?: string
          code?: string
        }
      }
    ).driverError

    const message = driverError?.message ?? error.message

    return (
      driverError?.code === 'ORA-00001' ||
      message?.includes('ORA-00001') ||
      false
    )
  }

  private async generateRequisitionCode(): Promise<string> {
    const year = new Date().getFullYear()

    const start = new Date(year, 0, 1)

    const end = new Date(year, 11, 31, 23, 59, 59)

    const count = await this.gpRequisitionRepository.count({
      where: {
        createdAt: Between(start, end),
      },
    })

    return `REQ-${year}-${String(count + 1).padStart(6, '0')}`
  }

  private async findStateByAcronym(acronym: string): Promise<RequisitionState> {
    const state = await this.gpRequisitionStateRepository.findOne({
      where: {
        acronym,
      },
    })

    if (!state) {
      throw new ConflictException(
        `O estado de requisição "${acronym}" não está configurado`,
      )
    }

    return state
  }

  private assertState(
    requisition: Requisition,
    allowedStates: string[],
    message: string,
  ): void {
    if (
      !requisition.state ||
      !allowedStates.includes(requisition.state.acronym)
    ) {
      throw new BadRequestException(message)
    }
  }

  private async validateActiveUser(
    userId: number,
    role: string,
  ): Promise<User> {
    const user = await this.gpUserRepository.findOne({
      relations: {
        groups: {
          department: true,
        },
      },
      where: {
        id: userId,
      },
    })

    if (!user) {
      throw new NotFoundException(`Usuário ${role} não encontrado`)
    }

    if (user.status !== 1) {
      throw new BadRequestException(`O usuário ${role} está inativo`)
    }

    return user
  }

  private assertUserBelongsToDepartment(
    user: User,
    departmentId: number,
  ): Department {
    const group = user.groups.find(
      (group) => group.departmentId === departmentId,
    )

    if (!group) {
      throw new ForbiddenException(
        'Não podes fazer uma solicitação para um departamento ao qual não pertences.',
      )
    }

    return group.department
  }

  private async findActiveDepartment(
    departmentId: number,
  ): Promise<Department> {
    const department = await this.gpDepartmentRepository.findOne({
      where: {
        code: departmentId,
        deletedAt: IsNull(),
      },
    })

    if (!department) {
      throw new NotFoundException(
        'O departamento selecionado não foi encontrado',
      )
    }

    if (department.status !== 1) {
      throw new BadRequestException(
        `O departamento "${department.description}" está inativo`,
      )
    }

    return department
  }

  private async findActiveCostCenter(
    costCenterId: number,
  ): Promise<CostCenter> {
    const costCenter = await this.gpCostCenterRepository.findOne({
      where: {
        code: costCenterId,
        deletedAt: IsNull(),
      },
    })

    if (!costCenter) {
      throw new NotFoundException(
        'O centro de custo selecionado não foi encontrado',
      )
    }

    if (costCenter.status !== 1) {
      throw new BadRequestException(
        `O centro de custo "${costCenter.description}" está inativo`,
      )
    }

    return costCenter
  }

  private async findActivePosition(positionId: number): Promise<Position> {
    const position = await this.gpPositionRepository.findOne({
      where: {
        code: positionId,
        deletedAt: IsNull(),
      },
    })

    if (!position) {
      throw new NotFoundException('O cargo selecionado não foi encontrado')
    }

    if (position.status !== 1) {
      throw new BadRequestException(
        `O cargo "${position.description}" está inativo`,
      )
    }

    return position
  }

  private async findActiveHiringType(
    hiringTypeId: number,
  ): Promise<HiringType> {
    const hiringType = await this.gpHiringTypeRepository.findOne({
      where: {
        code: hiringTypeId,
        deletedAt: IsNull(),
      },
    })

    if (!hiringType) {
      throw new NotFoundException(
        'O tipo de contratação selecionado não foi encontrado',
      )
    }

    if (hiringType.status !== 1) {
      throw new BadRequestException(
        `O tipo de contratação "${hiringType.description}" está inativo`,
      )
    }

    return hiringType
  }

  private async findActiveVacancyRequestType(
    vacancyRequestTypeId: number,
  ): Promise<VacancyRequestType> {
    const vacancyRequestType =
      await this.gpVacancyRequestTypeRepository.findOne({
        where: {
          id: vacancyRequestTypeId,
          deletedAt: IsNull(),
        },
      })

    if (!vacancyRequestType) {
      throw new NotFoundException(
        'O tipo de requisição de vaga selecionado não foi encontrado',
      )
    }

    if (vacancyRequestType.status !== VacancyRequestTypeStatus.ACTIVE) {
      throw new BadRequestException(
        `O tipo de requisição de vaga "${vacancyRequestType.description}" está inativo`,
      )
    }

    return vacancyRequestType
  }
}
