import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { And, In, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm'

import {
  SalaryProcessing,
  SalaryProcessingStatus,
} from './entities/salary-processing.entity'
import { SalaryProcessingEmployee } from './entities/salary-processing-employee.entity'
import {
  SalaryEmployee,
  SalaryEmployeeStatus,
} from './entities/salary-employee.entity'
import { SalaryRubric } from './entities/salary-rubric.entity'
import { ValueType, RubricType, Rubric } from './entities/rubric.entity'
import {
  CreateSalaryProcessingDto,
  SalaryProcessingQueryDto,
  ValidateSalaryProcessingDto,
} from './dto/salary-processing.dto'
import { Attendance } from '../attendance/entities/attendance.entity'
import { AttendanceSituation } from '../attendance/dto/create-attendance.dto'
import { ContractService } from '../contract/contract.service'
import { ContractType } from '../contract/entities/contract.entity'
import { AcademicService } from '../academic/academic.service'
import { Employee } from '../employee/entities/employee.entity'
import { User } from '../user/entities/user.entity'

const WORKED_HOURS_SITUATIONS = [
  AttendanceSituation.PRESENTE,
  AttendanceSituation.FERIAS,
  AttendanceSituation.LICENCA,
]

const ACADEMIC_RECONCILED_CONTRACT_TYPES = [
  ContractType.HOURLY,
  ContractType.FIXED,
]

const OPEN_STATES = [
  SalaryProcessingStatus.PENDING,
  SalaryProcessingStatus.SIMULATED,
  SalaryProcessingStatus.CLOSED,
]

@Injectable()
export class SalaryProcessingService {
  private readonly logger = new Logger(SalaryProcessingService.name)

  constructor(
    @InjectRepository(SalaryProcessing)
    private readonly processingRepository: Repository<SalaryProcessing>,

    @InjectRepository(SalaryProcessingEmployee)
    private readonly processingEmployeeRepository: Repository<SalaryProcessingEmployee>,

    @InjectRepository(SalaryEmployee)
    private readonly salaryEmployeeRepository: Repository<SalaryEmployee>,

    @InjectRepository(SalaryRubric)
    private readonly salaryRubricRepository: Repository<SalaryRubric>,

    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,

    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,

    private readonly contractService: ContractService,

    private readonly academicService: AcademicService,
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

  async process(
    createDto: CreateSalaryProcessingDto,
    responsibleUserId: number,
  ): Promise<SalaryProcessing> {
    const responsibleEmployeeId =
      await this.getActiveEmployeeIdByUserId(responsibleUserId)

    await this.assertNoOpenProcessingInPeriod(
      createDto.startDate,
      createDto.endDate,
    )

    const processing = this.processingRepository.create({
      startDate: new Date(createDto.startDate),
      endDate: new Date(createDto.endDate),
      responsibleEmployeeId,
      status: SalaryProcessingStatus.PENDING,
    })
    await this.processingRepository.save(processing)

    this.runProcessingInBackground(processing)

    return processing
  }

  async validate(
    id: number,
    validateDto: ValidateSalaryProcessingDto,
    validatorUserId: number,
  ): Promise<SalaryProcessing> {
    const validatorEmployeeId =
      await this.getActiveEmployeeIdByUserId(validatorUserId)

    const processing = await this.processingRepository.findOneBy({ id })

    if (!processing) {
      throw new NotFoundException(`Processamento salarial ${id} não encontrado`)
    }

    if (processing.status !== SalaryProcessingStatus.SIMULATED) {
      throw new BadRequestException(
        'Somente processamentos simulados podem ser validados',
      )
    }

    await this.processingRepository.update(id, {
      status: validateDto.status as string as SalaryProcessingStatus,
      validatorEmployeeId,
      validatedAt: new Date(),
    })

    return (await this.processingRepository.findOneBy({ id }))!
  }

  async reprocess(
    id: number,
    responsibleUserId: number,
  ): Promise<SalaryProcessing> {
    const responsibleEmployeeId =
      await this.getActiveEmployeeIdByUserId(responsibleUserId)

    const original = await this.processingRepository.findOneBy({ id })

    if (!original) {
      throw new NotFoundException(`Processamento salarial ${id} não encontrado`)
    }

    if (original.status !== SalaryProcessingStatus.CLOSED) {
      throw new BadRequestException(
        'Somente processamentos fechados podem ser reprocessados',
      )
    }

    original.status = SalaryProcessingStatus.CANCELLED
    await this.processingRepository.save(original)

    const processing = this.processingRepository.create({
      startDate: original.startDate,
      endDate: original.endDate,
      responsibleEmployeeId,
      originProcessingId: original.id,
      status: SalaryProcessingStatus.PENDING,
    })
    await this.processingRepository.save(processing)

    this.runProcessingInBackground(processing)

    return processing
  }

  async findAll(query: SalaryProcessingQueryDto) {
    const queryBuilder = this.processingRepository
      .createQueryBuilder('processing')
      .leftJoin('processing.responsibleEmployee', 'responsibleEmployee')
      .leftJoin(User, 'responsibleUser', 'responsibleUser.id = responsibleEmployee.userId')
      .leftJoin('processing.validatorEmployee', 'validatorEmployee')
      .leftJoin(User, 'validatorUser', 'validatorUser.id = validatorEmployee.userId')
      .addSelect('responsibleUser.name', 'responsible_employee_name')
      .addSelect('validatorUser.name', 'validator_employee_name')
      .orderBy('processing.id', 'DESC')
      .skip(query.offset)
      .take(query.limit)

    if (query.id) {
      queryBuilder.andWhere('processing.id = :id', { id: query.id })
    }

    if (query.status) {
      queryBuilder.andWhere('processing.status = :status', {
        status: query.status,
      })
    }

    if (query.responsibleEmployeeId) {
      queryBuilder.andWhere(
        'processing.responsibleEmployeeId = :responsibleEmployeeId',
        { responsibleEmployeeId: query.responsibleEmployeeId },
      )
    }

    if (query.startDate) {
      queryBuilder.andWhere('processing.startDate >= :startDate', {
        startDate: new Date(query.startDate),
      })
    }

    if (query.endDate) {
      queryBuilder.andWhere('processing.endDate <= :endDate', {
        endDate: new Date(query.endDate),
      })
    }

    const { entities } = await queryBuilder.getRawAndEntities()
    const total = await queryBuilder.getCount()
    const employeeNames = await this.findEmployeeNamesByIds([
      ...entities.map((processing) => processing.responsibleEmployeeId),
      ...entities
        .map((processing) => processing.validatorEmployeeId)
        .filter((employeeId): employeeId is number => Boolean(employeeId)),
    ])

    const data = entities.map((processing) => ({
      ...processing,
      responsibleEmployeeName:
        employeeNames.get(processing.responsibleEmployeeId) ?? null,
      validatorEmployeeName: processing.validatorEmployeeId
        ? employeeNames.get(processing.validatorEmployeeId) ?? null
        : null,
    }))

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
    const { entities, raw } = await this.processingRepository
      .createQueryBuilder('processing')
      .leftJoin('processing.responsibleEmployee', 'responsibleEmployee')
      .leftJoin(
        User,
        'responsibleUser',
        'responsibleUser.id = responsibleEmployee.userId',
      )
      .leftJoin('processing.validatorEmployee', 'validatorEmployee')
      .leftJoin(
        User,
        'validatorUser',
        'validatorUser.id = validatorEmployee.userId',
      )
      .addSelect('responsibleUser.name', 'responsible_employee_name')
      .addSelect('validatorUser.name', 'validator_employee_name')
      .where('processing.id = :id', { id })
      .getRawAndEntities()

    const processing = entities[0]

    if (!processing) {
      throw new NotFoundException(`Processamento salarial ${id} não encontrado`)
    }

    const row = raw[0] ?? {}

    const lines = await this.processingEmployeeRepository.find({
      where: { processingId: id },
      relations: { rubric: true, salaryStructure: true },
    })

    const employeeTotals = new Map<
      number,
      {
        employeeId: number
        salaryValue: number | null
        workedHours: number | null
        overtimeHours: number | null
        grossTotal: number
        discountTotal: number
        netTotal: number
        rubrics: { rubric: Rubric; value: number }[]
        baseSalary: number
      }
    >()

    for (const line of lines) {
      const totals = employeeTotals.get(line.employeeId) ?? {
        employeeId: line.employeeId,
        salaryValue: null,
        workedHours: null,
        overtimeHours: null,
        grossTotal: 0,
        discountTotal: 0,
        netTotal: 0,
        rubrics: [],
        baseSalary: Number(line.salaryStructure.baseSalary),
      }

      if (line.rubric.type === RubricType.EARNING) {
        totals.grossTotal += Number(line.value)
      } else {
        totals.discountTotal += Number(line.value)
      }

      if (line.workedHours !== null && line.workedHours !== undefined) {
        totals.workedHours = Number(line.workedHours)
        totals.overtimeHours = Number(line.overtimeHours)
      }

      totals.rubrics.push({ rubric: line.rubric, value: Number(line.value) })

      employeeTotals.set(line.employeeId, totals)
    }

    const employees = [...employeeTotals.values()].map(
      ({ baseSalary, ...totals }) => {
        totals.salaryValue = baseSalary * (totals.workedHours ?? 0)
        totals.grossTotal += totals.salaryValue
        totals.netTotal = totals.grossTotal - totals.discountTotal
        return totals
      },
    )

    const skippedEmployees = processing.skippedEmployees
      ? JSON.parse(processing.skippedEmployees)
      : []
    const employeeIds = [
      ...new Set([
        processing.responsibleEmployeeId,
        processing.validatorEmployeeId,
        ...employees.map((employee) => employee.employeeId),
        ...skippedEmployees.map((employee) => employee.employeeId),
      ].filter(Boolean)),
    ]
    const employeeNames = await this.findEmployeeNamesByIds(employeeIds)

    return {
      ...processing,
      responsibleEmployeeName:
        employeeNames.get(processing.responsibleEmployeeId) ??
        row.responsible_employee_name ??
        row.RESPONSIBLE_EMPLOYEE_NAME ??
        null,
      validatorEmployeeName: processing.validatorEmployeeId
        ? employeeNames.get(processing.validatorEmployeeId) ??
          row.validator_employee_name ??
          row.VALIDATOR_EMPLOYEE_NAME ??
          null
        : null,
      skippedEmployees: skippedEmployees.map((employee) => ({
        ...employee,
        employeeName: employeeNames.get(employee.employeeId) ?? null,
      })),
      employees: employees.map((employee) => ({
        ...employee,
        employeeName: employeeNames.get(employee.employeeId) ?? null,
      })),
    }
  }

  private async findEmployeeNamesByIds(
    employeeIds: number[],
  ): Promise<Map<number, string>> {
    const uniqueEmployeeIds = [
      ...new Set(
        employeeIds.map((employeeId) => Number(employeeId)).filter(Boolean),
      ),
    ]

    if (uniqueEmployeeIds.length === 0) {
      return new Map()
    }

    const placeholders = uniqueEmployeeIds
      .map((_, index) => `:${index + 1}`)
      .join(', ')
    const employees = await this.employeeRepository.query(
      `SELECT C.CODIGO AS "employeeId",
              U.NOME AS "employeeName"
         FROM GP_COLABORADORES C
         JOIN GP_USUARIOS U
           ON U.CODIGO = C.CODIGO_USUARIO
        WHERE C.CODIGO IN (${placeholders})`,
      uniqueEmployeeIds,
    )

    return new Map(
      employees.map((employee) => [
        Number(employee.employeeId ?? employee.EMPLOYEEID),
        employee.employeeName ?? employee.EMPLOYEENAME,
      ]),
    )
  }

  private async assertNoOpenProcessingInPeriod(
    startDate: string,
    endDate: string,
  ) {
    const overlapping = await this.processingRepository.findOne({
      where: {
        status: In(OPEN_STATES),
        startDate: LessThanOrEqual(new Date(endDate)),
        endDate: MoreThanOrEqual(new Date(startDate)),
      },
    })

    if (overlapping) {
      throw new BadRequestException(
        `Já existe um processamento (código ${overlapping.id}, estado ${overlapping.status}) para o período informado`,
      )
    }
  }

  private runProcessingInBackground(processing: SalaryProcessing): void {
    this.runProcessing(processing).catch((error) => {
      this.logger.error(
        `Falha ao processar a folha salarial ${processing.id}`,
        error,
      )
    })
  }

  private async runProcessing(processing: SalaryProcessing): Promise<void> {
    const activeSalaryEmployees = await this.salaryEmployeeRepository.find({
      where: { status: SalaryEmployeeStatus.ACTIVE },
      relations: { salaryStructure: true },
    })

    const lines: SalaryProcessingEmployee[] = []
    const skippedEmployees: { employeeId: number; reason: string }[] = []

    for (const salaryEmployee of activeSalaryEmployees) {
      const contractEmployee =
        await this.contractService.findActiveByEmployeeId(
          salaryEmployee.employeeId,
        )

      if (!contractEmployee) {
        this.logger.warn(
          `Colaborador ${salaryEmployee.employeeId} sem contrato ativo — pulado do processamento ${processing.id}`,
        )
        skippedEmployees.push({
          employeeId: salaryEmployee.employeeId,
          reason: 'SEM_CONTRATO_ATIVO',
        })
        continue
      }

      const { contract } = contractEmployee

      if (contract.type === ContractType.HOURLY) {
        const hasAcademicLink = true
        // TODO necessario de massa de dados em tst
        // await this.academicService.hasActiveAcademicLink(
        //   salaryEmployee.employeeId,
        // )

        if (!hasAcademicLink) {
          this.logger.warn(
            `Colaborador ${salaryEmployee.employeeId} sem vínculo acadêmico — pulado do processamento ${processing.id}`,
          )
          skippedEmployees.push({
            employeeId: salaryEmployee.employeeId,
            reason: 'SEM_VINCULO_ACADEMICO',
          })
          continue
        }
      }

      const workedHours = await this.sumWorkedHours(
        salaryEmployee.employeeId,
        processing.startDate,
        processing.endDate,
        contract.type,
      )

      const paidHours =
        contract.allowsOvertime === 1
          ? workedHours
          : Math.min(workedHours, contract.monthlyHours)

      const overtimeHours =
        contract.allowsOvertime === 1
          ? Math.max(0, workedHours - contract.monthlyHours)
          : 0

      const salaryRubrics = await this.salaryRubricRepository.find({
        where: { salaryStructureCode: salaryEmployee.salaryId },
        relations: { rubric: true },
      })

      for (const salaryRubric of salaryRubrics) {
        const { rubric } = salaryRubric
        let value: number

        if (rubric.valueType === ValueType.PERCENTAGE) {
          value =
            (salaryEmployee.salaryStructure.baseSalary *
              paidHours *
              rubric.value) /
            100
        } else if (rubric.valueType === ValueType.HOURLY) {
          value = salaryEmployee.salaryStructure.baseSalary * paidHours

          if (value === 0) continue
        } else {
          value = rubric.value
        }

        lines.push(
          this.processingEmployeeRepository.create({
            processingId: processing.id,
            employeeId: salaryEmployee.employeeId,
            salaryId: salaryEmployee.salaryId,
            rubricCode: rubric.code,
            value,
            workedHours: paidHours,
            overtimeHours,
          }),
        )
      }
    }

    await this.processingEmployeeRepository.save(lines)

    processing.status = SalaryProcessingStatus.SIMULATED
    processing.skippedEmployees = skippedEmployees.length
      ? JSON.stringify(skippedEmployees)
      : null
    await this.processingRepository.save(processing)
  }

  private async sumWorkedHours(
    employeeId: number,
    startDate: Date,
    endDate: Date,
    contractType: ContractType,
  ): Promise<number> {
    const attendances = await this.attendanceRepository.find({
      where: {
        employeeId,
        situation: In(WORKED_HOURS_SITUATIONS),
        startDate: And(
          MoreThanOrEqual(new Date(startDate)),
          LessThanOrEqual(new Date(endDate)),
        ),
      },
    })

    if (!ACADEMIC_RECONCILED_CONTRACT_TYPES.includes(contractType)) {
      return attendances.reduce(
        (total, attendance) => total + Number(attendance.hours ?? 0),
        0,
      )
    }

    const presenceAttendances = attendances.filter(
      (attendance) => attendance.situation === AttendanceSituation.PRESENTE,
    )
    const otherHours = attendances
      .filter(
        (attendance) => attendance.situation !== AttendanceSituation.PRESENTE,
      )
      .reduce((total, attendance) => total + Number(attendance.hours ?? 0), 0)

    const confirmedHoursByDay =
      await this.academicService.getConfirmedPresenceHoursByDay(
        employeeId,
        startDate,
        endDate,
      )

    const confirmedPresenceHours = presenceAttendances.reduce(
      (total, attendance) => {
        const day = this.toDateKey(attendance.startDate)
        const registeredHours = Number(attendance.hours ?? 0)
        const confirmedHours = confirmedHoursByDay.get(day) ?? 0
        const paidHours = Math.min(registeredHours, confirmedHours)

        if (paidHours !== registeredHours) {
          this.logger.warn(
            `Divergência de assiduidade acadêmica — colaborador ${employeeId}, dia ${day}: registado ${registeredHours}h, confirmado no GA ${confirmedHours}h. Pago ${paidHours}h.`,
          )
        }

        return total + paidHours
      },
      0,
    )

    return confirmedPresenceHours + otherHours
  }

  private toDateKey(date: Date): string {
    return new Date(date).toISOString().slice(0, 10)
  }
}
