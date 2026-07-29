import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'
import { CreateVacationDto } from './dto/create-vacation.dto'
import { UpdateVacationDto } from './dto/update-vacation.dto'
import { VacationQueryDto } from './dto/vacation-query.dto'

@Injectable()
export class VacationService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateVacationDto) {
    try {
      await this.dataSource.query(
        `INSERT INTO GP_FERIAS (
          CODIGO_COLABORADOR, DATA_INICIO, DATA_FIM, DIAS,
          OBSERVACAO, CODIGO_GESTOR_APROVADOR, CODIGO_RH_APROVADOR, ESTADO
        ) VALUES (:1, TO_DATE(:2, 'YYYY-MM-DD'), TO_DATE(:3, 'YYYY-MM-DD'), :4, :5, :6, :7, :8)`,
        [
          dto.employeeId,
          dto.startDate,
          dto.endDate,
          dto.days,
          dto.observation,
          dto.approverManagerId,
          dto.approverRhId,
          dto.status ?? 'PENDENTE',
        ],
      )
    } catch (error) {
      throw new InternalServerErrorException('Erro ao cadastrar férias')
    }
  }

  async findAll(query: VacationQueryDto) {
    const values: any[] = []
    const conditions: string[] = []

    if (query.employeeId) {
      conditions.push(`V.CODIGO_COLABORADOR = :${values.length + 1}`)
      values.push(query.employeeId)
    }

    if (query.status) {
      conditions.push(`V.ESTADO = :${values.length + 1}`)
      values.push(query.status)
    }

    if (query.approverManagerId) {
      conditions.push(`V.CODIGO_GESTOR_APROVADOR = :${values.length + 1}`)
      values.push(query.approverManagerId)
    }

    if (query.approverRhId) {
      conditions.push(`V.CODIGO_RH_APROVADOR = :${values.length + 1}`)
      values.push(query.approverRhId)
    }

    if (query.startDate) {
      conditions.push(
        `V.DATA_INICIO >= TO_DATE(:${values.length + 1}, 'YYYY-MM-DD')`,
      )
      values.push(query.startDate)
    }

    if (query.endDate) {
      conditions.push(
        `V.DATA_FIM <= TO_DATE(:${values.length + 1}, 'YYYY-MM-DD')`,
      )
      values.push(query.endDate)
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const placeholderOffset = values.length + 1
    const placeholderLimit = values.length + 2

    const data = await this.dataSource.query(
      `SELECT V.CODIGO AS "id",
              V.CODIGO_COLABORADOR AS "employeeId",
              C.NOME AS "employeeName",
              V.DATA_INICIO AS "startDate",
              V.DATA_FIM AS "endDate",
              V.DIAS AS "days",
              V.OBSERVACAO AS "observation",
              V.CODIGO_GESTOR_APROVADOR AS "approverManagerId",
              GM.NOME AS "approverManagerName",
              V.CODIGO_RH_APROVADOR AS "approverRhId",
              RH.NOME AS "approverRhName",
              V.ESTADO AS "status",
              V.CRIADO_EM AS "createdAt"
         FROM GP_FERIAS V
         JOIN GP_COLABORADORES C ON V.CODIGO_COLABORADOR = C.CODIGO
         LEFT JOIN GP_COLABORADORES GM ON V.CODIGO_GESTOR_APROVADOR = GM.CODIGO
         LEFT JOIN GP_COLABORADORES RH ON V.CODIGO_RH_APROVADOR = RH.CODIGO
        ${whereClause}
        ORDER BY V.CODIGO DESC
       OFFSET :${placeholderOffset} ROWS FETCH NEXT :${placeholderLimit} ROWS ONLY`,
      [...values, query.offset, query.limit],
    )

    const totalResult = await this.dataSource.query(
      `SELECT COUNT(*) AS TOTAL FROM GP_FERIAS V ${whereClause}`,
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
      `SELECT V.CODIGO AS "id",
              V.CODIGO_COLABORADOR AS "employeeId",
              C.NOME AS "employeeName",
              V.DATA_INICIO AS "startDate",
              V.DATA_FIM AS "endDate",
              V.DIAS AS "days",
              V.OBSERVACAO AS "observation",
              V.CODIGO_GESTOR_APROVADOR AS "approverManagerId",
              GM.NOME AS "approverManagerName",
              V.CODIGO_RH_APROVADOR AS "approverRhId",
              RH.NOME AS "approverRhName",
              V.ESTADO AS "status",
              V.CRIADO_EM AS "createdAt"
         FROM GP_FERIAS V
         JOIN GP_COLABORADORES C ON V.CODIGO_COLABORADOR = C.CODIGO
         LEFT JOIN GP_COLABORADORES GM ON V.CODIGO_GESTOR_APROVADOR = GM.CODIGO
         LEFT JOIN GP_COLABORADORES RH ON V.CODIGO_RH_APROVADOR = RH.CODIGO
        WHERE V.CODIGO = :1`,
      [id],
    )
    return result[0] ?? null
  }

  async update(id: number, dto: UpdateVacationDto) {
    const vacation = await this.findOne(id)
    if (!vacation) {
      throw new BadRequestException('Registro de férias não encontrado')
    }

    const fields: string[] = []
    const values: any[] = []
    let placeholderIndex = 1

    const mapping = {
      employeeId: 'CODIGO_COLABORADOR',
      startDate: 'DATA_INICIO',
      endDate: 'DATA_FIM',
      days: 'DIAS',
      observation: 'OBSERVACAO',
      approverManagerId: 'CODIGO_GESTOR_APROVADOR',
      approverRhId: 'CODIGO_RH_APROVADOR',
      status: 'ESTADO',
    }

    for (const [key, column] of Object.entries(mapping)) {
      if (dto[key] !== undefined) {
        if (key === 'startDate' || key === 'endDate') {
          fields.push(
            `${column} = TO_DATE(:${placeholderIndex++}, 'YYYY-MM-DD')`,
          )
        } else {
          fields.push(`${column} = :${placeholderIndex++}`)
        }
        values.push(dto[key])
      }
    }

    if (fields.length === 0) return vacation

    values.push(id)
    const query = `UPDATE GP_FERIAS SET ${fields.join(', ')} WHERE CODIGO = :${placeholderIndex}`

    try {
      await this.dataSource.query(query, values)
      return this.findOne(id)
    } catch (error) {
      throw new InternalServerErrorException('Erro ao atualizar férias')
    }
  }

  async remove(id: number) {
    try {
      await this.dataSource.query('DELETE FROM GP_FERIAS WHERE CODIGO = :1', [
        id,
      ])
    } catch (error) {
      throw new InternalServerErrorException('Erro ao excluir férias')
    }
  }
}
