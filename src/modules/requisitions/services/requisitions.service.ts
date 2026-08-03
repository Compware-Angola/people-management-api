import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Between, FindOptionsWhere, ILike, IsNull, Repository } from 'typeorm'
import { Requisition } from '../entity/requisition.entity'
import { RequisitionHistory } from '../entity/requisition-history.entity'
import { Department } from 'src/modules/department/entity/department.entity'
import { CostCenter } from 'src/modules/cost-center/entity/cost-center.entity'
import { Position } from 'src/modules/possition/entity/position.entity'
import { HiringType } from 'src/modules/hiring-types/entity/hiring-type.entity'
import {
  RequisitionState,
  RequisitionStateCode,
} from 'src/modules/requisition-states/entity/requisition-state.entity'
import { User } from 'src/modules/user/entities/user.entity'
import { PaginatedResponseDto } from 'src/commons/dto/pagination-response.dto'
import { CreateRequisitionDto } from '../dto/create-requisition.dto'
import { UpdateRequisitionDto } from '../dto/update-requisition.dto'
import { ListRequisitionsQueryDto } from '../dto/list-requisitions-query.dto'
import { CancelRequisitionDto } from '../dto/cancel-requisition.dto'
import {
  AnalyzeRequisitionRhDto,
  RhDecision,
} from '../dto/analyze-requisition-rh.dto'
import {
  AnalyzeRequisitionFinancialDto,
  BudgetAvailability,
  FinancialDecision,
} from '../dto/analyze-requisition-financial.dto'

const REQUISITION_HISTORY_ACTION = {
  SEND: 'ENVIO',
  CANCEL: 'CANCELAMENTO',
  RH_ANALYSIS: 'ANALISE_RH',
  FINANCIAL_ANALYSIS: 'ANALISE_FINANCEIRA',
} as const

const REQUISITION_RELATIONS = {
  department: true,
  costCenter: true,
  position: true,
  hiringType: true,
  requester: true,
  state: true,
} as const

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
    @InjectRepository(RequisitionState)
    private readonly gpRequisitionStateRepository: Repository<RequisitionState>,
    @InjectRepository(User)
    private readonly gpUserRepository: Repository<User>,
  ) {}

  async create(
    dto: CreateRequisitionDto,
    authenticatedUserId: number,
  ): Promise<Requisition> {
    const requesterId = dto.requesterId ?? authenticatedUserId

    await this.validateActiveUser(requesterId, 'solicitante')
    const department = await this.findActiveDepartment(dto.departmentId)
    const costCenter = await this.findActiveCostCenter(dto.costCenterId)
    if (costCenter.departmentId !== department.code) {
      throw new BadRequestException(
        `O centro de custo ${dto.costCenterId} não está vinculado ao departamento ${dto.departmentId}`,
      )
    }
    await this.findActivePosition(dto.positionId)
    await this.findActiveHiringType(dto.hiringTypeId)

    const draftState = await this.findStateByAcronym(RequisitionStateCode.DRAFT)

    const requisition = this.gpRequisitionRepository.create({
      requisitionCode: await this.generateRequisitionCode(),
      departmentId: department.code,
      costCenterId: costCenter.code,
      positionId: dto.positionId,
      quantity: dto.quantity,
      justification: dto.justification,
      hiringTypeId: dto.hiringTypeId,
      requesterId,
      stateId: draftState.code,
    })

    return this.gpRequisitionRepository.save(requisition)
  }

  async findAll(
    query: ListRequisitionsQueryDto,
  ): Promise<PaginatedResponseDto<Requisition>> {
    const {
      search,
      requesterName,
      requesterId,
      departmentId,
      costCenterId,
      positionId,
      hiringTypeId,
      stateId,
      startDate,
      endDate,
      page,
      limit,
      offset,
    } = query

    const where: FindOptionsWhere<Requisition> = {
      deletedAt: IsNull(),
      ...(search ? { requisitionCode: ILike(`%${search}%`) } : {}),
      ...(requesterName
        ? { requester: { name: ILike(`%${requesterName}%`) } }
        : {}),
      ...(requesterId !== undefined ? { requesterId } : {}),
      ...(departmentId !== undefined ? { departmentId } : {}),
      ...(costCenterId !== undefined ? { costCenterId } : {}),
      ...(positionId !== undefined ? { positionId } : {}),
      ...(hiringTypeId !== undefined ? { hiringTypeId } : {}),
      ...(stateId !== undefined ? { stateId } : {}),
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
      order: { code: 'DESC' },
      skip: offset,
      take: limit,
    })

    return PaginatedResponseDto.create(data, total, page, limit)
  }

  async findOneByCode(requisitionCode: string): Promise<Requisition> {
    const requisition = await this.gpRequisitionRepository.findOne({
      where: { requisitionCode, deletedAt: IsNull() },
      relations: {
        ...REQUISITION_RELATIONS,
        history: {
          state: true,
          responsible: true,
        },
      },
      order: { history: { date: 'ASC', code: 'ASC' } },
    })
    if (!requisition) {
      throw new NotFoundException(
        `Requisição com o código ${requisitionCode} não encontrada`,
      )
    }
    return requisition
  }

  async update(
    requisitionCode: string,
    dto: UpdateRequisitionDto,
  ): Promise<Requisition> {
    const requisition = await this.findOneByCode(requisitionCode)
    this.assertState(
      requisition,
      [RequisitionStateCode.DRAFT],
      'Uma requisição enviada ou concluída não pode ser alterada',
    )

    if (dto.departmentId && dto.costCenterId) {
      const department = await this.findActiveDepartment(dto.departmentId)
      const costCenter = await this.findActiveCostCenter(dto.costCenterId)
      if (costCenter.departmentId !== department.code) {
        throw new BadRequestException(
          `O centro de custo ${dto.costCenterId} não está vinculado ao departamento ${dto.departmentId}`,
        )
      }
    }

    Object.assign(requisition, dto, { updatedAt: new Date() })
    return this.gpRequisitionRepository.save(requisition)
  }

  async remove(requisitionCode: string): Promise<void> {
    const requisition = await this.findOneByCode(requisitionCode)
    this.assertState(
      requisition,
      [RequisitionStateCode.DRAFT],
      'Depois de enviada, a requisição não pode ser excluída',
    )
    await this.gpRequisitionRepository.softDelete({ code: requisition.code })
  }

  async send(
    requisitionCode: string,
    authenticatedUserId: number,
  ): Promise<Requisition> {
    const requisition = await this.findOneByCode(requisitionCode)
    this.assertState(
      requisition,
      [RequisitionStateCode.DRAFT],
      'A requisição deve estar em rascunho para ser enviada',
    )

    const awaitingRhState = await this.findStateByAcronym(
      RequisitionStateCode.AWAITING_RH,
    )

    requisition.stateId = awaitingRhState.code
    requisition.sentAt = new Date()
    requisition.sentBy = authenticatedUserId
    requisition.updatedAt = new Date()

    await this.gpRequisitionRepository.save(requisition)
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
  ): Promise<Requisition> {
    const requisition = await this.findOneByCode(requisitionCode)
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

    requisition.stateId = cancelledState.code
    requisition.updatedAt = new Date()

    await this.gpRequisitionRepository.save(requisition)
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
  ): Promise<Requisition> {
    const requisition = await this.findOneByCode(requisitionCode)
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

    const targetStateDescription =
      dto.decision === RhDecision.APPROVE
        ? RequisitionStateCode.AWAITING_FINANCIAL
        : RequisitionStateCode.REJECTED

    const targetState = await this.findStateByAcronym(targetStateDescription)

    requisition.stateId = targetState.code
    requisition.updatedAt = new Date()

    await this.gpRequisitionRepository.save(requisition)
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
  ): Promise<Requisition> {
    const requisition = await this.findOneByCode(requisitionCode)
    this.assertState(
      requisition,
      [RequisitionStateCode.AWAITING_FINANCIAL],
      'A requisição deve estar aguardando análise financeira',
    )

    let targetStateDescription: string
    let authorizedQuantity: number | null = null

    if (dto.decision === FinancialDecision.REJECT) {
      if (!dto.justification?.trim()) {
        throw new BadRequestException(
          'Justificativa obrigatória para rejeitar a requisição',
        )
      }
      targetStateDescription = RequisitionStateCode.REJECTED
    } else {
      if (dto.budgetAvailability === BudgetAvailability.UNAVAILABLE) {
        throw new BadRequestException(
          'A requisição não pode ser aprovada com disponibilidade orçamentária indisponível',
        )
      }

      if (dto.decision === FinancialDecision.APPROVE_PARTIAL) {
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
        targetStateDescription = RequisitionStateCode.APPROVED_PARTIAL
        authorizedQuantity = dto.authorizedQuantity
      } else {
        if (dto.budgetAvailability === BudgetAvailability.PARTIALLY_AVAILABLE) {
          throw new BadRequestException(
            'Disponibilidade parcialmente disponível exige aprovação parcial com quantidade autorizada menor que a solicitada',
          )
        }
        targetStateDescription = RequisitionStateCode.APPROVED
        authorizedQuantity = requisition.quantity
      }
    }

    const targetState = await this.findStateByAcronym(targetStateDescription)

    requisition.stateId = targetState.code
    requisition.authorizedQuantity = authorizedQuantity
    requisition.updatedAt = new Date()

    await this.gpRequisitionRepository.save(requisition)
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

  private async generateRequisitionCode(): Promise<string> {
    const year = new Date().getFullYear()
    const start = new Date(year, 0, 1)
    const end = new Date(year, 11, 31, 23, 59, 59)
    const count = await this.gpRequisitionRepository.count({
      where: { createdAt: Between(start, end) },
    })
    return `REQ-${year}-${String(count + 1).padStart(6, '0')}`
  }

  private async findStateByAcronym(acronym: string): Promise<RequisitionState> {
    const state = await this.gpRequisitionStateRepository.findOne({
      where: { acronym },
    })
    if (!state) {
      throw new ConflictException(
        `Estado de requisição '${acronym}' não configurado`,
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
      where: { id: userId },
    })
    if (!user) {
      throw new NotFoundException(
        `Usuário ${role} com o código ${userId} não encontrado`,
      )
    }
    if (user.status !== 1) {
      throw new BadRequestException(
        `O usuário ${role} com o código ${userId} está inativo`,
      )
    }
    return user
  }

  private async findActiveDepartment(
    departmentId: number,
  ): Promise<Department> {
    const department = await this.gpDepartmentRepository.findOne({
      where: { code: departmentId, deletedAt: IsNull() },
    })
    if (!department) {
      throw new NotFoundException(
        `Departamento com o código ${departmentId} não encontrado`,
      )
    }
    if (department.status !== 1) {
      throw new BadRequestException(
        `Departamento com o código ${departmentId} está inativo`,
      )
    }
    return department
  }

  private async findActiveCostCenter(
    costCenterId: number,
  ): Promise<CostCenter> {
    const costCenter = await this.gpCostCenterRepository.findOne({
      where: { code: costCenterId, deletedAt: IsNull() },
    })
    if (!costCenter) {
      throw new NotFoundException(
        `Centro de custo com o código ${costCenterId} não encontrado`,
      )
    }
    if (costCenter.status !== 1) {
      throw new BadRequestException(
        `Centro de custo com o código ${costCenterId} está inativo`,
      )
    }
    return costCenter
  }

  private async findActivePosition(positionId: number): Promise<Position> {
    const position = await this.gpPositionRepository.findOne({
      where: { code: positionId, deletedAt: IsNull() },
    })
    if (!position) {
      throw new NotFoundException(
        `Cargo com o código ${positionId} não encontrado`,
      )
    }
    if (position.status !== 1) {
      throw new BadRequestException(
        `Cargo com o código ${positionId} está inativo`,
      )
    }
    return position
  }

  private async findActiveHiringType(
    hiringTypeId: number,
  ): Promise<HiringType> {
    const hiringType = await this.gpHiringTypeRepository.findOne({
      where: { code: hiringTypeId, deletedAt: IsNull() },
    })
    if (!hiringType) {
      throw new NotFoundException(
        `Tipo de contratação com o código ${hiringTypeId} não encontrado`,
      )
    }
    if (hiringType.status !== 1) {
      throw new BadRequestException(
        `Tipo de contratação com o código ${hiringTypeId} está inativo`,
      )
    }
    return hiringType
  }
}
