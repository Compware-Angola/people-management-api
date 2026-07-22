import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'

import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { CreateUserDto } from '../dto/create-user.dto'
import { UsersService } from '../services/users.service'
import { UpdateUserDto } from '../dto/update-user.dto'
import { ListUserDto } from '../dto/list-user.dto'

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: 'Create user',
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
  })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto)
  }

  @Get()
  findAll(@Query() dto: ListUserDto) {
    return this.usersService.findAll(dto)
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by id',
  })
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.usersService.findOne(id)
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update user',
  })
  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, dto)
  }
}
