import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'
import { CreateEquipmentDto } from './dto/equipment/create-equipment.dto'
import { UpdateEquipmentDto } from './dto/equipment/update-equipment.dto'
import { CreateBiometricIntegrationDto } from './dto/integration/create-biometric-integration.dto'
import { PaginationQueryDto } from '../../common/dto/pagination.dto'

@Injectable()
export class BiometricService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  // --- Equipamentos ---

  async createEquipment(dto: CreateEquipmentDto) {
    try {
      await this.dataSource.query(
        `INSERT INTO GP_EQUIPAMENTOS (
          NOME, LOCALIZACAO, MODELO, ESTADO
        ) VALUES (:1, :2, :3, :4)`,
        [dto.name, dto.location, dto.model, dto.status ?? 1],
      )
    } catch (error) {
      throw new InternalServerErrorException('Erro ao cadastrar equipamento')
    }
  }

  async findAllEquipments(query: PaginationQueryDto) {
    const data = await this.dataSource.query(
      `SELECT CODIGO AS "id",
              NOME AS "name",
              LOCALIZACAO AS "location",
              MODELO AS "model",
              ESTADO AS "status",
              CRIADO_EM AS "createdAt"
         FROM GP_EQUIPAMENTOS
        ORDER BY CODIGO DESC
       OFFSET :1 ROWS FETCH NEXT :2 ROWS ONLY`,
      [query.offset, query.limit],
    )

    const totalResult = await this.dataSource.query(
      `SELECT COUNT(*) AS TOTAL FROM GP_EQUIPAMENTOS`,
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

  async findOneEquipment(id: number) {
    const result = await this.dataSource.query(
      `SELECT CODIGO AS "id",
              NOME AS "name",
              LOCALIZACAO AS "location",
              MODELO AS "model",
              ESTADO AS "status",
              CRIADO_EM AS "createdAt"
         FROM GP_EQUIPAMENTOS
        WHERE CODIGO = :1`,
      [id],
    )
    return result[0] ?? null
  }

  async updateEquipment(id: number, dto: UpdateEquipmentDto) {
    const equipment = await this.findOneEquipment(id)
    if (!equipment) {
      throw new BadRequestException('Equipamento não encontrado')
    }

    const fields: string[] = []
    const values: any[] = []
    let placeholderIndex = 1

    const mapping = {
      name: 'NOME',
      location: 'LOCALIZACAO',
      model: 'MODELO',
      status: 'ESTADO',
    }

    for (const [key, column] of Object.entries(mapping)) {
      if (dto[key] !== undefined) {
        fields.push(`${column} = :${placeholderIndex++}`)
        values.push(dto[key])
      }
    }

    if (fields.length === 0) return equipment

    values.push(id)
    const query = `UPDATE GP_EQUIPAMENTOS SET ${fields.join(', ')} WHERE CODIGO = :${placeholderIndex}`

    try {
      await this.dataSource.query(query, values)
      return this.findOneEquipment(id)
    } catch (error) {
      throw new InternalServerErrorException('Erro ao atualizar equipamento')
    }
  }

  // --- Integrações Biométricas ---

  async createIntegration(dto: CreateBiometricIntegrationDto) {
    try {
      await this.dataSource.query(
        `INSERT INTO GP_INTEGRACOES_BIOMETRICAS (
          CODIGO_COLABORADOR, CODIGO_EQUIPAMENTO, EVENTO, ESTADO
        ) VALUES (:1, :2, :3, :4)`,
        [dto.employeeId, dto.equipmentId, dto.event, dto.status ?? 1],
      )
    } catch (error) {
      throw new InternalServerErrorException(
        'Erro ao registrar integração biométrica',
      )
    }
  }

  async findAllIntegrations(query: PaginationQueryDto) {
    const data = await this.dataSource.query(
      `SELECT I.CODIGO AS "id",
              I.CODIGO_COLABORADOR AS "employeeId",
              C.NOME AS "employeeName",
              I.CODIGO_EQUIPAMENTO AS "equipmentId",
              E.NOME AS "equipmentName",
              I.EVENTO AS "event",
              I.ESTADO AS "status",
              I.CRIADO_EM AS "createdAt"
         FROM GP_INTEGRACOES_BIOMETRICAS I
         JOIN GP_COLABORADORES C ON I.CODIGO_COLABORADOR = C.CODIGO
         JOIN GP_EQUIPAMENTOS E ON I.CODIGO_EQUIPAMENTO = E.CODIGO
        ORDER BY I.CODIGO DESC
       OFFSET :1 ROWS FETCH NEXT :2 ROWS ONLY`,
      [query.offset, query.limit],
    )

    const totalResult = await this.dataSource.query(
      `SELECT COUNT(*) AS TOTAL FROM GP_INTEGRACOES_BIOMETRICAS`,
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

  async findIntegrationsByEmployee(employeeId: number) {
    return this.dataSource.query(
      `SELECT I.CODIGO AS "id",
              I.CODIGO_EQUIPAMENTO AS "equipmentId",
              E.NOME AS "equipmentName",
              I.EVENTO AS "event",
              I.ESTADO AS "status",
              I.CRIADO_EM AS "createdAt"
         FROM GP_INTEGRACOES_BIOMETRICAS I
         JOIN GP_EQUIPAMENTOS E ON I.CODIGO_EQUIPAMENTO = E.CODIGO
        WHERE I.CODIGO_COLABORADOR = :1
        ORDER BY I.CODIGO DESC`,
      [employeeId],
    )
  }
}
