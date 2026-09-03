import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Between, FindOptionsWhere, ILike, In, Repository } from 'typeorm'
import {
  CANDIDACY_STATE_LABEL,
  Candidacy,
  CandidacyStateCode,
} from './entities/candidacy.entity'
import { CandidacyHistory } from './entities/candidacy-history.entity'
import { Vacancy } from 'src/modules/vacancies/entity/vacancy.entity'
import { VacancyStateCode } from 'src/modules/vacancy-states/entity/vacancy-state.entity'
import { PersonEntity } from 'src/modules/applications/entity/person.entity'
import { CandidateEntity } from 'src/modules/applications/entity/candidate.entity'
import { PaginatedResponseDto } from 'src/commons/dto/pagination-response.dto'
import { CreateCandidacyDto } from './dto/create-candidacy.dto'
import { ListCandidaciesQueryDto } from './dto/list-candidacies-query.dto'
import { ListMyCandidaciesQueryDto } from './dto/list-my-candidacies-query.dto'
import { ChangeCandidacyStateDto } from './dto/change-candidacy-state.dto'
import { WithdrawCandidacyDto } from './dto/withdraw-candidacy.dto'

export const CANDIDACY_HISTORY_ACTION = {
  SUBMIT: 'SUBMISSAO',
  STATE_CHANGE: 'MUDANCA_ESTADO',
  WITHDRAW: 'DESISTENCIA',
} as const

/**
 * Estados que ainda contam como uma candidatura "ativa" do candidato para
 * a mesma vaga — usados para impedir candidaturas duplicadas.
 */
const ACTIVE_CANDIDACY_STATES: CandidacyStateCode[] = [
  CandidacyStateCode.SUBMITTED,
  CandidacyStateCode.UNDER_REVIEW,
  CandidacyStateCode.ADMITTED,
]

/**
 * Transições de estado permitidas à equipa de recrutamento.
 * A desistência (RETIRADA) fica de fora — só o candidato a pode registar.
 */
const ADMIN_ALLOWED_TRANSITIONS: Record<
  CandidacyStateCode,
  CandidacyStateCode[]
> = {
  [CandidacyStateCode.SUBMITTED]: [
    CandidacyStateCode.UNDER_REVIEW,
    CandidacyStateCode.REJECTED,
  ],
  [CandidacyStateCode.UNDER_REVIEW]: [
    CandidacyStateCode.ADMITTED,
    CandidacyStateCode.REJECTED,
  ],
  [CandidacyStateCode.ADMITTED]: [
    CandidacyStateCode.UNDER_REVIEW,
    CandidacyStateCode.REJECTED,
  ],
  [CandidacyStateCode.REJECTED]: [CandidacyStateCode.UNDER_REVIEW],
  [CandidacyStateCode.WITHDRAWN]: [],
}

const CANDIDACY_VACANCY_RELATIONS = {
  vacancy: {
    position: true,
    department: true,
    hiringType: true,
    state: true,
  },
} as const

interface CandidateInfo {
  id: number
  fullName: string | null
  email: string | null
  phone: string | null
  academicDegreeId: number | null
}

@Injectable()
export class CandidacyService {
  constructor(
    @InjectRepository(Candidacy)
    private readonly candidacyRepository: Repository<Candidacy>,
    @InjectRepository(CandidacyHistory)
    private readonly candidacyHistoryRepository: Repository<CandidacyHistory>,
    @InjectRepository(Vacancy)
    private readonly vacancyRepository: Repository<Vacancy>,
    @InjectRepository(PersonEntity)
    private readonly personRepository: Repository<PersonEntity>,
    @InjectRepository(CandidateEntity)
    private readonly candidateRepository: Repository<CandidateEntity>,
  ) {}

  // ---------------------------------------------------------------------------
  // Visão do candidato
  // ---------------------------------------------------------------------------

  /**
   * O candidato autenticado candidata-se a uma vaga publicada.
   */
  async apply(
    dto: CreateCandidacyDto,
    username: string,
    userId: number,
  ): Promise<Record<string, any>> {
    const { candidateId, person } = await this.resolveCandidate(username)

    const vacancy = await this.vacancyRepository.findOne({
      where: { vacancyCode: dto.vacancyCode },
      relations: { state: true },
    })
    if (!vacancy) {
      throw new NotFoundException(
        `Vaga com o código ${dto.vacancyCode} não encontrada`,
      )
    }
    if (
      (vacancy.state?.acronym as VacancyStateCode) !==
      VacancyStateCode.PUBLISHED
    ) {
      throw new BadRequestException(
        'Só é possível candidatar-se a vagas publicadas',
      )
    }
    if (vacancy.closingDate && new Date(vacancy.closingDate) < new Date()) {
      throw new BadRequestException(
        'O prazo de candidatura para esta vaga já encerrou',
      )
    }

    const activeCandidacy = await this.candidacyRepository.findOne({
      where: {
        candidateId,
        vacancyId: vacancy.code,
        state: In(ACTIVE_CANDIDACY_STATES),
      },
    })
    if (activeCandidacy) {
      throw new ConflictException(
        'Já existe uma candidatura sua em curso para esta vaga',
      )
    }

    const candidacy = this.candidacyRepository.create({
      vacancyId: vacancy.code,
      candidateId,
      state: CandidacyStateCode.SUBMITTED,
    })
    await this.candidacyRepository.save(candidacy)

    await this.registerHistory({
      candidacyId: candidacy.code,
      action: CANDIDACY_HISTORY_ACTION.SUBMIT,
      previousState: null,
      newState: CandidacyStateCode.SUBMITTED,
      responsibleId: userId,
      note: `Candidatura submetida por ${person.fullName ?? person.email ?? username}`,
    })

    return this.findMineOne(username, candidacy.code)
  }

  /**
   * Lista paginada das candidaturas do candidato autenticado.
   */
  async findMine(
    username: string,
    query: ListMyCandidaciesQueryDto,
  ): Promise<PaginatedResponseDto<Record<string, any>>> {
    const { candidateId } = await this.resolveCandidate(username)
    const { state, page, limit, offset } = query

    const where: FindOptionsWhere<Candidacy> = {
      candidateId,
      ...(state !== undefined ? { state } : {}),
    }

    const [data, total] = await this.candidacyRepository.findAndCount({
      where,
      relations: CANDIDACY_VACANCY_RELATIONS,
      order: { code: 'DESC' },
      skip: offset,
      take: limit,
    })

    return PaginatedResponseDto.create(
      data.map((candidacy) => this.serialize(candidacy)),
      total,
      page,
      limit,
    )
  }

  /**
   * Detalhe de uma candidatura do candidato autenticado, com histórico.
   */
  async findMineOne(
    username: string,
    code: number,
  ): Promise<Record<string, any>> {
    const { candidateId } = await this.resolveCandidate(username)

    const candidacy = await this.candidacyRepository.findOne({
      where: { code },
      relations: { ...CANDIDACY_VACANCY_RELATIONS, history: true },
    })
    if (!candidacy || candidacy.candidateId !== candidateId) {
      throw new NotFoundException(`Candidatura ${code} não encontrada`)
    }

    return this.serialize(candidacy, { includeHistory: true })
  }

  /**
   * O candidato retira/desiste de uma candidatura ainda em curso.
   */
  async withdraw(
    username: string,
    userId: number,
    code: number,
    dto: WithdrawCandidacyDto,
  ): Promise<Record<string, any>> {
    const { candidateId } = await this.resolveCandidate(username)

    const candidacy = await this.candidacyRepository.findOne({
      where: { code },
    })
    if (!candidacy || candidacy.candidateId !== candidateId) {
      throw new NotFoundException(`Candidatura ${code} não encontrada`)
    }
    if (
      ![CandidacyStateCode.SUBMITTED, CandidacyStateCode.UNDER_REVIEW].includes(
        candidacy.state,
      )
    ) {
      throw new BadRequestException('Esta candidatura já não pode ser retirada')
    }

    const previousState = candidacy.state
    candidacy.state = CandidacyStateCode.WITHDRAWN
    candidacy.updatedAt = new Date()
    await this.candidacyRepository.save(candidacy)

    await this.registerHistory({
      candidacyId: candidacy.code,
      action: CANDIDACY_HISTORY_ACTION.WITHDRAW,
      previousState,
      newState: CandidacyStateCode.WITHDRAWN,
      responsibleId: userId,
      note: dto.note ?? null,
    })

    return this.findMineOne(username, code)
  }

  // ---------------------------------------------------------------------------
  // Visão administrativa
  // ---------------------------------------------------------------------------

  /**
   * Listagem geral de todas as candidaturas (com paginação e filtros).
   */
  async findAll(
    query: ListCandidaciesQueryDto,
  ): Promise<PaginatedResponseDto<Record<string, any>>> {
    const {
      vacancyCode,
      candidateId,
      state,
      createdStart,
      createdEnd,
      page,
      limit,
      offset,
    } = query

    const where: FindOptionsWhere<Candidacy> = {
      ...(state !== undefined ? { state } : {}),
      ...(candidateId !== undefined ? { candidateId } : {}),
      ...(vacancyCode
        ? { vacancy: { vacancyCode: ILike(`%${vacancyCode}%`) } }
        : {}),
      ...(createdStart && createdEnd
        ? {
            createdAt: Between(
              new Date(`${createdStart}T00:00:00`),
              new Date(`${createdEnd}T23:59:59`),
            ),
          }
        : {}),
    }

    const [data, total] = await this.candidacyRepository.findAndCount({
      where,
      relations: CANDIDACY_VACANCY_RELATIONS,
      order: { code: 'DESC' },
      skip: offset,
      take: limit,
    })

    const candidateInfo = await this.loadCandidateInfo(
      data.map((candidacy) => candidacy.candidateId),
    )

    return PaginatedResponseDto.create(
      data.map((candidacy) =>
        this.serialize(candidacy, {
          candidate:
            candidateInfo.get(candidacy.candidateId) ??
            this.emptyCandidateInfo(candidacy.candidateId),
        }),
      ),
      total,
      page,
      limit,
    )
  }

  /**
   * Detalhe administrativo de qualquer candidatura, com candidato e histórico.
   */
  async findOne(code: number): Promise<Record<string, any>> {
    const candidacy = await this.candidacyRepository.findOne({
      where: { code },
      relations: { ...CANDIDACY_VACANCY_RELATIONS, history: true },
    })
    if (!candidacy) {
      throw new NotFoundException(`Candidatura ${code} não encontrada`)
    }

    const candidateInfo = await this.loadCandidateInfo([candidacy.candidateId])

    return this.serialize(candidacy, {
      includeHistory: true,
      candidate:
        candidateInfo.get(candidacy.candidateId) ??
        this.emptyCandidateInfo(candidacy.candidateId),
    })
  }

  /**
   * A equipa de recrutamento altera o estado de uma candidatura.
   */
  async changeState(
    code: number,
    dto: ChangeCandidacyStateDto,
    responsibleId: number,
  ): Promise<Record<string, any>> {
    if (dto.state === CandidacyStateCode.WITHDRAWN) {
      throw new BadRequestException(
        'A desistência só pode ser registada pelo próprio candidato',
      )
    }

    const candidacy = await this.candidacyRepository.findOne({
      where: { code },
    })
    if (!candidacy) {
      throw new NotFoundException(`Candidatura ${code} não encontrada`)
    }
    if (candidacy.state === dto.state) {
      throw new BadRequestException('A candidatura já se encontra neste estado')
    }

    const allowed = ADMIN_ALLOWED_TRANSITIONS[candidacy.state] ?? []
    if (!allowed.includes(dto.state)) {
      throw new BadRequestException(
        `Transição de estado inválida (${CANDIDACY_STATE_LABEL[candidacy.state]} → ${CANDIDACY_STATE_LABEL[dto.state]})`,
      )
    }

    const previousState = candidacy.state
    candidacy.state = dto.state
    candidacy.updatedAt = new Date()
    await this.candidacyRepository.save(candidacy)

    await this.registerHistory({
      candidacyId: candidacy.code,
      action: CANDIDACY_HISTORY_ACTION.STATE_CHANGE,
      previousState,
      newState: dto.state,
      responsibleId,
      note: dto.note ?? null,
    })

    return this.findOne(code)
  }

  // ---------------------------------------------------------------------------
  // Auxiliares
  // ---------------------------------------------------------------------------

  /**
   * Resolve o perfil de candidatura (FK2_MGD_TB_CANDIDATURA) a partir do
   * e-mail do utilizador autenticado, seguindo a mesma lógica do módulo de
   * candidaturas docentes.
   */
  private async resolveCandidate(
    username: string,
  ): Promise<{ candidateId: number; person: PersonEntity }> {
    const person = await this.personRepository.findOne({
      where: { email: username },
    })
    if (!person) {
      throw new ForbiddenException(
        'Nenhum perfil de candidato associado ao utilizador autenticado',
      )
    }

    const candidate = await this.candidateRepository
      .createQueryBuilder('candidate')
      .where(
        `JSON_EXISTS(candidate.person, '$?(@.pk_pessoa == $personId)' PASSING :personId AS "personId")`,
        { personId: person.id },
      )
      .orderBy('candidate.applicationDate', 'DESC')
      .getOne()

    if (!candidate) {
      throw new ForbiddenException(
        'Conclua o seu perfil de candidatura antes de se candidatar a uma vaga',
      )
    }

    return { candidateId: candidate.id, person }
  }

  private async registerHistory(entry: {
    candidacyId: number
    action: string
    previousState: number | null
    newState: number | null
    responsibleId: number | null
    note?: string | null
  }): Promise<void> {
    const history = this.candidacyHistoryRepository.create({
      candidacyId: entry.candidacyId,
      action: entry.action,
      previousState: entry.previousState,
      newState: entry.newState,
      responsibleId: entry.responsibleId,
      note: entry.note ?? null,
    })
    await this.candidacyHistoryRepository.save(history)
  }

  /**
   * Carrega dados básicos (nome, e-mail, telefone) dos candidatos a partir
   * dos respetivos perfis. Best-effort: perfis sem pessoa associada devolvem
   * apenas o id.
   */
  private async loadCandidateInfo(
    candidateIds: number[],
  ): Promise<Map<number, CandidateInfo>> {
    const uniqueIds = [...new Set(candidateIds)]
    const result = new Map<number, CandidateInfo>()
    if (!uniqueIds.length) {
      return result
    }

    const candidates = await this.candidateRepository.find({
      where: { id: In(uniqueIds) },
    })

    const personIdByCandidate = new Map<number, number | null>()
    const personIds: number[] = []

    for (const candidate of candidates) {
      let personId: number | null = null
      try {
        const raw =
          typeof candidate.person === 'string' ? candidate.person : null
        const parsed = raw ? (JSON.parse(raw) as { pk_pessoa?: unknown }) : null
        personId =
          typeof parsed?.pk_pessoa === 'number' ? parsed.pk_pessoa : null
      } catch {
        // JSON malformado no perfil: segue sem pessoa associada
      }
      personIdByCandidate.set(candidate.id, personId)
      if (personId) {
        personIds.push(personId)
      }
    }

    const persons = personIds.length
      ? await this.personRepository.find({ where: { id: In(personIds) } })
      : []
    const personMap = new Map(persons.map((person) => [person.id, person]))

    for (const candidate of candidates) {
      const personId = personIdByCandidate.get(candidate.id) ?? null
      const person = personId ? personMap.get(personId) : undefined
      result.set(candidate.id, {
        id: candidate.id,
        fullName: person?.fullName ?? null,
        email: person?.email ?? null,
        phone: person?.phone ?? null,
        academicDegreeId: candidate.academicDegreeId ?? null,
      })
    }

    return result
  }

  private emptyCandidateInfo(candidateId: number): CandidateInfo {
    return {
      id: candidateId,
      fullName: null,
      email: null,
      phone: null,
      academicDegreeId: null,
    }
  }

  private serialize(
    candidacy: Candidacy,
    options: {
      includeHistory?: boolean
      candidate?: CandidateInfo
    } = {},
  ): Record<string, any> {
    const payload: Record<string, any> = {
      code: candidacy.code,
      state: candidacy.state,
      stateLabel: CANDIDACY_STATE_LABEL[candidacy.state] ?? null,
      createdAt: candidacy.createdAt,
      updatedAt: candidacy.updatedAt,
      vacancy: this.toVacancySummary(candidacy.vacancy),
    }

    if (options.candidate !== undefined) {
      payload.candidate = options.candidate
    }

    if (options.includeHistory) {
      payload.history = [...(candidacy.history ?? [])]
        .sort(
          (a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime() ||
            a.code - b.code,
        )
        .map((item) => ({
          code: item.code,
          action: item.action,
          previousState: item.previousState,
          previousStateLabel:
            item.previousState != null
              ? (CANDIDACY_STATE_LABEL[item.previousState] ?? null)
              : null,
          newState: item.newState,
          newStateLabel:
            item.newState != null
              ? (CANDIDACY_STATE_LABEL[item.newState] ?? null)
              : null,
          responsibleId: item.responsibleId,
          note: item.note,
          date: item.date,
        }))
    }

    return payload
  }

  private toVacancySummary(vacancy?: Vacancy): Record<string, any> | null {
    if (!vacancy) {
      return null
    }
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
    }
  }
}
