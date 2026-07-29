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
import { PaginationQueryDto } from '../../commons/dto/pagination.dto';
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
          NOME, BI, NIF, TELEFONE, TELEFONE_ALTERNATIVO,
          PROVINCIA, MUNICIPIO, MORADA, EMAIL,
          BANCO, IBAN, TITULAR_CONTA, MOEDA, ESTADO
        ) VALUES (:1, :2, :3, :4, :5, :6, :7, :8, :9, :10, :11, :12, :13, :14)`,
        [
          createPersonDto.name,
          createPersonDto.bi,
          createPersonDto.nif,
          createPersonDto.phone,
          createPersonDto.alternativePhone,
          createPersonDto.province,
          createPersonDto.municipality,
          createPersonDto.address,
          createPersonDto.email,
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

    if (query.bi) {
      whereClause = 'WHERE BI = :1';
      values.push(query.bi);
    }

    const placeholderOffset = values.length + 1;
    const placeholderLimit = values.length + 2;

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
                     BANCO AS "bank",
                     IBAN AS "iban",
                     TITULAR_CONTA AS "accountHolder",
                     MOEDA AS "currency",
                     ESTADO AS "status",
                     CRIADO_EM AS "createdAt"
                FROM GP_COLABORADORES
               ${whereClause}
               ORDER BY CODIGO DESC
              OFFSET :${placeholderOffset} ROWS FETCH NEXT :${placeholderLimit} ROWS ONLY`,
      [...values, query.offset, query.limit],
    );

    const totalResult = await this.dataSource.query(
      `SELECT COUNT(*) AS TOTAL FROM GP_COLABORADORES ${whereClause}`,
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
            BANCO AS "bank",
            IBAN AS "iban",
            TITULAR_CONTA AS "accountHolder",
            MOEDA AS "currency",
            ESTADO AS "status",
            CRIADO_EM AS "createdAt"
       FROM GP_COLABORADORES
      WHERE CODIGO = :1`,
      [id],
    );

    const employee = result[0] ?? null;

    if (employee) {
      employee.files = await this.findFilesByEmployee(id);
    }

    return employee;
  }

  async findFilesByEmployee(employeeId: number) {
    return this.dataSource.query(
      `SELECT CODIGO AS "id",
              TIPO AS "type",
              NOME_ORIGINAL AS "originalName",
              CAMINHO AS "path",
              DESCRICAO AS "description",
              ESTADO AS "status",
              CRIADO_EM AS "createdAt"
         FROM GP_ARQUIVOS
        WHERE CODIGO_COLABORADOR = :1
          AND ESTADO = 1`,
      [employeeId],
    );
  }

  async addFile(createFileDto: CreateFileDto) {
    try {
      await this.dataSource.query(
        `INSERT INTO GP_ARQUIVOS (
          CODIGO_COLABORADOR, TIPO, NOME_ORIGINAL, CAMINHO, DESCRICAO
        ) VALUES (:1, :2, :3, :4, :5)`,
        [
          createFileDto.employeeId,
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

    const fields: string[] = [];
    const values: (string | number | null)[] = [];
    let placeholderIndex = 1;

    const mapping = {
      name: 'NOME',
      bi: 'BI',
      nif: 'NIF',
      phone: 'TELEFONE',
      alternativePhone: 'TELEFONE_ALTERNATIVO',
      province: 'PROVINCIA',
      municipality: 'MUNICIPIO',
      address: 'MORADA',
      email: 'EMAIL',
      bank: 'BANCO',
      iban: 'IBAN',
      accountHolder: 'TITULAR_CONTA',
      currency: 'MOEDA',
      status: 'ESTADO',
    };

    for (const [key, column] of Object.entries(mapping)) {
      if (updatePersonDto[key] !== undefined) {
        fields.push(`${column} = :${placeholderIndex++}`);
        values.push(updatePersonDto[key]);
      }
    }

    if (fields.length === 0) {
      return person;
    }

    values.push(id);

    const query = `
      UPDATE GP_COLABORADORES
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

  private handleDatabaseError(error: any, action: string) {
    if (error?.message?.includes('UK_GP_COLAB_BI')) {
      throw new BadRequestException(
        'Já existe um colaborador cadastrado com este BI',
      );
    }

    if (error?.message?.includes('UK_GP_COLAB_NIF')) {
      throw new BadRequestException(
        'Já existe um colaborador cadastrado com este NIF',
      );
    }

    if (error?.message?.includes('UK_GP_COLAB_EMAIL')) {
      throw new BadRequestException(
        'Já existe um colaborador cadastrado com este Email',
      );
    }

    throw new InternalServerErrorException(`Erro ao ${action} colaborador`);
  }
}