/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { CreateUserDto } from '../dto/create-user.dto'
import { UpdateUserDto } from '../dto/update-user.dto'
import { UserQueryDto } from '../dto/user-query.dto'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource, QueryRunner } from 'typeorm'
import { EnvService } from 'src/commons/utils/env/env.service'
import { AuthApiService } from 'src/commons/services/auth-api.service'
import { PersonEntity } from '../entities/person.entity'
import { User } from '../entities/user.entity'

@Injectable()
export class UserService {
  private readonly hashServiceUrl: string

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly authApiService: AuthApiService,
    private readonly envService: EnvService,
  ) {
    this.hashServiceUrl = this.envService.get('HASH_SERVICE_URL') || ''
  }

  private async getHash(text: string): Promise<string> {
    try {
      const response = await fetch(`${this.hashServiceUrl}/hash`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ texto: text }),
      })

      if (!response.ok) {
        throw new Error(`Hash service returned ${response.status}`)
      }

      const data = await response.json()
      return data.hash
    } catch (error) {
      console.error('Error calling hash service:', error)
      throw new InternalServerErrorException('Erro ao gerar hash da senha')
    }
  }

  async create(createUserDto: CreateUserDto) {
    const [biExists, nifExists, phoneExists] = await Promise.all([
      this.checkBI(createUserDto.bi),
      createUserDto.nif
        ? this.checkNIF(createUserDto.nif)
        : Promise.resolve(false),
      this.checkPhoneNumber(createUserDto.phone),
    ])
    if (biExists) {
      throw new BadRequestException('Já existe um usuário com este BI')
    }
    if (nifExists) {
      throw new BadRequestException('Já existe um usuário com este NIF')
    }
    if (phoneExists) {
      throw new BadRequestException('Já existe um usuário com este telefone')
    }
    const { firstName, lastName } = this.splitName(createUserDto.name)
    const queryRunner = this.dataSource.createQueryRunner()
    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()
      const person = await this.createPerson(queryRunner, createUserDto)
      await queryRunner.manager.save(PersonEntity, person)

      const identityResponse = await this.authApiService.createIdentity({
        email: createUserDto.email,
        firstName,
        lastName,
        phone: createUserDto.phone,
        bi: createUserDto.bi,
        avatar: '',
        password: createUserDto.bi,
        platforms: [
          {
            platformCode: 'GP',
            platformUserKey: 'GP',
          },
        ],
      })

      const externalId = identityResponse.identity.id
      const user = queryRunner.manager.create(User, {
        email: createUserDto.email,
        personId: person.id,
        externalId,
      })

      await queryRunner.manager.save(User, user)
      await queryRunner.commitTransaction()
    } catch (error) {
      this.handleDatabaseError(error, 'cadastrar')
      await queryRunner.rollbackTransaction()
    } finally {
      await queryRunner.release()
    }
  }

  async findAll(query: UserQueryDto) {
    const values: any[] = []
    let whereClause = ''
    const conditions: string[] = []

    if (query.bi) {
      conditions.push(`BI = :${values.length + 1}`)
      values.push(query.bi)
    }

    if (query.email) {
      conditions.push(`EMAIL = :${values.length + 1}`)
      values.push(query.email)
    }

    if (query.name) {
      conditions.push(`UPPER(NOME) LIKE :${values.length + 1}`)
      values.push(`%${query.name.toUpperCase()}%`)
    }

    if (conditions.length > 0) {
      whereClause = `WHERE ${conditions.join(' AND ')}`
    }

    const placeholderOffset = values.length + 1
    const placeholderLimit = values.length + 2

    const data = await this.dataSource.query(
      `SELECT CODIGO AS "id",
              NOME AS "name",
              BI AS "bi",
              NIF AS "nif",
              TELEFONE AS "phone",
              TELEFONE_ALTERNATIVO AS "alternativePhone",
              PROVINCIA AS "province",
              MUNICIPIO AS "municipality",
              MORADA AS "address",
              EMAIL AS "email",
              PRECISA_MUDAR_SENHA AS "mustChangePassword",
              ESTADO AS "status",
              CRIADO_EM AS "createdAt"
         FROM GP_USUARIOS
        ${whereClause}
        ORDER BY CODIGO DESC
       OFFSET :${placeholderOffset} ROWS FETCH NEXT :${placeholderLimit} ROWS ONLY`,
      [...values, query.offset, query.limit],
    )

    const totalResult = await this.dataSource.query(
      `SELECT COUNT(*) AS TOTAL FROM GP_USUARIOS ${whereClause}`,
      values,
    )

    const total = Number(totalResult[0]?.TOTAL ?? 0)

    return {
      data,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    }
  }

  async findOne(id: number) {
    const result = await this.dataSource.query(
      `SELECT CODIGO AS "id",
              NOME AS "name",
              BI AS "bi",
              NIF AS "nif",
              TELEFONE AS "phone",
              TELEFONE_ALTERNATIVO AS "alternativePhone",
              PROVINCIA AS "province",
              MUNICIPIO AS "municipality",
              MORADA AS "address",
              EMAIL AS "email",
              PRECISA_MUDAR_SENHA AS "mustChangePassword",
              ESTADO AS "status",
              CRIADO_EM AS "createdAt"
         FROM GP_USUARIOS
        WHERE CODIGO = :1`,
      [id],
    )

    if (!result || result.length === 0) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`)
    }

    return result[0]
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id)

    const fields: string[] = []
    const values: any[] = []

    if (updateUserDto.name) {
      fields.push(`NOME = :${values.length + 1}`)
      values.push(updateUserDto.name)
    }
    if (updateUserDto.bi) {
      fields.push(`BI = :${values.length + 1}`)
      values.push(updateUserDto.bi)
    }
    if (updateUserDto.nif !== undefined) {
      fields.push(`NIF = :${values.length + 1}`)
      values.push(updateUserDto.nif)
    }
    if (updateUserDto.phone) {
      fields.push(`TELEFONE = :${values.length + 1}`)
      values.push(updateUserDto.phone)
    }
    if (updateUserDto.alternativePhone !== undefined) {
      fields.push(`TELEFONE_ALTERNATIVO = :${values.length + 1}`)
      values.push(updateUserDto.alternativePhone)
    }
    if (updateUserDto.province) {
      fields.push(`PROVINCIA = :${values.length + 1}`)
      values.push(updateUserDto.province)
    }
    if (updateUserDto.municipality) {
      fields.push(`MUNICIPIO = :${values.length + 1}`)
      values.push(updateUserDto.municipality)
    }
    if (updateUserDto.address) {
      fields.push(`MORADA = :${values.length + 1}`)
      values.push(updateUserDto.address)
    }
    if (updateUserDto.email) {
      fields.push(`EMAIL = :${values.length + 1}`)
      values.push(updateUserDto.email)
    }
    if (updateUserDto.status !== undefined) {
      fields.push(`ESTADO = :${values.length + 1}`)
      values.push(updateUserDto.status)
    }

    if (updateUserDto.password) {
      const passwordHash = await this.getHash(updateUserDto.password)
      fields.push(`SENHA = :${values.length + 1}`)
      values.push(passwordHash)
      fields.push(`PRECISA_MUDAR_SENHA = :${values.length + 1}`)
      values.push(0)
    }

    if (fields.length === 0) {
      return user
    }

    values.push(id)
    const idPlaceholder = values.length

    try {
      await this.dataSource.query(
        `UPDATE GP_USUARIOS SET ${fields.join(', ')} WHERE CODIGO = :${idPlaceholder}`,
        values,
      )
      return this.findOne(id)
    } catch (error) {
      this.handleDatabaseError(error, 'atualizar')
    }
  }

  private handleDatabaseError(error: any, action: string) {
    if (error.code === 'ORA-00001') {
      const message = error.message || ''
      if (message.includes('UK_GP_USU_BI')) {
        throw new BadRequestException('Já existe um usuário com este BI.')
      }
      if (message.includes('UK_GP_USU_NIF')) {
        throw new BadRequestException('Já existe um usuário com este NIF.')
      }
      if (message.includes('UK_GP_USU_EMAIL')) {
        throw new BadRequestException('Já existe um usuário com este E-mail.')
      }
      throw new BadRequestException(`Erro de duplicidade ao ${action} usuário.`)
    }
    console.error(`Error to ${action} user:`, error)
    throw new InternalServerErrorException(`Erro ao ${action} usuário.`)
  }
  private async createPerson(
    queryRunner: QueryRunner,
    createUserDto: CreateUserDto,
  ): Promise<PersonEntity> {
    const person = queryRunner.manager.create(PersonEntity, {
      name: createUserDto.name,
      identityDocument: createUserDto.bi ?? null,
      taxIdentificationNumber: createUserDto.nif ?? null,
      phone: createUserDto.phone ?? null,
      alternativePhone: createUserDto.alternativePhone ?? null,
      status: createUserDto.status ?? 1,
    })

    return queryRunner.manager.save(PersonEntity, person)
  }
  private splitName(fullName: string): {
    firstName: string
    lastName: string
  } {
    const parts = fullName.trim().split(/\s+/).filter(Boolean)

    if (parts.length === 0) {
      return {
        firstName: '',
        lastName: '',
      }
    }

    if (parts.length === 1) {
      return {
        firstName: parts[0],
        lastName: '',
      }
    }

    return {
      firstName: parts[0],
      lastName: parts.slice(1).join(' '),
    }
  }
  private async checkBI(bi: string): Promise<boolean> {
    return this.dataSource
      .getRepository(PersonEntity)
      .findOne({ where: { identityDocument: bi } })
      .then((person) => !!person)
  }

  private async checkNIF(nif: string): Promise<boolean> {
    return this.dataSource
      .getRepository(PersonEntity)
      .findOne({ where: { taxIdentificationNumber: nif } })
      .then((person) => !!person)
  }
  private async checkPhoneNumber(phone: string): Promise<boolean> {
    return this.dataSource
      .getRepository(PersonEntity)
      .findOne({ where: { phone } })
      .then((person) => !!person)
  }
}
