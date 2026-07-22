import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { UsersService } from './services/users.service'

import { TypeormUserRepository } from './repositories/typeorm-user.repository'
import { UserEntity } from './entity/user.entity'
import { UserRepository } from './repositories/user-repository'
import { UsersController } from './controllers/users.controller'

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],

  controllers: [UsersController],

  providers: [
    UsersService,

    {
      provide: UserRepository,
      useClass: TypeormUserRepository,
    },
  ],
})
export class UsersModule {}
