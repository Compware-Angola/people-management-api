import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { PaginationQueryDto } from '../../commons/dto/pagination.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async create(createAttendanceDto: CreateAttendanceDto) {
    try {
      await this.dataSource.query(
        `INSERT INTO GP_ASSIDUIDADES (
          CODIGO_COLABORADOR, DATA_INICIO, DATA_FIM, HORAS, SITUACAO
        ) VALUES (:1, TO_DATE(:2, 'YYYY-MM-DD"T"HH24:MI:SS"Z"'), :3, :4, :5)`,
        [
          createAttendanceDto.employeeId,
          createAttendanceDto.startDate,
          createAttendanceDto.endDate ? new Date(createAttendanceDto.endDate) : null,
          createAttendanceDto.hours ?? null,
          createAttendanceDto.situation,
        ],
      );
    } catch (error) {
      this.handleDatabaseError(error, 'cadastrar');
    }
  }

  async findAll(query: PaginationQueryDto) {
    const data = await this.dataSource.query(
      `SELECT CODIGO AS "id",
              CODIGO_COLABORADOR AS "employeeId",
              DATA_INICIO AS "startDate",
              DATA_FIM AS "endDate",
              HORAS AS "hours",
              SITUACAO AS "situation",
              CRIADO_EM AS "createdAt"
         FROM GP_ASSIDUIDADES
        ORDER BY CODIGO DESC
       OFFSET :1 ROWS FETCH NEXT :2 ROWS ONLY`,
      [query.offset, query.limit],
    );

    const totalResult = await this.dataSource.query(
      `SELECT COUNT(*) AS TOTAL FROM GP_ASSIDUIDADES`,
    );

    const total = Number(totalResult[0]?.TOTAL ?? 0);

    return {
      data,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async findOne(id: number) {
    const result = await this.dataSource.query(
      `SELECT CODIGO AS "id",
              CODIGO_COLABORADOR AS "employeeId",
              DATA_INICIO AS "startDate",
              DATA_FIM AS "endDate",
              HORAS AS "hours",
              SITUACAO AS "situation",
              CRIADO_EM AS "createdAt"
         FROM GP_ASSIDUIDADES
        WHERE CODIGO = :1`,
      [id],
    );

    return result[0] ?? null;
  }

  async findByEmployee(employeeId: number, query: PaginationQueryDto) {
    const data = await this.dataSource.query(
      `SELECT CODIGO AS "id",
              CODIGO_COLABORADOR AS "employeeId",
              DATA_INICIO AS "startDate",
              DATA_FIM AS "endDate",
              HORAS AS "hours",
              SITUACAO AS "situation",
              CRIADO_EM AS "createdAt"
         FROM GP_ASSIDUIDADES
        WHERE CODIGO_COLABORADOR = :1
        ORDER BY DATA_INICIO DESC
       OFFSET :2 ROWS FETCH NEXT :3 ROWS ONLY`,
      [employeeId, query.offset, query.limit],
    );

    const totalResult = await this.dataSource.query(
      `SELECT COUNT(*) AS TOTAL FROM GP_ASSIDUIDADES WHERE CODIGO_COLABORADOR = :1`,
      [employeeId],
    );

    const total = Number(totalResult[0]?.TOTAL ?? 0);

    return {
      data,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async update(id: number, updateAttendanceDto: UpdateAttendanceDto) {
    const attendance = await this.findOne(id);

    if (!attendance) {
      throw new BadRequestException('Assiduidade não encontrada');
    }

    const fields: string[] = [];
    const values: any[] = [];
    let placeholderIndex = 1;

    const mapping = {
      employeeId: 'CODIGO_COLABORADOR',
      startDate: 'DATA_INICIO',
      endDate: 'DATA_FIM',
      hours: 'HORAS',
      situation: 'SITUACAO',
    };

    for (const [key, column] of Object.entries(mapping)) {
      if (updateAttendanceDto[key] !== undefined) {
        if (key === 'startDate' || key === 'endDate') {
          fields.push(`${column} = TO_DATE(:${placeholderIndex++}, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')`);
          values.push(updateAttendanceDto[key]);
        } else {
          fields.push(`${column} = :${placeholderIndex++}`);
          values.push(updateAttendanceDto[key]);
        }
      }
    }

    if (fields.length === 0) {
      return attendance;
    }

    values.push(id);

    const query = `
      UPDATE GP_ASSIDUIDADES
      SET ${fields.join(', ')}
      WHERE CODIGO = :${placeholderIndex}
    `;

    try {
      await this.dataSource.query(query, values);
      return this.findOne(id);
    } catch (error) {
      this.handleDatabaseError(error, 'atualizar');
    }
  }

  async remove(id: number) {
    await this.dataSource.query(
      `DELETE FROM GP_ASSIDUIDADES WHERE CODIGO = :1`,
      [id],
    );
  }

  private handleDatabaseError(error: any, action: string) {
    if (error?.message?.includes('FK_GP_ASSIDUIDADES_COLAB')) {
      throw new BadRequestException('Colaborador informado não existe');
    }

    if (error?.message?.includes('CK_GP_ASSIDUIDADES_SIT')) {
      throw new BadRequestException('Situação informada é inválida');
    }

    throw new InternalServerErrorException(`Erro ao ${action} assiduidade`);
  }
}
