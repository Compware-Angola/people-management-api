import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ILike, IsNull, Repository } from 'typeorm'
import { Department } from '../entity/department.entity'
import { PaginatedResponseDto } from 'src/commons/dto/pagination-response.dto'
import { UpdateDepartmentDto } from '../dto/update-department.dto'
import { CreateDepartmentDto } from '../dto/create-department.dto'
import { ListDepartmentsQueryDto } from '../dto/list-departments-query.dto'
import { UserGroup } from 'src/modules/permissions/entities/user-group.entity'

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly gpDepartmentRepository: Repository<Department>,
    @InjectRepository(UserGroup)
    private readonly gpUserGroupRepository: Repository<UserGroup>
  ) {}

  async create(dto: CreateDepartmentDto): Promise<Department> {
    const departmentAlreadyExists = await this.gpDepartmentRepository.findOne({
      where: { description: dto.description, deletedAt: IsNull() },
    })
    if (departmentAlreadyExists) {
      throw new ConflictException(
        `Departamento com a descrição ${dto.description} já existe`,
      )
    }
    const department = this.gpDepartmentRepository.create(dto)
    return this.gpDepartmentRepository.save(department)
  }

  async findAll(
    query: ListDepartmentsQueryDto,
  ): Promise<PaginatedResponseDto<Department>> {
    const { search, status, page, limit, offset } = query

    const [data, total] = await this.gpDepartmentRepository.findAndCount({
      where: {
        deletedAt: IsNull(),
        ...(search ? { description: ILike(`%${search}%`) } : {}),
        ...(status !== undefined ? { status } : {}),
      },
      order: { code: 'DESC' },
      skip: offset,
      take: limit,
    })

    return PaginatedResponseDto.create(data, total, page, limit)
  }

  async findOne(code: number): Promise<Department> {
    const department = await this.gpDepartmentRepository.findOne({
      where: { code, deletedAt: IsNull() },
    })
    if (!department) {
      throw new NotFoundException(
        `Departamento com o código ${code} não encontrado`,
      )
    }
    return department
  }

  async update(code: number, dto: UpdateDepartmentDto): Promise<Department> {
    const departmentExists = await this.gpDepartmentRepository.findOne({
      where: { code, deletedAt: IsNull() },
    })
    if (!departmentExists) {
      throw new NotFoundException(
        `Departamento com o código ${code} não encontrado`,
      )
    }
    const department = await this.findOne(code)
    Object.assign(department, dto)
    return this.gpDepartmentRepository.save(department)
  }

  async remove(code: number): Promise<void> {
    const department = await this.findOne(code)
    await this.gpDepartmentRepository.softDelete({ code: department.code })
  }
  async myDepartment(userId:number) {
    const response = await  this.gpUserGroupRepository.find({where:{userId,group:{department:{status:1}}},relations:{group:{department:true}}})
    const departments = response.map(g=> g?.group.department)
    return {departments}
  }
}
 