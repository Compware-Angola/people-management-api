/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ConflictException, Injectable } from '@nestjs/common'
import { CreateApplicationPayload } from './types/create-application-payload.type'
import { StorageService } from '../../../common/services/storage.service'
import { InjectRepository } from '@nestjs/typeorm'
import { PersonEntity } from 'src/modules/person/entity/person.entity'
import { DataSource, Repository } from 'typeorm'
import { CandidateEntity } from '../entity/candidate.entity'

@Injectable()
export class TeacherApplicationsService {
  constructor(
    private datasource: DataSource,
    private readonly storageService: StorageService,
    @InjectRepository(PersonEntity)
    private readonly personRepository: Repository<PersonEntity>,
    @InjectRepository(CandidateEntity)
    private readonly candidateRepository,
  ) {}

  async create(payload: CreateApplicationPayload) {
    const { personal, academic, experience, files } = payload

    const [personByEmail, personByDocumentNumber, documentType] =
      await Promise.all([
        this.findPersonByEmail(personal.email),
        this.findPersonByDocumentNumber(personal.documentNumber),
        this.documentType(personal.documentType),
      ])
    if (personByEmail) {
      throw new ConflictException(
        'O endereço de e-mail informado já está associado a um candidato cadastrado.',
      )
    }
    if (personByDocumentNumber) {
      throw new ConflictException(
        `O número de ${documentType ?? 'documento'} informado já está associado a um candidato cadastrado.`,
      )
    }

    await this.datasource.transaction(async (manager) => {
      const personRepository = manager.getRepository(PersonEntity)
      const candidateRepository = manager.getRepository(CandidateEntity)
      try {
        // done
        const persson = personRepository.create({
          nationalityId: personal.nationality,
          email: personal.email,
          alternativePhone: personal.alternativePhone ?? null,
          fullName: personal.fullName,
          address: personal.address,
          genderId: personal.gender,
          documentNumber: personal.documentNumber,
          documentTypeId: personal.documentType,
          maritalStatusId: personal.maritalStatus,
          phone: personal.phone,
          documentExpirationDate: personal.documentExpiration,
          activeState: 1,
          birthDate: personal.birthDate,
          createdAt: new Date(),
        })
        const candidate = candidateRepository.create({
          applicationDate: new Date(),
          person: JSON.stringify({
            pk_pessoa: persson.id,
            nome_completo: persson.fullName,
          }),
          applicationStatusId: 8,
        })
        console.log(persson, candidate)
      } catch (error) {
        console.log(error)
      }
      // Etapa 1
      // criar pessoa
      // Etapa 2
      // criar candidatura
      // Etapa 3
      // salvar formações
      // Etapa 4
      // salvar experiências
      // Etapa 5
      // enviar arquivos
    })

    const cvUrl = this.storageService.upload(files.cv)

    return {
      personal,
      academic,
      experience,
      documents: {
        cv: cvUrl,
      },
    }
  }

  private async findPersonByEmail(email: string): Promise<PersonEntity | null> {
    return this.personRepository.findOne({
      where: { email },
    })
  }

  private async findPersonByDocumentNumber(
    documentNumber: string,
  ): Promise<PersonEntity | null> {
    return this.personRepository.findOne({
      where: { documentNumber },
    })
  }

  private async documentType(id: number): Promise<string | null> {
    const result = await this.datasource.query(
      `
      SELECT DESIGNACAO
      FROM FK2_TB_TIPO_DOCUMENTOS
      WHERE CODIGO = :codigo
    `,
      {
        codigo: id,
      },
    )

    return result[0]?.DESIGNACAO ?? null
  }
}
