import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { InjectRepository } from '@nestjs/typeorm'

import { ILike, IsNull, Repository } from 'typeorm'

import { PaginatedResponseDto } from 'src/commons/dto/pagination-response.dto'

import {
  AcademicDegree,
  AcademicDegreeStatus,
} from '../entity/academic-degree.entity'

import { CreateAcademicDegreeDto } from '../dto/create-academic-degree.dto'
import { UpdateAcademicDegreeDto } from '../dto/update-academic-degree.dto'
import { ListAcademicDegreeQueryDto } from '../dto/list-academic-degree-query.dto'

@Injectable()
export class AcademicDegreeService {
  constructor(
    @InjectRepository(AcademicDegree)
    private readonly academicDegreeRepository: Repository<AcademicDegree>,
  ) {}
  async create(dto: CreateAcademicDegreeDto): Promise<AcademicDegree> {
    const designation = dto.designation.trim()
    const acronym = dto.acronym?.trim() || null

    const [designationExists, acronymExists] = await Promise.all([
      this.academicDegreeRepository.findOne({
        where: {
          designation,
          deletedAt: IsNull(),
        },
      }),

      acronym
        ? this.academicDegreeRepository.findOne({
            where: {
              acronym,
              deletedAt: IsNull(),
            },
          })
        : Promise.resolve(null),
    ])

    if (designationExists && acronymExists) {
      throw new ConflictException(
        `Já existe um grau acadêmico com a designação "${designation}" e a sigla "${acronym}"`,
      )
    }

    if (designationExists) {
      throw new ConflictException(
        `Já existe um grau acadêmico com a designação "${designation}"`,
      )
    }

    if (acronymExists) {
      throw new ConflictException(
        `Já existe um grau acadêmico com a sigla "${acronym}"`,
      )
    }

    const academicDegree = this.academicDegreeRepository.create({
      designation,
      acronym,
      order: dto.order,
      status: dto.status ?? AcademicDegreeStatus.ACTIVE,
      deletedAt: null,
    })

    return this.academicDegreeRepository.save(academicDegree)
  }
  async findAll(
    query: ListAcademicDegreeQueryDto,
  ): Promise<PaginatedResponseDto<AcademicDegree>> {
    const { search, status, order, page = 1, limit = 10 } = query

    const searchTerm = search?.trim()

    const [data, total] = await this.academicDegreeRepository.findAndCount({
      where: {
        deletedAt: IsNull(),
        ...(searchTerm
          ? [
              {
                designation: ILike(`%${searchTerm}%`),
                ...(status !== undefined ? { status } : {}),
                ...(order !== undefined ? { order } : {}),
              },
              {
                acronym: ILike(`%${searchTerm}%`),
                ...(status !== undefined ? { status } : {}),
                ...(order !== undefined ? { order } : {}),
              },
            ]
          : {
              ...(status !== undefined ? { status } : {}),
              ...(order !== undefined ? { order } : {}),
            }),
      },
      order: {
        order: 'ASC',
        id: 'ASC',
      },
      skip: (page - 1) * limit,
      take: limit,
    })

    return PaginatedResponseDto.create(data, total, page, limit)
  }

  async findOne(id: number): Promise<AcademicDegree> {
    const academicDegree = await this.academicDegreeRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    })

    if (!academicDegree) {
      throw new NotFoundException(
        `Grau acadêmico com o código ${id} não encontrado`,
      )
    }

    return academicDegree
  }

  async update(
    id: number,
    dto: UpdateAcademicDegreeDto,
  ): Promise<AcademicDegree> {
    const academicDegree = await this.findOne(id)

    const designation =
      dto.designation !== undefined
        ? dto.designation.trim()
        : academicDegree.designation

    const acronym =
      dto.acronym !== undefined
        ? dto.acronym.trim() || null
        : academicDegree.acronym

    if (dto.designation !== undefined || dto.acronym !== undefined) {
      const alreadyExists = await this.academicDegreeRepository.findOne({
        where: [
          {
            designation,
            deletedAt: IsNull(),
          },
          ...(acronym
            ? [
                {
                  acronym,
                  deletedAt: IsNull(),
                },
              ]
            : []),
        ],
      })

      if (alreadyExists && alreadyExists.id !== id) {
        throw new ConflictException(
          'Já existe outro grau acadêmico com essa designação ou sigla',
        )
      }
    }

    academicDegree.designation = designation
    academicDegree.acronym = acronym

    if (dto.order !== undefined) {
      academicDegree.order = dto.order
    }

    if (dto.status !== undefined) {
      academicDegree.status = dto.status
    }

    return this.academicDegreeRepository.save(academicDegree)
  }

  async remove(id: number): Promise<void> {
    const academicDegree = await this.findOne(id)

    await this.academicDegreeRepository.softDelete({
      id: academicDegree.id,
    })
  }
}
