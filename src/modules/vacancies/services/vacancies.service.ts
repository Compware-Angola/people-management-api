import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  Between,
  FindOptionsWhere,
  ILike,
  IsNull,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm'
import { Vacancy } from '../entity/vacancy.entity'
import { VacancyDocument } from '../entity/vacancy-document.entity'
import { VacancyHistory } from '../entity/vacancy-history.entity'
import { Requisition } from 'src/modules/requisitions/entity/requisition.entity'
import { RequisitionStateCode } from 'src/modules/requisition-states/entity/requisition-state.entity'
import {
  VacancyState,
  VacancyStateCode,
} from 'src/modules/vacancy-states/entity/vacancy-state.entity'
import { User } from 'src/modules/user/entities/user.entity'
import { PaginatedResponseDto } from 'src/commons/dto/pagination-response.dto'
import { CreateVacancyDto } from '../dto/create-vacancy.dto'
import { UpdateVacancyDto } from '../dto/update-vacancy.dto'
import { ListVacanciesQueryDto } from '../dto/list-vacancies-query.dto'
import { VacancyActionDto } from '../dto/vacancy-action.dto'
import { UploadVacancyDocumentDto } from '../dto/upload-vacancy-document.dto'

export const VACANCY_HISTORY_ACTION = {
  CREATE: 'CRIACAO',
  UPDATE: 'ATUALIZACAO',
  PUBLISH: 'PUBLICACAO',
  SUSPEND: 'SUSPENSAO',
  REACTIVATE: 'REATIVACAO',
  CLOSE: 'ENCERRAMENTO',
  CANCEL: 'CANCELAMENTO',
} as const

const VACANCY_RELATIONS = {
  requisition: {
    state: true,
  },
  position: true,
  department: true,
  hiringType: true,
  state: true,
  createdByUser: true,
} as const

// Relações seguras para expor no portal público (sem dados de usuários internos)
const PUBLIC_VACANCY_RELATIONS = {
  position: true,
  department: true,
  hiringType: true,
  state: true,
  documents: true,
} as const

@Injectable()
export class VacanciesService {
  constructor(
    @InjectRepository(Vacancy)
    private readonly gpVacancyRepository: Repository<Vacancy>,
    @InjectRepository(VacancyDocument)
    private readonly gpVacancyDocumentRepository: Repository<VacancyDocument>,
    @InjectRepository(VacancyHistory)
    private readonly gpVacancyHistoryRepository: Repository<VacancyHistory>,
    @InjectRepository(Requisition)
    private readonly gpRequisitionRepository: Repository<Requisition>,
    @InjectRepository(VacancyState)
    private readonly gpVacancyStateRepository: Repository<VacancyState>,
    @InjectRepository(User)
    private readonly gpUserRepository: Repository<User>,
  ) { }

  async create(
    dto: CreateVacancyDto,
    authenticatedUserId: number,
  ): Promise<Vacancy> {
    const requisition = await this.gpRequisitionRepository.findOne({
      where: { code: dto.requisitionId, deletedAt: IsNull() },
      relations: { state: true },
    })
    if (!requisition) {
      throw new NotFoundException(
        `Requisição com o código interno ${dto.requisitionId} não encontrada`,
      )
    }

    const authorizedQuantity =
      requisition.authorizedQuantity ?? requisition.quantity

    if (!requisition.state) {
      throw new ConflictException(
        'Estado da requisição de origem não configurado',
      )
    }
    if (
      ![
        RequisitionStateCode.APPROVED,
        RequisitionStateCode.APPROVED_PARTIAL,
      ].includes(requisition.state.acronym as RequisitionStateCode)
    ) {
      throw new BadRequestException(
        'Somente requisições aprovadas podem originar vagas',
      )
    }

    const vacanciesAlreadyRegistered = await this.gpVacancyRepository.sum(
      'numberOfVacancies',
      { requisitionId: requisition.code },
    )
    const alreadyUsed = vacanciesAlreadyRegistered ?? 0

    const numberOfVacancies =
      dto.numberOfVacancies ?? authorizedQuantity - alreadyUsed
    if (numberOfVacancies <= 0) {
      throw new BadRequestException(
        'A quantidade autorizada da requisição já foi utilizada em vagas cadastradas',
      )
    }
    if (alreadyUsed + numberOfVacancies > authorizedQuantity) {
      throw new BadRequestException(
        `A soma das vagas cadastradas não pode ultrapassar a quantidade aprovada (${authorizedQuantity})`,
      )
    }

    const publicationDate = dto.publicationDate
      ? new Date(`${dto.publicationDate}T00:00:00`)
      : null
    const closingDate = dto.closingDate
      ? new Date(`${dto.closingDate}T23:59:59`)
      : null

    if (publicationDate && closingDate && closingDate <= publicationDate) {
      throw new BadRequestException(
        'A data de encerramento deve ser posterior à data de publicação',
      )
    }

    const draftState = await this.findStateByAcronym(VacancyStateCode.DRAFT)

    const vacancy = this.gpVacancyRepository.create({
      vacancyCode: await this.generateVacancyCode(),
      requisitionId: requisition.code,
      positionId: requisition.positionId,
      departmentId: requisition.departmentId,
      hiringTypeId: requisition.hiringTypeId,
      numberOfVacancies,
      stateId: draftState.code,
      publicationDate,
      closingDate,
      createdBy: authenticatedUserId,
    })

    await this.gpVacancyRepository.save(vacancy)
    await this.registerHistory({
      vacancyId: vacancy.code,
      action: VACANCY_HISTORY_ACTION.CREATE,
      responsibleId: authenticatedUserId,
      observation: `Vaga criada a partir da requisição ${requisition.requisitionCode}`,
    })

    return this.findOneByCode(vacancy.vacancyCode)
  }

  async findAll(
    query: ListVacanciesQueryDto,
  ): Promise<PaginatedResponseDto<Vacancy>> {
    const {
      search,
      positionId,
      departmentId,
      hiringTypeId,
      stateId,
      publicationStart,
      publicationEnd,
      closingStart,
      closingEnd,
      page,
      limit,
      offset,
    } = query

    const where: FindOptionsWhere<Vacancy> = {
      ...(search ? { vacancyCode: ILike(`%${search}%`) } : {}),
      ...(positionId !== undefined ? { positionId } : {}),
      ...(departmentId !== undefined ? { departmentId } : {}),
      ...(hiringTypeId !== undefined ? { hiringTypeId } : {}),
      ...(stateId !== undefined ? { stateId } : {}),
      ...(publicationStart && publicationEnd
        ? {
          publicationDate: Between(
            new Date(`${publicationStart}T00:00:00`),
            new Date(`${publicationEnd}T23:59:59`),
          ),
        }
        : {}),
      ...(closingStart && closingEnd
        ? {
          closingDate: Between(
            new Date(`${closingStart}T00:00:00`),
            new Date(`${closingEnd}T23:59:59`),
          ),
        }
        : {}),
    }

    const [data, total] = await this.gpVacancyRepository.findAndCount({
      where,
      relations: VACANCY_RELATIONS,
      order: { code: 'DESC' },
      skip: offset,
      take: limit,
    })

    return PaginatedResponseDto.create(data, total, page, limit)
  }

  /**
   * Listagem pública (portal de vagas), sem autenticação.
   * Sempre força o filtro para vagas com estado PUBLICADO, ignorando
   * qualquer stateId vindo da query, e devolve um payload reduzido.
   */
  async findAllPublic(
    query: ListVacanciesQueryDto,
  ): Promise<PaginatedResponseDto<Record<string, any>>> {
    const publishedState = await this.findStateByAcronym(
      VacancyStateCode.PUBLISHED,
    )

    const {
      search,
      positionId,
      departmentId,
      hiringTypeId,
      publicationStart,
      publicationEnd,
      closingStart,
      closingEnd,
      page,
      limit,
      offset,
    } = query

    const now = new Date()

    const baseWhere: FindOptionsWhere<Vacancy> = {
      stateId: publishedState.code,
      ...(search ? { vacancyCode: ILike(`%${search}%`) } : {}),
      ...(positionId !== undefined ? { positionId } : {}),
      ...(departmentId !== undefined ? { departmentId } : {}),
      ...(hiringTypeId !== undefined ? { hiringTypeId } : {}),
      ...(publicationStart && publicationEnd
        ? {
          publicationDate: Between(
            new Date(`${publicationStart}T00:00:00`),
            new Date(`${publicationEnd}T23:59:59`),
          ),
        }
        : {}),
      ...(closingStart && closingEnd
        ? {
          closingDate: Between(
            new Date(`${closingStart}T00:00:00`),
            new Date(`${closingEnd}T23:59:59`),
          ),
        }
        : {}),
    }

    // Só mostra vagas cujo prazo ainda não passou (ou sem prazo definido)
    const where: FindOptionsWhere<Vacancy>[] = [
      { ...baseWhere, closingDate: MoreThanOrEqual(now) },
      { ...baseWhere, closingDate: IsNull() },
    ]

    const [data, total] = await this.gpVacancyRepository.findAndCount({
      where,
      relations: PUBLIC_VACANCY_RELATIONS,
      order: { publicationDate: 'DESC', code: 'DESC' },
      skip: offset,
      take: limit,
    })

    return PaginatedResponseDto.create(
      data.map((vacancy) => this.toPublicVacancy(vacancy)),
      total,
      page,
      limit,
    )
  }

  /**
   * Detalhe público de uma vaga. Só retorna se a vaga estiver PUBLICADA
   * (evita vazar rascunhos, suspensas, canceladas etc. via URL direta).
   */
  async findOneByCodePublic(
    vacancyCode: string,
  ): Promise<Record<string, any>> {
    const vacancy = await this.gpVacancyRepository.findOne({
      where: { vacancyCode },
      relations: PUBLIC_VACANCY_RELATIONS,
    })

    if (!vacancy || vacancy.state?.acronym !== VacancyStateCode.PUBLISHED) {
      throw new NotFoundException(
        `Vaga com o código ${vacancyCode} não encontrada`,
      )
    }

    return this.toPublicVacancy(vacancy)
  }

  async findOneByCode(vacancyCode: string): Promise<Vacancy> {
    const vacancy = await this.gpVacancyRepository.findOne({
      where: { vacancyCode },
      relations: {
        ...VACANCY_RELATIONS,
        documents: {
          uploadedByUser: true,
        },
        history: {
          responsible: true,
        },
      },
      order: { history: { date: 'ASC', code: 'ASC' } },
    })
    if (!vacancy) {
      throw new NotFoundException(
        `Vaga com o código ${vacancyCode} não encontrada`,
      )
    }
    return vacancy
  }

  async update(
    vacancyCode: string,
    dto: UpdateVacancyDto,
    authenticatedUserId: number,
  ): Promise<Vacancy> {
    const vacancy = await this.findOneByCode(vacancyCode)
    this.assertState(
      vacancy,
      [VacancyStateCode.DRAFT, VacancyStateCode.SCHEDULED],
      'A vaga só pode ser alterada antes da publicação',
    )

    if (dto.numberOfVacancies !== undefined) {
      await this.validateAuthorizedQuantity(
        vacancy.requisitionId,
        dto.numberOfVacancies,
        vacancy.code,
      )
    }

    const publicationDate = dto.publicationDate
      ? new Date(`${dto.publicationDate}T00:00:00`)
      : vacancy.publicationDate
    const closingDate = dto.closingDate
      ? new Date(`${dto.closingDate}T23:59:59`)
      : vacancy.closingDate

    if (publicationDate && closingDate && closingDate <= publicationDate) {
      throw new BadRequestException(
        'A data de encerramento deve ser posterior à data de publicação',
      )
    }

    Object.assign(vacancy, {
      ...(dto.numberOfVacancies !== undefined
        ? { numberOfVacancies: dto.numberOfVacancies }
        : {}),
      publicationDate,
      closingDate,
      updatedAt: new Date(),
      updatedBy: authenticatedUserId,
    })

    await this.gpVacancyRepository.save(vacancy)
    await this.registerHistory({
      vacancyId: vacancy.code,
      action: VACANCY_HISTORY_ACTION.UPDATE,
      responsibleId: authenticatedUserId,
      observation: 'Dados da vaga alterados antes da publicação',
    })

    return this.findOneByCode(vacancyCode)
  }

  async addDocument(
    vacancyCode: string,
    dto: UploadVacancyDocumentDto,
    file: { path: string; originalName: string },
    authenticatedUserId: number,
  ): Promise<Vacancy> {
    const vacancy = await this.findOneByCode(vacancyCode)

    const document = this.gpVacancyDocumentRepository.create({
      vacancyId: vacancy.code,
      type: dto.type,
      path: file.path,
      originalName: file.originalName,
      description: dto.description ?? null,
      uploadedBy: authenticatedUserId,
    })
    await this.gpVacancyDocumentRepository.save(document)

    await this.registerHistory({
      vacancyId: vacancy.code,
      action: VACANCY_HISTORY_ACTION.UPDATE,
      responsibleId: authenticatedUserId,
      observation: `Documento (${dto.type}) anexado: ${file.originalName}`,
    })

    return this.findOneByCode(vacancyCode)
  }

  async publish(
    vacancyCode: string,
    authenticatedUserId: number,
  ): Promise<Vacancy> {
    const vacancy = await this.findOneByCode(vacancyCode)
    this.assertState(
      vacancy,
      [VacancyStateCode.DRAFT, VacancyStateCode.SCHEDULED],
      'A vaga deve estar em rascunho ou agendada para ser publicada',
    )

    const documentsCount = await this.gpVacancyDocumentRepository.count({
      where: { vacancyId: vacancy.code },
    })
    if (documentsCount === 0) {
      throw new BadRequestException(
        'O Edital de Contratação é obrigatório para publicar a vaga',
      )
    }

    if (vacancy.numberOfVacancies <= 0) {
      throw new BadRequestException(
        'Uma vaga não pode ser publicada com número de vagas igual ou inferior a zero',
      )
    }

    const publicationDate = vacancy.publicationDate
      ? new Date(vacancy.publicationDate)
      : new Date()
    const closingDate = vacancy.closingDate
      ? new Date(vacancy.closingDate)
      : null

    if (closingDate && closingDate <= publicationDate) {
      throw new BadRequestException(
        'A data de encerramento deve ser posterior à data de publicação',
      )
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const publicationDay = new Date(publicationDate)
    publicationDay.setHours(0, 0, 0, 0)

    const isScheduled = publicationDay > today

    const targetState = await this.findStateByAcronym(
      isScheduled ? VacancyStateCode.SCHEDULED : VacancyStateCode.PUBLISHED,
    )

    Object.assign(vacancy, {
      state: targetState,
      stateId: targetState.code,
      publicationDate,
      updatedAt: new Date(),
      updatedBy: authenticatedUserId,
      ...(isScheduled
        ? {}
        : { publishedAt: new Date(), publishedBy: authenticatedUserId }),
    })

    await this.gpVacancyRepository.save(vacancy)
    await this.registerHistory({
      vacancyId: vacancy.code,
      action: VACANCY_HISTORY_ACTION.PUBLISH,
      responsibleId: authenticatedUserId,
      observation: isScheduled
        ? `Vaga agendada para publicação em ${publicationDate.toISOString()}`
        : 'Vaga publicada',
    })

    return this.findOneByCode(vacancyCode)
  }

  async suspend(
    vacancyCode: string,
    dto: VacancyActionDto,
    authenticatedUserId: number,
  ): Promise<Vacancy> {
    const vacancy = await this.findOneByCode(vacancyCode)
    this.assertState(
      vacancy,
      [VacancyStateCode.PUBLISHED],
      'Somente uma vaga publicada pode ser suspensa',
    )

    const suspendedState = await this.findStateByAcronym(
      VacancyStateCode.SUSPENDED,
    )

    Object.assign(vacancy, {
      state: suspendedState,
      stateId: suspendedState.code,
      justification: dto.justification,
      updatedAt: new Date(),
      updatedBy: authenticatedUserId,
      suspendedAt: new Date(),
      suspendedBy: authenticatedUserId,
    })

    await this.gpVacancyRepository.save(vacancy)
    await this.registerHistory({
      vacancyId: vacancy.code,
      action: VACANCY_HISTORY_ACTION.SUSPEND,
      responsibleId: authenticatedUserId,
      observation: dto.observation,
      justification: dto.justification,
    })

    return this.findOneByCode(vacancyCode)
  }

  async reactivate(
    vacancyCode: string,
    authenticatedUserId: number,
  ): Promise<Vacancy> {
    const vacancy = await this.findOneByCode(vacancyCode)
    this.assertState(
      vacancy,
      [VacancyStateCode.SUSPENDED],
      'Somente uma vaga suspensa pode ser reativada',
    )

    const publishedState = await this.findStateByAcronym(
      VacancyStateCode.PUBLISHED,
    )

    Object.assign(vacancy, {
      state: publishedState,
      stateId: publishedState.code,
      updatedAt: new Date(),
      updatedBy: authenticatedUserId,
    })

    await this.gpVacancyRepository.save(vacancy)
    await this.registerHistory({
      vacancyId: vacancy.code,
      action: VACANCY_HISTORY_ACTION.REACTIVATE,
      responsibleId: authenticatedUserId,
      observation: 'Vaga reativada',
    })

    return this.findOneByCode(vacancyCode)
  }

  async close(
    vacancyCode: string,
    dto: VacancyActionDto,
    authenticatedUserId: number,
  ): Promise<Vacancy> {
    const vacancy = await this.findOneByCode(vacancyCode)
    this.assertState(
      vacancy,
      [VacancyStateCode.PUBLISHED, VacancyStateCode.SUSPENDED],
      'Somente uma vaga publicada ou suspensa pode ser encerrada',
    )

    const closedState = await this.findStateByAcronym(VacancyStateCode.CLOSED)

    Object.assign(vacancy, {
      state: closedState,
      stateId: closedState.code,
      justification: dto.justification,
      updatedAt: new Date(),
      updatedBy: authenticatedUserId,
      closedAt: new Date(),
      closedBy: authenticatedUserId,
    })

    await this.gpVacancyRepository.save(vacancy)
    await this.registerHistory({
      vacancyId: vacancy.code,
      action: VACANCY_HISTORY_ACTION.CLOSE,
      responsibleId: authenticatedUserId,
      observation: dto.observation,
      justification: dto.justification,
    })

    return this.findOneByCode(vacancyCode)
  }

  async cancel(
    vacancyCode: string,
    dto: VacancyActionDto,
    authenticatedUserId: number,
  ): Promise<Vacancy> {
    const vacancy = await this.findOneByCode(vacancyCode)
    this.assertState(
      vacancy,
      [
        VacancyStateCode.DRAFT,
        VacancyStateCode.SCHEDULED,
        VacancyStateCode.PUBLISHED,
        VacancyStateCode.SUSPENDED,
      ],
      'Esta vaga não pode ser cancelada',
    )

    const cancelledState = await this.findStateByAcronym(
      VacancyStateCode.CANCELLED,
    )

    Object.assign(vacancy, {
      state: cancelledState,
      stateId: cancelledState.code,
      justification: dto.justification,
      updatedAt: new Date(),
      updatedBy: authenticatedUserId,
      cancelledAt: new Date(),
      cancelledBy: authenticatedUserId,
    })

    await this.gpVacancyRepository.save(vacancy)
    await this.registerHistory({
      vacancyId: vacancy.code,
      action: VACANCY_HISTORY_ACTION.CANCEL,
      responsibleId: authenticatedUserId,
      observation: dto.observation,
      justification: dto.justification,
    })

    return this.findOneByCode(vacancyCode)
  }

  private async validateAuthorizedQuantity(
    requisitionId: number,
    newNumberOfVacancies: number,
    currentVacancyCode: number,
  ): Promise<void> {
    const requisition = await this.gpRequisitionRepository.findOne({
      where: { code: requisitionId, deletedAt: IsNull() },
    })
    if (!requisition) {
      throw new NotFoundException(
        `Requisição com o código interno ${requisitionId} não encontrada`,
      )
    }
    const authorizedQuantity =
      requisition.authorizedQuantity ?? requisition.quantity

    const othersTotal = await this.gpVacancyRepository.sum(
      'numberOfVacancies',
      { requisitionId, code: Not(currentVacancyCode) },
    )
    const total = (othersTotal ?? 0) + newNumberOfVacancies

    if (total > authorizedQuantity) {
      throw new BadRequestException(
        `A soma das vagas cadastradas não pode ultrapassar a quantidade aprovada (${authorizedQuantity})`,
      )
    }
  }

  private async registerHistory(entry: {
    vacancyId: number
    action: string
    responsibleId: number
    observation?: string | null
    justification?: string | null
  }): Promise<void> {
    const history = this.gpVacancyHistoryRepository.create({
      vacancyId: entry.vacancyId,
      action: entry.action,
      responsibleId: entry.responsibleId,
      observation: entry.observation ?? null,
      justification: entry.justification ?? null,
    })
    await this.gpVacancyHistoryRepository.save(history)
  }

  private async generateVacancyCode(): Promise<string> {
    const year = new Date().getFullYear()
    const start = new Date(year, 0, 1)
    const end = new Date(year, 11, 31, 23, 59, 59)
    const count = await this.gpVacancyRepository.count({
      where: { createdAt: Between(start, end) },
    })
    return `VAG-${year}-${String(count + 1).padStart(6, '0')}`
  }

  private async findStateByAcronym(acronym: string): Promise<VacancyState> {
    const state = await this.gpVacancyStateRepository.findOne({
      where: { acronym },
    })
    if (!state) {
      throw new ConflictException(`Estado de vaga '${acronym}' não configurado`)
    }
    return state
  }

  private assertState(
    vacancy: Vacancy,
    allowedStates: string[],
    message: string,
  ): void {
    if (!vacancy.state || !allowedStates.includes(vacancy.state.acronym)) {
      throw new BadRequestException(message)
    }
  }

  /**
   * Remove campos internos/sensíveis antes de expor a vaga no portal público
   * (ids de usuários responsáveis, justificativas de suspensão/cancelamento,
   * requisitionId interno, etc). Ajuste conforme os campos reais da entidade.
   */
  private toPublicVacancy(vacancy: Vacancy): Record<string, any> {
    return {
      code: vacancy.vacancyCode,
      numberOfVacancies: vacancy.numberOfVacancies,
      publicationDate: vacancy.publicationDate,
      closingDate: vacancy.closingDate,
      state: vacancy.state
        ? { code: vacancy.state.code, acronym: vacancy.state.acronym }
        : null,
      position: vacancy.position ?? null,
      department: vacancy.department ?? null,
      hiringType: vacancy.hiringType ?? null,
      documents: (vacancy.documents ?? []).map((doc) => ({
        type: doc.type,
        originalName: doc.originalName,
        description: doc.description,
        // path é omitido de propósito — se o portal precisa baixar o arquivo,
        // exponha uma rota pública dedicada (ex: /vacancies/public/:code/documents/:id)
        // que gera uma URL assinada/temporária, em vez do path bruto do storage.
      })),
    }
  }
}