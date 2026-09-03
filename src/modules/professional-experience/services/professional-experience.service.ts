import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'

import { ProfessionalExperienceEntity } from '../entity/professional-experience.entity'
import { CreateProfessionalExperienceDto } from '../dto/create-professional-experience.dto'
import { UpdateProfessionalExperienceDto } from '../dto/update-professional-experience.dto'
import { DecodedUserPayload } from 'src/commons/guards/remote-jwt-auth.guard'
import { PersonEntity } from 'src/modules/user/entities/person.entity'

@Injectable()
export class ProfessionalExperienceService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async createMany(
    payload: DecodedUserPayload,
    dtos: CreateProfessionalExperienceDto[],
  ): Promise<ProfessionalExperienceEntity[]> {
    const personId = Number(payload.personId)

    await this.ensurePersonExists(personId)

    if (dtos.length === 0) {
      return []
    }

    return this.dataSource.transaction(async (manager) => {
      const experiences = dtos.map((dto) =>
        manager.create(ProfessionalExperienceEntity, {
          institution: dto.institution?.trim() ?? null,
          area: dto.area?.trim() ?? null,
          function: dto.function?.trim() ?? null,
          position: dto.position?.trim() ?? null,
          startYear: dto.startYear ?? null,
          endYear: dto.endYear ?? null,
          personId,
        }),
      )

      return manager.save(ProfessionalExperienceEntity, experiences)
    })
  }

  /**
   * Lists all professional experiences belonging to
   * the authenticated person.
   */
  async findMyExperiences(
    payload: DecodedUserPayload,
  ): Promise<ProfessionalExperienceEntity[]> {
    const personId = Number(payload.personId)

    return this.dataSource.getRepository(ProfessionalExperienceEntity).find({
      where: {
        personId,
      },
      order: {
        startYear: 'DESC',
        id: 'DESC',
      },
    })
  }

  /**
   * Updates one professional experience belonging
   * to the authenticated person.
   */
  async updateMyExperience(
    payload: DecodedUserPayload,
    id: number,
    dto: UpdateProfessionalExperienceDto,
  ): Promise<ProfessionalExperienceEntity> {
    const personId = Number(payload.personId)

    return this.dataSource.transaction(async (manager) => {
      const experience = await manager.findOne(ProfessionalExperienceEntity, {
        where: {
          id,
          personId,
        },
      })

      if (!experience) {
        throw new NotFoundException(
          `Professional experience with ID ${id} was not found`,
        )
      }

      this.applyChanges(experience, dto)

      return manager.save(ProfessionalExperienceEntity, experience)
    })
  }

  /**
   * Deletes one professional experience belonging
   * to the authenticated person.
   */
  async removeMyExperience(
    payload: DecodedUserPayload,
    id: number,
  ): Promise<void> {
    const personId = Number(payload.personId)

    const repository = this.dataSource.getRepository(
      ProfessionalExperienceEntity,
    )

    const experience = await repository.findOne({
      where: {
        id,
        personId,
      },
    })

    if (!experience) {
      throw new NotFoundException(
        `Professional experience with ID ${id} was not found`,
      )
    }

    await repository.remove(experience)
  }

  /**
   * Lists all professional experiences for a specific person.
   *
   * This method is intended for administrative access.
   */
  async findByPersonId(
    personId: number,
  ): Promise<ProfessionalExperienceEntity[]> {
    await this.ensurePersonExists(personId)

    return this.dataSource.getRepository(ProfessionalExperienceEntity).find({
      where: {
        personId,
      },
      order: {
        startYear: 'DESC',
        id: 'DESC',
      },
    })
  }

  private applyChanges(
    experience: ProfessionalExperienceEntity,
    dto: UpdateProfessionalExperienceDto,
  ): void {
    if (dto.institution !== undefined) {
      experience.institution = dto.institution.trim()
    }

    if (dto.area !== undefined) {
      experience.area = dto.area.trim()
    }

    if (dto.function !== undefined) {
      experience.function = dto.function.trim()
    }

    if (dto.position !== undefined) {
      experience.position = dto.position.trim()
    }

    if (dto.startYear !== undefined) {
      experience.startYear = dto.startYear
    }

    if (dto.endYear !== undefined) {
      experience.endYear = dto.endYear
    }
  }

  private async ensurePersonExists(personId: number): Promise<void> {
    const person = await this.dataSource.getRepository(PersonEntity).findOne({
      where: {
        id: personId,
      },
    })

    if (!person) {
      throw new NotFoundException(`Person with ID ${personId} was not found`)
    }
  }
}
