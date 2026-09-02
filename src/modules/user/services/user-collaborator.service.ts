import { CreateUserCollaboratorDto } from "../dto/create-user-collaborator.dto"
import { UserCollaboratorEntity } from "../entities/user-collaborator.entity"
import { EntityManager } from "typeorm"
import { InjectDataSource } from "@nestjs/typeorm"
import { PersonEntity } from "../entities/person.entity"
import { DataSource } from "typeorm/browser"
import { ConflictException } from "@nestjs/common"
import { HashService } from "src/commons/services/hash.service"

export class UserCollaboratorService {
    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource,
        private readonly hashService: HashService,
    ) { }

    async create(
        dto: CreateUserCollaboratorDto,
    ): Promise<UserCollaboratorEntity> {
        return this.dataSource.transaction(async (manager) => {
            const email = dto.email.trim().toLowerCase()

            const existingUser = await manager.findOne(
                UserCollaboratorEntity,
                {
                    where: {
                        email,
                    },
                },
            )

            if (existingUser) {
                throw new ConflictException(
                    'Já existe uma conta utilizando este email',
                )
            }
            const person = manager.create(PersonEntity, {
                name: dto.fullName.trim(),
            })

            const savedPerson = await manager.save(
                PersonEntity,
                person,
            )
            const username = await this.generateUsername(
                savedPerson.name,
                manager,
            )
            const password = await this.hashService.hash(dto.password)
            const user = manager.create(
                UserCollaboratorEntity,
                {
                    personId: savedPerson.id,
                    email,
                    username,
                    password,
                },
            )
            const savedUser = await manager.save(
                UserCollaboratorEntity,
                user,
            )
            savedUser.person = savedPerson

            return savedUser
        })
    }

    private async generateUsername(
        name: string,
        manager: EntityManager,
    ): Promise<string> {
        const baseUsername = this.normalizeUsername(name)

        let username = baseUsername
        let counter = 1

        while (true) {
            const existing = await manager.findOne(
                UserCollaboratorEntity,
                {
                    where: {
                        username,
                    },
                },
            )

            if (!existing) {
                return username
            }

            username = `${baseUsername}${counter}`

            counter++
        }
    }
    private normalizeUsername(name: string): string {
        const normalized = name
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .trim()
            .split(/\s+/)

        if (normalized.length === 0) {
            return `colaborador${Date.now()}`
        }

        if (normalized.length === 1) {
            return normalized[0]
        }

        const firstName = normalized[0]
        const lastName =
            normalized[normalized.length - 1]

        return `${firstName}.${lastName}`
    }
}

