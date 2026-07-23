import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeQueryDto } from './dto/employee-query.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateFileDto } from './dto/file/create-file.dto';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async create(createPersonDto: CreateEmployeeDto) {
    try {
      await this.dataSource.query(
        `INSERT INTO GP_COLABORADORES (
          CODIGO_USUARIO, BANCO, IBAN, TITULAR_CONTA, MOEDA, ESTADO
        ) VALUES (:1, :2, :3, :4, :5, :6)`,
        [
          createPersonDto.userId,
          createPersonDto.bank,
          createPersonDto.iban,
          createPersonDto.accountHolder,
          createPersonDto.currency,
          createPersonDto.status ?? 1,
        ],
      );
    } catch (error) {
      this.handleDatabaseError(error, 'cadastrar');
    }
  }

  async findAll(query: EmployeeQueryDto) {
    const values: any[] = [];
    let whereClause = '';

    const conditions: string[] = [];
    if (query.bi) {
      conditions.push(`U.BI = :${values.length + 1}`);
      values.push(query.bi);
    }
    if (query.name) {
      conditions.push(`UPPER(U.NOME) LIKE :${values.length + 1}`);
      values.push(`%${query.name.toUpperCase()}%`);
    }
    if (query.email) {
      conditions.push(`U.EMAIL = :${values.length + 1}`);
      values.push(query.email);
    }

    if (conditions.length > 0) {
      whereClause = `WHERE ${conditions.join(' AND ')}`;
    }

    const placeholderOffset = values.length + 1;
    const placeholderLimit = values.length + 2;

    const data = await this.dataSource.query(
      `SELECT C.CODIGO AS "id",
                     U.NOME AS "name",
                     U.BI AS "bi",
                     U.NIF AS "nif",
                     U.TELEFONE AS "phone",
                     U.TELEFONE_ALTERNATIVO AS "alternativePhone",
                     U.PROVINCIA AS "province",
                     U.MUNICIPIO AS "municipality",
                     U.MORADA AS "address",
                     U.EMAIL AS "email",
                     C.BANCO AS "bank",
                     C.IBAN AS "iban",
                     C.TITULAR_CONTA AS "accountHolder",
                     C.MOEDA AS "currency",
                     C.ESTADO AS "status",
                     C.CRIADO_EM AS "createdAt"
                FROM GP_COLABORADORES C
                JOIN GP_USUARIOS U ON C.CODIGO_USUARIO = U.CODIGO
               ${whereClause}
               ORDER BY C.CODIGO DESC
              OFFSET :${placeholderOffset} ROWS FETCH NEXT :${placeholderLimit} ROWS ONLY`,
      [...values, query.offset, query.limit],
    );

    const totalResult = await this.dataSource.query(
      `SELECT COUNT(*) AS TOTAL 
         FROM GP_COLABORADORES C
         JOIN GP_USUARIOS U ON C.CODIGO_USUARIO = U.CODIGO
        ${whereClause}`,
      values,
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
      `SELECT C.CODIGO AS "id",
            U.NOME AS "name",
            U.BI AS "bi",
            U.NIF AS "nif",
            U.TELEFONE AS "phone",
            U.TELEFONE_ALTERNATIVO AS "alternativePhone",
            U.PROVINCIA AS "province",
            U.MUNICIPIO AS "municipality",
            U.MORADA AS "address",
            U.EMAIL AS "email",
            C.BANCO AS "bank",
            C.IBAN AS "iban",
            C.TITULAR_CONTA AS "accountHolder",
            C.MOEDA AS "currency",
            C.ESTADO AS "status",
            C.CRIADO_EM AS "createdAt",
            C.CODIGO_USUARIO AS "userId"
       FROM GP_COLABORADORES C
       JOIN GP_USUARIOS U ON C.CODIGO_USUARIO = U.CODIGO
      WHERE C.CODIGO = :1`,
      [id],
    );

    const employee = result[0] ?? null;

    if (employee) {
      employee.files = await this.findFilesByEmployee(employee.userId);
    }

    return employee;
  }

  async findFilesByEmployee(userId: number) {
    return this.dataSource.query(
      `SELECT CODIGO AS "id",
              TIPO AS "type",
              NOME_ORIGINAL AS "originalName",
              CAMINHO AS "path",
              DESCRICAO AS "description",
              ESTADO AS "status",
              CRIADO_EM AS "createdAt"
         FROM GP_ARQUIVOS
        WHERE CODIGO_USUARIO = :1
          AND ESTADO = 1`,
      [userId],
    );
  }

  async addFile(createFileDto: CreateFileDto) {
    try {
      await this.dataSource.query(
        `INSERT INTO GP_ARQUIVOS (
          CODIGO_USUARIO, TIPO, NOME_ORIGINAL, CAMINHO, DESCRICAO
        ) VALUES (:1, :2, :3, :4, :5)`,
        [
          createFileDto.userId,
          createFileDto.type,
          createFileDto.originalName,
          createFileDto.path,
          createFileDto.description,
        ],
      );
    } catch (error) {
      throw new InternalServerErrorException('Erro ao salvar arquivo');
    }
  }

  async removeFile(id: number) {
    await this.dataSource.query(
      `UPDATE GP_ARQUIVOS SET ESTADO = 0 WHERE CODIGO = :1`,
      [id],
    );
  }

  async update(id: number, updatePersonDto: UpdateEmployeeDto) {
    const person = await this.findOne(id);

    if (!person) {
      throw new BadRequestException('colaborador não encontrado');
    }

    const collabFields: string[] = [];
    const collabValues: any[] = [];

    const collabMapping = {
      bank: 'BANCO',
      iban: 'IBAN',
      accountHolder: 'TITULAR_CONTA',
      currency: 'MOEDA',
      status: 'ESTADO',
      userId: 'CODIGO_USUARIO',
    };

    for (const [key, column] of Object.entries(collabMapping)) {
      if (updatePersonDto[key] !== undefined) {
        collabFields.push(`${column} = :${collabValues.length + 1}`);
        collabValues.push(updatePersonDto[key]);
      }
    }

    try {
      if (collabFields.length > 0) {
        collabValues.push(id);
        await this.dataSource.query(
          `UPDATE GP_COLABORADORES SET ${collabFields.join(', ')} WHERE CODIGO = :${collabValues.length}`,
          collabValues,
        );
      }

      return this.findOne(id);
    } catch (error) {
      this.handleDatabaseError(error, 'atualizar');
    }
  }

  private handleDatabaseError(error: any, action: string) {
    console.error(`Error to ${action} employee:`, error);
    throw new InternalServerErrorException(`Erro ao ${action} colaborador`);
  }
}