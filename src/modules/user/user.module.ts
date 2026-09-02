import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserController } from './controllers/user.controller'
import { User } from './entities/user.entity'
import { UserCollaboratorController } from './controllers/user-collaborator.controller'
import { UserCollaboratorService } from './services/user-collaborator.service'
import { UserService } from './services/user.service'
import { PersonEntity } from './entities/person.entity'
import { UserCollaboratorEntity } from './entities/user-collaborator.entity'
import { HashService } from 'src/commons/services/hash.service'

@Module({
  imports: [TypeOrmModule.forFeature([User, PersonEntity, UserCollaboratorEntity])],
  controllers: [UserController, UserCollaboratorController],
  providers: [UserCollaboratorService, UserService, HashService],
  exports: [UserCollaboratorService, UserService],
})
export class UserModule { }
