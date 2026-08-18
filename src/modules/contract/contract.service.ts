import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsWhere, Repository } from 'typeorm'

import { Contract } from './entities/contract.entity'
import {
  ContractEmployee,
  ContractEmployeeStatus,
} from './entities/contract-employee.entity'
import {
  ContractQueryDto,
  CreateContractDto,
  UpdateContractDto,
} from './dto/contract.dto'
import { CreateContractEmployeeDto } from './dto/contract-employee.dto'

@Injectable()
export class ContractService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,

    @InjectRepository(ContractEmployee)
    private readonly contractEmployeeRepository: Repository<ContractEmployee>,
  ) {}

  async findAll(query: ContractQueryDto) {
    const page = query.page ?? 1
    const limit = query.limit ?? 10
    const skip = (page - 1) * limit

    const where: FindOptionsWhere<Contract> = {}

    if (query.id) where.id = query.id
    if (query.type) where.type = query.type
    if (query.status) where.status = query.status

    const [data, total] = await this.contractRepository.findAndCount({
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

  async create(createContractDto: CreateContractDto): Promise<Contract> {
    const contract = this.contractRepository.create(createContractDto)
    return this.contractRepository.save(contract)
  }

  async update(
    id: number,
    updateContractDto: UpdateContractDto,
  ): Promise<Contract> {
    const contract = await this.contractRepository.findOne({ where: { id } })

    if (!contract) {
      throw new NotFoundException(`Contrato com ID ${id} não encontrado`)
    }

    this.contractRepository.merge(contract, updateContractDto)
    return await this.contractRepository.save(contract)
  }

  async saveContractToEmployee(
    createContractEmployeeDto: CreateContractEmployeeDto,
  ): Promise<ContractEmployee> {
    const { contractId, employeeId } = createContractEmployeeDto

    const contract = await this.contractRepository.findOne({
      where: { id: contractId },
    })

    if (!contract) {
      throw new NotFoundException(
        `Contrato com ID ${contractId} não encontrado`,
      )
    }

    const activeAssignment = await this.contractEmployeeRepository.findOne({
      where: { employeeId, status: ContractEmployeeStatus.ACTIVE },
    })

    if (activeAssignment && activeAssignment.contractId === contractId) {
      throw new BadRequestException(
        'O colaborador já possui esse contrato ativo',
      )
    }

    if (activeAssignment) {
      await this.contractEmployeeRepository.update(
        { id: activeAssignment.id },
        { status: ContractEmployeeStatus.INACTIVE, endDate: new Date() },
      )
    }

    const contractEmployee = this.contractEmployeeRepository.create({
      contractId,
      employeeId,
      status: ContractEmployeeStatus.ACTIVE,
      startDate: new Date(),
    })
    return this.contractEmployeeRepository.save(contractEmployee)
  }

  async findActiveByEmployeeId(
    employeeId: number,
  ): Promise<ContractEmployee | null> {
    return this.contractEmployeeRepository.findOne({
      where: { employeeId, status: ContractEmployeeStatus.ACTIVE },
      relations: { contract: true },
    })
  }

  async findContractEmployeeByEmployeeId(
    employeeId: number,
  ): Promise<ContractEmployee> {
    const contractEmployee = await this.findActiveByEmployeeId(employeeId)

    if (!contractEmployee) {
      throw new NotFoundException(
        `Contrato ativo do colaborador ${employeeId} não encontrado`,
      )
    }

    return contractEmployee
  }

  async findHistory(employeeId: number): Promise<ContractEmployee[]> {
    return this.contractEmployeeRepository.find({
      where: { employeeId },
      relations: { contract: true },
      order: { startDate: 'DESC' },
    })
  }
}
