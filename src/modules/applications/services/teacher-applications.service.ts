/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ConflictException, Injectable } from '@nestjs/common'
import { CreateApplicationPayload } from './types/create-application-payload.type'
import { StorageService } from '../../../common/services/storage.service'
import { InjectRepository } from '@nestjs/typeorm'
import { PersonEntity } from 'src/modules/person/entity/person.entity'
import { DataSource, Repository } from 'typeorm'
import { CandidateEntity } from '../entity/candidate.entity'
import { AcademicEducationEntity } from '../entity/academic-education.entity'
import { TeachingExperienceEntity } from '../entity/teaching-experience.entity'

@Injectable()
export class TeacherApplicationsService {
  constructor(
    private datasource: DataSource,
    private readonly storageService: StorageService,
    @InjectRepository(PersonEntity)
    private readonly personRepository: Repository<PersonEntity>,
    @InjectRepository(CandidateEntity)
    private readonly candidateRepository: Repository<CandidateEntity>,
    @InjectRepository(AcademicEducationEntity)
    private readonly academicEducationEntity: Repository<AcademicEducationEntity>,
    @InjectRepository(TeachingExperienceEntity)
    private readonly teachingExperienceEntity: Repository<TeachingExperienceEntity>,
  ) {}

  async create(payload: CreateApplicationPayload) {
    const { personal, academic, experience, files } = payload

    const [personByEmail, personByDocumentNumber, personByPhone, documentType] =
      await Promise.all([
        this.findPersonByEmail(personal.email),
        this.findPersonByDocumentNumber(personal.documentNumber),
        this.findPersonByPhone(
          personal.phone,
          personal.alternativePhone ?? null,
        ),
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
    if (personByPhone) {
      throw new ConflictException(
        'O número de telefone informado já está associado a um candidato cadastrado.',
      )
    }

    // Também não pode haver duplicidade entre o próprio telefone e o telefone alternativo informados no payload
    if (
      personal.alternativePhone &&
      personal.alternativePhone === personal.phone
    ) {
      throw new ConflictException(
        'O telefone alternativo não pode ser igual ao telefone principal.',
      )
    }

    let savedPerson!: PersonEntity
    let savedCandidate!: CandidateEntity

    await this.datasource.transaction(async (manager) => {
      const personRepository = manager.getRepository(PersonEntity)
      const candidateRepository = manager.getRepository(CandidateEntity)
      const academicEducationEntity = manager.getRepository(
        AcademicEducationEntity,
      )
      const teachingExperienceEntity = manager.getRepository(
        TeachingExperienceEntity,
      )

      // Etapa 1: criar pessoa
      const person = personRepository.create({
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
      savedPerson = await personRepository.save(person)

      // Etapa 2: criar candidatura
      const candidate = candidateRepository.create({
        applicationDate: new Date(),
        person: JSON.stringify({
          pk_pessoa: savedPerson.id,
          nome_completo: savedPerson.fullName,
        }),
        applicationStatusId: 8,
        academicDegreeId: academic[0].academicLevel,
      })
      savedCandidate = await candidateRepository.save(candidate)

      // Etapa 3: salvar formações
      const academicEntities = academic.map((item) =>
        academicEducationEntity.create({
          graduationYear: Number(item.completionYear),
          candidateId: savedCandidate.id,
          academicDegreeId: item.academicLevel,
          institution: item.institution,
          courseTrainingAreaId: item.course,
        }),
      )
      if (academicEntities.length) {
        await academicEducationEntity.save(academicEntities)
      }

      // Etapa 4: salvar experiências
      const experienceEntities = experience.map((item) =>
        teachingExperienceEntity.create({
          candidateId: savedCandidate.id,
          endYear: item.endYear,
          startYear: item.startYear,
          institution: item.institution,
          discipline: item.discipline,
          course: item.course,
        }),
      )
      if (experienceEntities.length) {
        await teachingExperienceEntity.save(experienceEntities)
      }

      // Etapa 5: enviar arquivos (fora da transação, ver abaixo)
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

  /**
   * Verifica se o telefone principal ou o telefone alternativo informados
   * já estão em uso (em qualquer um dos dois campos) por outra pessoa.
   */
  private async findPersonByPhone(
    phone: string,
    alternativePhone: string | null,
  ): Promise<PersonEntity | null> {
    const query = this.personRepository
      .createQueryBuilder('person')
      .where('person.phone = :phone', { phone })
      .orWhere('person.alternativePhone = :phone', { phone })

    if (alternativePhone) {
      query
        .orWhere('person.phone = :alternativePhone', { alternativePhone })
        .orWhere('person.alternativePhone = :alternativePhone', {
          alternativePhone,
        })
    }

    return query.getOne()
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
