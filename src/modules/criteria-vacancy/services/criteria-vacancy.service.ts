import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Repository } from 'typeorm'

import { PaginatedResponseDto } from 'src/commons/dto/pagination-response.dto'

import {
  Criteria,
  CriteriaStatus,
} from 'src/modules/criteria/entity/criteria.entity'
import { Vacancy } from 'src/modules/vacancies/entity/vacancy.entity'

import { CriteriaVacancy } from '../entity/criteria-vacancy.entity'
import { CreateCriteriaVacancyDto } from '../dto/create-criteria-vacancy.dto'
import { UpdateCriteriaVacancyDto } from '../dto/update-criteria-vacancy.dto'
import { ListCriteriaVacancyQueryDto } from '../dto/list-criteria-vacancy-query.dto'

@Injectable()
export class CriteriaVacancyService {
  constructor(
    @InjectRepository(CriteriaVacancy)
    private readonly criteriaVacancyRepository: Repository<CriteriaVacancy>,

    @InjectRepository(Criteria)
    private readonly criteriaRepository: Repository<Criteria>,

    @InjectRepository(Vacancy)
    private readonly vacancyRepository: Repository<Vacancy>,
  ) {}

  async create(dto: CreateCriteriaVacancyDto): Promise<CriteriaVacancy> {
    const vacancy = await this.validateVacancy(dto.vacancyId)

    const criteria = await this.validateCriteria(dto.criteriaId)

    const alreadyExists = await this.criteriaVacancyRepository.findOne({
      where: {
        vacancyId: dto.vacancyId,
        criteriaId: dto.criteriaId,
      },
    })

    if (alreadyExists) {
      throw new ConflictException(
        `O critério "${criteria.description}" já está associado à vaga "${vacancy.code}"`,
      )
    }

    const criteriaVacancy = this.criteriaVacancyRepository.create({
      vacancyId: dto.vacancyId,
      criteriaId: dto.criteriaId,
      weight: dto.weight,
    })

    return this.criteriaVacancyRepository.save(criteriaVacancy)
  }

  async findAll(
    query: ListCriteriaVacancyQueryDto,
  ): Promise<PaginatedResponseDto<CriteriaVacancy>> {
    const { vacancyId, criteriaId, page = 1, limit = 10 } = query

    const [data, total] = await this.criteriaVacancyRepository.findAndCount({
      where: {
        ...(vacancyId !== undefined && {
          vacancyId,
        }),

        ...(criteriaId !== undefined && {
          criteriaId,
        }),
      },

      order: {
        id: 'DESC',
      },

      skip: (page - 1) * limit,
      take: limit,
    })

    return PaginatedResponseDto.create(data, total, page, limit)
  }

  async findOne(id: number): Promise<CriteriaVacancy> {
    const criteriaVacancy = await this.criteriaVacancyRepository.findOne({
      where: {
        id,
      },
    })

    if (!criteriaVacancy) {
      throw new NotFoundException(
        `Associação entre vaga e critério com o código ${id} não encontrada`,
      )
    }

    return criteriaVacancy
  }

  async update(
    id: number,
    dto: UpdateCriteriaVacancyDto,
  ): Promise<CriteriaVacancy> {
    const criteriaVacancy = await this.findOne(id)

    const vacancyId = dto.vacancyId ?? criteriaVacancy.vacancyId

    const criteriaId = dto.criteriaId ?? criteriaVacancy.criteriaId

    const vacancy = await this.validateVacancy(vacancyId)

    const criteria = await this.validateCriteria(criteriaId)

    const associationChanged =
      vacancyId !== criteriaVacancy.vacancyId ||
      criteriaId !== criteriaVacancy.criteriaId

    if (associationChanged) {
      const alreadyExists = await this.criteriaVacancyRepository.findOne({
        where: {
          vacancyId,
          criteriaId,
        },
      })

      if (alreadyExists && alreadyExists.id !== criteriaVacancy.id) {
        throw new ConflictException(
          `O critério "${criteria.description}" já está associado à vaga "${vacancy.code}"`,
        )
      }
    }

    criteriaVacancy.vacancyId = vacancyId
    criteriaVacancy.criteriaId = criteriaId

    if (dto.weight !== undefined) {
      criteriaVacancy.weight = dto.weight
    }

    return this.criteriaVacancyRepository.save(criteriaVacancy)
  }

  async remove(id: number): Promise<void> {
    const criteriaVacancy = await this.findOne(id)

    await this.criteriaVacancyRepository.delete(criteriaVacancy.id)
  }

  private async validateVacancy(vacancyId: number): Promise<Vacancy> {
    const vacancy = await this.vacancyRepository.findOne({
      where: {
        code: vacancyId,
      },
    })

    if (!vacancy) {
      throw new NotFoundException(
        `Vaga com o código ${vacancyId} não encontrada`,
      )
    }

    return vacancy
  }

  private async validateCriteria(criteriaId: number): Promise<Criteria> {
    const criteria = await this.criteriaRepository.findOne({
      where: {
        id: criteriaId,
        status: CriteriaStatus.ACTIVE,
        deletedAt: IsNull(),
      },
    })

    if (!criteria) {
      throw new NotFoundException(
        `Critério com o código ${criteriaId} não encontrado ou não está ativo`,
      )
    }

    return criteria
  }
}
