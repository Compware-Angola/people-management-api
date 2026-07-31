import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, IsNull, Repository } from 'typeorm';
import { Position } from '../entity/position.entity';
import { PaginatedResponseDto } from 'src/commons/dto/pagination-response.dto';
import { UpdatePositionDto } from '../dto/update-position.dto';
import { CreatePositionDto } from '../dto/create-position.dto';
import { ListPositionsQueryDto } from '../dto/list-positions-query.dto';


@Injectable()
export class PositionsService {
  constructor(
    @InjectRepository(Position)
    private readonly gpPositionRepository: Repository<Position>,
  ) {}

  async create(dto: CreatePositionDto): Promise<Position> {
    const positionAlreadyExists = await this.gpPositionRepository.findOne({ where: { description: dto.description,deletedAt: IsNull() } });
    if (positionAlreadyExists) {
      throw new ConflictException(`Cargo com a descrição ${dto.description} ja existe`);
    }
    const position = this.gpPositionRepository.create(dto);
    return this.gpPositionRepository.save(position);
  }

  async findAll(
    query: ListPositionsQueryDto,
  ): Promise<PaginatedResponseDto<Position>> {
    const { search, status, page, limit, offset } = query;

    const [data, total] = await this.gpPositionRepository.findAndCount({
      where: {
        deletedAt: IsNull(),
        ...(search ? { description: ILike(`%${search}%`) } : {}),
        ...(status !== undefined ? { status } : {}),
      },
      order: { code: 'DESC' },
      skip: offset,
      take: limit,
    });

    return PaginatedResponseDto.create(data, total, page, limit);
  }

  async findOne(code: number): Promise<Position> {
    const position = await this.gpPositionRepository.findOne({ where: { code,deletedAt: IsNull() } });
    if (!position) {
      throw new NotFoundException(`Cargo com o código ${code} não encontrado`);
    }
    return position;
  }
  async update(code: number, dto: UpdatePositionDto): Promise<Position> {
    const positionExists = await this.gpPositionRepository.findOne({ where: { code, deletedAt: IsNull() } });
    if (!positionExists) {
      throw new NotFoundException(`Cargo com o código ${code} não encontrado`);
    }
    const position = await this.findOne(code);
    Object.assign(position, dto);
    return this.gpPositionRepository.save(position);
  }

  async remove(code: number): Promise<void> {
    const position = await this.findOne(code);
    await this.gpPositionRepository.softDelete({ code });
  }
}