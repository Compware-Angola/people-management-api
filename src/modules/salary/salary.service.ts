import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsWhere, Raw, Repository } from 'typeorm'

import { Salary } from './entities/salary.entity'
import {
  CreateSalaryDto,
  SalaryQueryDto,
  UpdateSalaryDto,
} from './dto/salary.dto'
import {
  SalaryEmployee,
  SalaryEmployeeStatus,
} from './entities/salary-employee.entity'
import { CreateSalaryEmployeeDto } from './dto/salary-employee.dto'
import { Rubric } from './entities/rubric.entity'
import { CreateRubricDto } from './dto/rubric.dto'
import { SalaryRubric } from './entities/salary-rubric.entity'
import { CreateSalaryRubricDto } from './dto/salary-rubric.dto'
import { Employee } from '../employee/entities/employee.entity'

@Injectable()
export class SalaryService {
  constructor(
    @InjectRepository(Salary)
    private readonly salaryRepository: Repository<Salary>,

    @InjectRepository(SalaryEmployee)
    private readonly salaryEmployeeRepository: Repository<SalaryEmployee>,

    @InjectRepository(Rubric)
    private readonly rubricRepository: Repository<Rubric>,

    @InjectRepository(SalaryRubric)
    private readonly salaryRubricRepository: Repository<SalaryRubric>,

    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  private async getActiveEmployeeIdByUserId(userId: number): Promise<number> {
    const employee = await this.employeeRepository.findOne({
      where: { userId, status: 1 },
    })

    if (!employee) {
      throw new BadRequestException(
        'Usuário autenticado não está associado a um colaborador ativo',
      )
    }

    return employee.id
  }

  async findAll(query: SalaryQueryDto) {
    const page = query.page ?? 1
    const limit = query.limit ?? 10
    const skip = (page - 1) * limit

    const where: FindOptionsWhere<Salary> = {}

    if (query.id) where.id = query.id
    if (query.category) {
      where.category = Raw((alias) => `UPPER(${alias}) LIKE UPPER(:value)`, {
        value: `%${query.category}%`,
      })
    }
    if (query.position) {
      where.position = Raw((alias) => `UPPER(${alias}) LIKE UPPER(:value)`, {
        value: `%${query.position}%`,
      })
    }

    const [data, total] = await this.salaryRepository.findAndCount({
      where,
      order: { id: 'DESC' },
      skip,
      take: limit,
    })

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async create(createSalaryDto: CreateSalaryDto): Promise<Salary> {
    const salary = this.salaryRepository.create(createSalaryDto)
    return this.salaryRepository.save(salary)
  }

  async update(id: number, updateSalaryDto: UpdateSalaryDto): Promise<Salary> {
    const salary = await this.salaryRepository.findOne({ where: { id } })

    if (!salary) {
      throw new NotFoundException(
        `Estrutura salarial com ID ${id} não encontrada`,
      )
    }

    this.salaryRepository.merge(salary, updateSalaryDto)
    return await this.salaryRepository.save(salary)
  }

  async saveSalaryToEmployee(
    createSalaryEmployeeDto: CreateSalaryEmployeeDto,
    createdByUserId: number,
  ): Promise<SalaryEmployee> {
    const { salaryId, employeeId } = createSalaryEmployeeDto
    const createdByEmployeeId =
      await this.getActiveEmployeeIdByUserId(createdByUserId)

    const salaryStructure = await this.salaryRepository.findOne({
      where: { id: salaryId },
    })

    if (!salaryStructure) {
      throw new NotFoundException(
        `Estrutura salarial com ID ${salaryId} não encontrada`,
      )
    }

    if (salaryStructure.status !== 1) {
      throw new BadRequestException('A estrutura salarial não está ativa')
    }

    const activeAssignment = await this.salaryEmployeeRepository.findOne({
      where: { employeeId, status: SalaryEmployeeStatus.ACTIVE },
    })

    if (activeAssignment && activeAssignment.salaryId === salaryId) {
      throw new BadRequestException(
        'O colaborador já possui essa estrutura salarial ativa',
      )
    }

    if (activeAssignment) {
      await this.salaryEmployeeRepository.update(
        { salaryId: activeAssignment.salaryId, employeeId },
        { status: SalaryEmployeeStatus.INACTIVE, endDate: new Date() },
      )
    }

    const existingAssignment = await this.salaryEmployeeRepository.findOneBy({
      salaryId,
      employeeId,
    })

    if (existingAssignment) {
      await this.salaryEmployeeRepository.update(
        { salaryId, employeeId },
        {
          createdByEmployeeId,
          status: SalaryEmployeeStatus.ACTIVE,
          startDate: new Date(),
          endDate: null,
        },
      )
      return (await this.salaryEmployeeRepository.findOneBy({
        salaryId,
        employeeId,
      }))!
    }

    const salaryEmployee = this.salaryEmployeeRepository.create({
      salaryId,
      employeeId,
      createdByEmployeeId,
      status: SalaryEmployeeStatus.ACTIVE,
      startDate: new Date(),
    })
    return this.salaryEmployeeRepository.save(salaryEmployee)
  }

  async findSalaryEmployeeByEmployeeId(
    employeeId: number,
  ): Promise<SalaryEmployee> {
    const salaryEmployee = await this.salaryEmployeeRepository.findOne({
      where: { employeeId, status: SalaryEmployeeStatus.ACTIVE },
      relations: { salaryStructure: true },
    })

    if (!salaryEmployee) {
      throw new NotFoundException(
        `Estrutura salarial ativa do colaborador ${employeeId} não encontrada`,
      )
    }

    return salaryEmployee
  }

  async findSalaryEmployeeHistory(
    employeeId: number,
  ): Promise<SalaryEmployee[]> {
    return this.salaryEmployeeRepository.find({
      where: { employeeId },
      relations: { salaryStructure: true },
      order: { startDate: 'DESC' },
    })
  }

  async createRubric(createRubricDto: CreateRubricDto): Promise<Rubric> {
    const rubric = this.rubricRepository.create(createRubricDto)
    return this.rubricRepository.save(rubric)
  }

  async associateRubricToStructure(
    createSalaryRubricDto: CreateSalaryRubricDto,
    createdByUserId: number,
  ): Promise<SalaryRubric> {
    const { salaryStructureCode, rubricCode } = createSalaryRubricDto
    const createdByEmployeeCode =
      await this.getActiveEmployeeIdByUserId(createdByUserId)

    const salaryStructure = await this.salaryRepository.findOne({
      where: { id: salaryStructureCode },
    })

    if (!salaryStructure) {
      throw new NotFoundException(
        `Estrutura salarial com ID ${salaryStructureCode} não encontrada`,
      )
    }

    if (salaryStructure.status !== 1) {
      throw new BadRequestException('A estrutura salarial não está ativa')
    }

    const rubric = await this.rubricRepository.findOne({
      where: { code: rubricCode },
    })

    if (!rubric) {
      throw new NotFoundException(`Rubrica com ID ${rubricCode} não encontrada`)
    }

    if (rubric.status !== 1) {
      throw new BadRequestException('A rubrica não está ativa')
    }

    const salaryRubric = this.salaryRubricRepository.create({
      salaryStructureCode,
      rubricCode,
      createdByEmployeeCode,
    })
    return this.salaryRubricRepository.save(salaryRubric)
  }

  async findSalaryStructureWithRubrics(id: number) {
    const salaryStructure = await this.salaryRepository.findOne({
      where: { id },
    })

    if (!salaryStructure) {
      throw new NotFoundException(
        `Estrutura salarial com ID ${id} não encontrada`,
      )
    }

    const salaryRubrics = await this.salaryRubricRepository.find({
      where: { salaryStructureCode: id },
      relations: { rubric: true },
    })

    return {
      ...salaryStructure,
      rubrics: salaryRubrics.map((salaryRubric) => salaryRubric.rubric),
    }
  }
}
