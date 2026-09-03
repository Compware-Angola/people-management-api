import { CreateUserCollaboratorDto } from '../dto/create-user-collaborator.dto'
import { UpdateUserCollaboratorDto } from '../dto/update-user-collaborator.dto'
import { ListUserCollaboratorQueryDto } from '../dto/list-user-collaborator-query.dto'
import { UserCollaboratorEntity } from '../entities/user-collaborator.entity'
import { DataSource, EntityManager } from 'typeorm'
import { InjectDataSource } from '@nestjs/typeorm'
import { PersonEntity } from '../entities/person.entity'
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PaginatedResponseDto } from 'src/commons/dto/pagination-response.dto'
import { DecodedUserPayload } from 'src/commons/guards/remote-jwt-auth.guard'
import { HashService } from 'src/commons/services/hash.service'

type UserCollaboratorView = {
  id: number
  email: string
  username: string
  personId: number
  person: PersonEntity
}

type ProfileCompletion = {
  id: number
  isComplete: boolean
  completionPercentage: number
  missingFields: string[]
  filledFields: string[]
}

const REQUIRED_PERSON_FIELDS: (keyof PersonEntity)[] = [
  'name',
  'identityDocument',
  'phone',
  'motherName',
  'fatherName',
  'nationalityId',
  'maritalStatusId',
  'genderId',
  'birthDate',
  'documentIssueDate',
  'documentExpirationDate',
]

@Injectable()
export class UserCollaboratorService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly hashService: HashService,
  ) {}

  async create(
    dto: CreateUserCollaboratorDto,
  ): Promise<UserCollaboratorEntity> {
    return this.dataSource.transaction(async (manager) => {
      const email = dto.email.trim().toLowerCase()

      const existingUser = await manager.findOne(UserCollaboratorEntity, {
        where: {
          email,
        },
      })

      if (existingUser) {
        throw new ConflictException('Já existe uma conta utilizando este email')
      }
      const person = manager.create(PersonEntity, {
        name: dto.fullName.trim(),
      })

      const savedPerson = await manager.save(PersonEntity, person)
      const username = await this.generateUsername(savedPerson.name, manager)
      const password = await this.hashService.hash(dto.password)
      const user = manager.create(UserCollaboratorEntity, {
        personId: savedPerson.id,
        email,
        username,
        password,
      })
      const savedUser = await manager.save(UserCollaboratorEntity, user)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = savedUser

      return userWithoutPassword as UserCollaboratorEntity
    })
  }

  async findAll(
    query: ListUserCollaboratorQueryDto,
  ): Promise<PaginatedResponseDto<UserCollaboratorView>> {
    const { search, status, page = 1, limit = 10 } = query

    const qb = this.dataSource
      .getRepository(UserCollaboratorEntity)
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.person', 'person')
      .orderBy('user.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)

    if (search && search.trim().length > 0) {
      const term = `%${search.trim().toLowerCase()}%`

      qb.andWhere(
        `(
                    LOWER(person.name) LIKE :term
                    OR LOWER(user.email) LIKE :term
                    OR LOWER(user.username) LIKE :term
                    OR LOWER(person.identityDocument) LIKE :term
                )`,
        { term },
      )
    }

    if (status !== undefined) {
      qb.andWhere('person.status = :status', { status })
    }

    const [rows, total] = await qb.getManyAndCount()

    return PaginatedResponseDto.create(
      rows.map((row) => this.toView(row)),
      total,
      page,
      limit,
    )
  }

  async findMe(payload: DecodedUserPayload): Promise<UserCollaboratorView> {
    const repository = this.dataSource.getRepository(UserCollaboratorEntity)

    let user: UserCollaboratorEntity | null = null

    if (payload?.sub !== undefined && payload.sub !== null) {
      user = await repository.findOne({
        where: { id: Number(payload.sub) },
        relations: { person: true },
      })
    }

    if (!user && payload?.username) {
      user = await repository.findOne({
        where: { username: payload.username.trim().toLowerCase() },
        relations: { person: true },
      })
    }

    if (!user) {
      throw new NotFoundException(
        'Não existe colaborador associado a este utilizador',
      )
    }

    return this.toView(user)
  }

  async findOne(id: number): Promise<UserCollaboratorView> {
    const user = await this.dataSource
      .getRepository(UserCollaboratorEntity)
      .findOne({
        where: { id },
        relations: { person: true },
      })

    if (!user) {
      throw new NotFoundException(`Colaborador com ID ${id} não encontrado`)
    }

    return this.toView(user)
  }

  async update(
    id: number,
    dto: UpdateUserCollaboratorDto,
  ): Promise<UserCollaboratorView> {
    return this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(UserCollaboratorEntity, {
        where: { id },
        relations: { person: true },
      })

      if (!user) {
        throw new NotFoundException(`Colaborador com ID ${id} não encontrado`)
      }

      await this.applyUserChanges(manager, user, dto)
      await this.applyPersonChanges(manager, user.person, dto)

      const updated = await manager.findOne(UserCollaboratorEntity, {
        where: { id },
        relations: { person: true },
      })

      return this.toView(updated as UserCollaboratorEntity)
    })
  }

  async updateMe(
    payload: DecodedUserPayload,
    dto: UpdateUserCollaboratorDto,
  ): Promise<UserCollaboratorView> {
    const { id } = await this.findMe(payload)
    return this.update(id, dto)
  }


  async checkCompletion(id: number): Promise<ProfileCompletion> {
    return this.buildCompletion(await this.findOne(id))
  }

 
  async checkMyCompletion(
    payload: DecodedUserPayload,
  ): Promise<ProfileCompletion> {
    return this.buildCompletion(await this.findMe(payload))
  }

  private buildCompletion(view: UserCollaboratorView): ProfileCompletion {
    const { id, person } = view

    const missingFields: string[] = []
    const filledFields: string[] = []

    for (const field of REQUIRED_PERSON_FIELDS) {
      if (this.isFilled(person[field])) {
        filledFields.push(field)
      } else {
        missingFields.push(field)
      }
    }

    const total = REQUIRED_PERSON_FIELDS.length
    const completionPercentage = Math.round((filledFields.length / total) * 100)

    return {
      id,
      isComplete: missingFields.length === 0,
      completionPercentage,
      missingFields,
      filledFields,
    }
  }

  async remove(id: number): Promise<void> {
    const user = await this.dataSource
      .getRepository(UserCollaboratorEntity)
      .findOne({ where: { id } })

    if (!user) {
      throw new NotFoundException(`Colaborador com ID ${id} não encontrado`)
    }

    await this.dataSource
      .getRepository(PersonEntity)
      .update(user.personId, { status: 0 })
  }

  private async applyUserChanges(
    manager: EntityManager,
    user: UserCollaboratorEntity,
    dto: UpdateUserCollaboratorDto,
  ): Promise<void> {
    const changes: Partial<UserCollaboratorEntity> = {}

    if (dto.email !== undefined) {
      const email = dto.email.trim().toLowerCase()

      if (email !== user.email) {
        const existing = await manager.findOne(UserCollaboratorEntity, {
          where: { email },
        })

        if (existing && existing.id !== user.id) {
          throw new ConflictException(
            'Já existe uma conta utilizando este email',
          )
        }

        changes.email = email
      }
    }

    if (dto.username !== undefined) {
      const username = dto.username.trim().toLowerCase()

      if (username !== user.username) {
        const existing = await manager.findOne(UserCollaboratorEntity, {
          where: { username },
        })

        if (existing && existing.id !== user.id) {
          throw new ConflictException(
            'Já existe uma conta utilizando este username',
          )
        }

        changes.username = username
      }
    }

    if (Object.keys(changes).length > 0) {
      await manager.update(UserCollaboratorEntity, user.id, changes)
    }
  }

  private async applyPersonChanges(
    manager: EntityManager,
    person: PersonEntity,
    dto: UpdateUserCollaboratorDto,
  ): Promise<void> {
    const changes: Partial<PersonEntity> = {}

    if (dto.fullName !== undefined) {
      changes.name = dto.fullName.trim()
    }
    if (dto.identityDocument !== undefined) {
      changes.identityDocument = dto.identityDocument.trim()
    }
    if (dto.taxIdentificationNumber !== undefined) {
      changes.taxIdentificationNumber = dto.taxIdentificationNumber.trim()
    }
    if (dto.phone !== undefined) {
      changes.phone = dto.phone.trim()
    }
    if (dto.alternativePhone !== undefined) {
      changes.alternativePhone = dto.alternativePhone.trim()
    }
    if (dto.motherName !== undefined) {
      changes.motherName = dto.motherName.trim()
    }
    if (dto.fatherName !== undefined) {
      changes.fatherName = dto.fatherName.trim()
    }
    if (dto.nationalityId !== undefined) {
      changes.nationalityId = dto.nationalityId
    }
    if (dto.maritalStatusId !== undefined) {
      changes.maritalStatusId = dto.maritalStatusId
    }
    if (dto.genderId !== undefined) {
      changes.genderId = dto.genderId
    }
    if (dto.birthDate !== undefined) {
      changes.birthDate = new Date(dto.birthDate)
    }
    if (dto.documentIssueDate !== undefined) {
      changes.documentIssueDate = new Date(dto.documentIssueDate)
    }
    if (dto.documentExpirationDate !== undefined) {
      changes.documentExpirationDate = new Date(dto.documentExpirationDate)
    }
    if (dto.status !== undefined) {
      changes.status = dto.status
    }

    if (Object.keys(changes).length > 0) {
      await manager.update(PersonEntity, person.id, changes)
    }
  }

  private toView(user: UserCollaboratorEntity): UserCollaboratorView {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      personId: user.personId,
      person: user.person,
    }
  }

  private isFilled(value: unknown): boolean {
    if (value === null || value === undefined) {
      return false
    }

    if (typeof value === 'string') {
      return value.trim().length > 0
    }

    return true
  }

  private async generateUsername(
    name: string,
    manager: EntityManager,
  ): Promise<string> {
    const baseUsername = this.normalizeUsername(name)

    let username = baseUsername
    let counter = 1

    while (true) {
      const existing = await manager.findOne(UserCollaboratorEntity, {
        where: {
          username,
        },
      })

      if (!existing) {
        return username
      }

      username = `${baseUsername}${counter}`

      counter++
    }
  }
  private normalizeUsername(name: string): string {
    const normalized = name
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .split(/\s+/)

    if (normalized.length === 0) {
      return `colaborador${Date.now()}`
    }

    if (normalized.length === 1) {
      return normalized[0]
    }

    const firstName = normalized[0]
    const lastName = normalized[normalized.length - 1]

    return `${firstName}.${lastName}`
  }
}
