import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { PaginationQueryDto } from '../../commons/dto/pagination.dto';
import { Attendance } from './entities/attendance.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
  ) {}

  async create(createAttendanceDto: CreateAttendanceDto) {
    try {
      const attendance = this.attendanceRepository.create({
        employeeId: createAttendanceDto.employeeId,
        startDate: new Date(createAttendanceDto.startDate),
        endDate: createAttendanceDto.endDate
          ? new Date(createAttendanceDto.endDate)
          : undefined,
        hours: createAttendanceDto.hours,
        situation: createAttendanceDto.situation,
      });

      await this.attendanceRepository.save(attendance);
    } catch (error) {
      this.handleDatabaseError(error, 'cadastrar');
    }
  }

  async findAll(query: PaginationQueryDto) {
    const [data, total] = await this.attendanceRepository.findAndCount({
      order: { id: 'DESC' },
      skip: query.offset,
      take: query.limit,
    });

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
    const attendance = await this.attendanceRepository.findOneBy({ id });

    if (!attendance) {
      throw new NotFoundException(`Assiduidade com ID ${id} não encontrada`);
    }

    return attendance;
  }

  async findByEmployee(employeeId: number, query: PaginationQueryDto) {
    const [data, total] = await this.attendanceRepository.findAndCount({
      where: { employeeId },
      order: { startDate: 'DESC' },
      skip: query.offset,
      take: query.limit,
    });

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

    const updatedAttendance = this.attendanceRepository.merge(attendance, {
      ...updateAttendanceDto,
      startDate: updateAttendanceDto.startDate
        ? new Date(updateAttendanceDto.startDate)
        : attendance.startDate,
      endDate: updateAttendanceDto.endDate
        ? new Date(updateAttendanceDto.endDate)
        : attendance.endDate,
    });

    try {
      await this.attendanceRepository.save(updatedAttendance);
      return updatedAttendance;
    } catch (error) {
      this.handleDatabaseError(error, 'atualizar');
    }
  }

  async remove(id: number) {
    const attendance = await this.findOne(id);
    await this.attendanceRepository.remove(attendance);
  }

  private handleDatabaseError(error: any, action: string) {
    const message = error?.message || '';

    if (message.includes('FK_GP_ASSIDUIDADES_COLAB')) {
      throw new BadRequestException('Colaborador informado não existe');
    }

    if (message.includes('CK_GP_ASSIDUIDADES_SIT')) {
      throw new BadRequestException('Situação informada é inválida');
    }

    throw new InternalServerErrorException(`Erro ao ${action} assiduidade`);
  }
}
