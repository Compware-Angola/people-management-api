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
  UseGuards,
} from '@nestjs/common'
import { UserService } from './user.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserQueryDto } from './dto/user-query.dto'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { RemoteJwtAuthGuard } from '../../commons/guards/remote-jwt-auth.guard'
import { PermissionsGuard } from '../../commons/guards/permissions.guard'
import { Permissions } from '../../commons/decorators/permissions.decorator'
import { PermissionsEnum } from '../../commons/enums/permissions.enum'

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(RemoteJwtAuthGuard, PermissionsGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions(PermissionsEnum.WRITE_USERS)
  @ApiOperation({ summary: 'Criar um novo usuário' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto)
  }

  @Get()
  @Permissions(PermissionsEnum.READ_USERS)
  @ApiOperation({ summary: 'Listar todos os usuários' })
  findAll(@Query() query: UserQueryDto) {
    return this.userService.findAll(query)
  }

  @Get(':id')
  @Permissions(PermissionsEnum.READ_USERS)
  @ApiOperation({ summary: 'Buscar um usuário pelo ID' })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id)
  }

  @Patch(':id')
  @Permissions(PermissionsEnum.WRITE_USERS)
  @ApiOperation({ summary: 'Atualizar um usuário' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto)
  }
}
