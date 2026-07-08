import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  HttpCode,
  HttpStatus,
  Query,
  Delete,
} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { PaginationQueryDto } from '../../commons/dto/pagination.dto';
import { ApiTags } from '@nestjs/swagger';
import { CreateFileDto } from './dto/file/create-file.dto';

@Controller('employees')
@ApiTags('Employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  async create(@Body() createEmployeeDto: CreateEmployeeDto) {
    await this.employeeService.create(createEmployeeDto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.employeeService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
    return this.employeeService.update(+id, updateEmployeeDto);
  }

  @Post('files')
  @HttpCode(HttpStatus.NO_CONTENT)
  async addFile(@Body() createFileDto: CreateFileDto) {
    await this.employeeService.addFile(createFileDto);
  }

  @Delete('files/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeFile(@Param('id') id: string) {
    await this.employeeService.removeFile(+id);
  }
}
