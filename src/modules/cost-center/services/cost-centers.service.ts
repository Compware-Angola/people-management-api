import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ILike, IsNull, Repository } from 'typeorm'
import { CostCenter } from '../entity/cost-center.entity'
import { Department } from 'src/modules/department/entity/department.entity'
import { PaginatedResponseDto } from 'src/commons/dto/pagination-response.dto'
import { UpdateCostCenterDto } from '../dto/update-cost-center.dto'
import { CreateCostCenterDto } from '../dto/create-cost-center.dto'
import { ListCostCentersQueryDto } from '../dto/list-cost-centers-query.dto'

@Injectable()
export class CostCentersService {
  constructor(
    @InjectRepository(CostCenter)
    private readonly gpCostCenterRepository: Repository<CostCenter>,
    @InjectRepository(Department)
    private readonly gpDepartmentRepository: Repository<Department>,
  ) {}

  async create(dto: CreateCostCenterDto): Promise<CostCenter> {
    const department = await this.gpDepartmentRepository.findOne({
      where: { code: dto.departmentId, deletedAt: IsNull() },
    })
    if (!department) {
      throw new NotFoundException(
        `Departamento com o código ${dto.departmentId} não encontrado`,
      )
    }

    const costCenterAlreadyExists = await this.gpCostCenterRepository.findOne({
      where: { description: dto.description, deletedAt: IsNull() },
    })
    if (costCenterAlreadyExists) {
      throw new ConflictException(
        `Centro de custo com a descrição ${dto.description} já existe`,
      )
    }

    const costCenter = this.gpCostCenterRepository.create(dto)
    return this.gpCostCenterRepository.save(costCenter)
  }

  async findAll(
    query: ListCostCentersQueryDto,
  ): Promise<PaginatedResponseDto<CostCenter>> {
    const { search, status, departmentId, page, limit, offset } = query

    const [data, total] = await this.gpCostCenterRepository.findAndCount({
      where: {
        deletedAt: IsNull(),
        ...(search ? { description: ILike(`%${search}%`) } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(departmentId !== undefined ? { departmentId } : {}),
      },
      relations: { department: true },
      order: { code: 'DESC' },
      skip: offset,
      take: limit,
    })

    return PaginatedResponseDto.create(data, total, page, limit)
  }

  async findOne(code: number): Promise<CostCenter> {
    const costCenter = await this.gpCostCenterRepository.findOne({
      where: { code, deletedAt: IsNull() },
      relations: { department: true },
    })
    if (!costCenter) {
      throw new NotFoundException(
        `Centro de custo com o código ${code} não encontrado`,
      )
    }
    return costCenter
  }

  async update(code: number, dto: UpdateCostCenterDto): Promise<CostCenter> {
    const costCenterExists = await this.gpCostCenterRepository.findOne({
      where: { code, deletedAt: IsNull() },
    })
    if (!costCenterExists) {
      throw new NotFoundException(
        `Centro de custo com o código ${code} não encontrado`,
      )
    }

    if (dto.departmentId) {
      const department = await this.gpDepartmentRepository.findOne({
        where: { code: dto.departmentId, deletedAt: IsNull() },
      })
      if (!department) {
        throw new NotFoundException(
          `Departamento com o código ${dto.departmentId} não encontrado`,
        )
      }
    }

    const costCenter = await this.findOne(code)
    Object.assign(costCenter, dto)
    return this.gpCostCenterRepository.save(costCenter)
  }

  async remove(code: number): Promise<void> {
    const costCenter = await this.findOne(code)
    await this.gpCostCenterRepository.softDelete({ code: costCenter.code })
  }
}
