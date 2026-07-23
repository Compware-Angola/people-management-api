/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ConflictException, Injectable } from '@nestjs/common'
import { CreateApplicationPayload } from './types/create-application-payload.type'
import { StorageService } from '../../../common/services/storage.service'
import { InjectRepository } from '@nestjs/typeorm'
import { PersonEntity } from 'src/modules/applications/entity/person.entity'
import { DataSource, Repository } from 'typeorm'
import { CandidateEntity } from '../entity/candidate.entity'
import { AcademicEducationEntity } from '../entity/academic-education.entity'
import { TeachingExperienceEntity } from '../entity/teaching-experience.entity'
import { TeacherApplicationDocument } from '../entity/teacher-application-document.entity'
import { ApplicationFile } from '../../../common/types/application-file.type'

export enum TipoDocumentoNecessario {
  BI = 1,
  CERTIFICADO = 2,
  FOTOGRAFIAS = 3,
  CEDULA_PROFISSIONAL = 4,
  DECLARACAO_DE_TEMPO_DE_SERVICO = 5,
  DECLARACAO_DE_AUTORIZACAO = 6,
  CERTIDAO_MILITAR_REGULARIZADO = 7,
  REGISTRO_CRIMINAL = 8,
  TALAO_DE_RECENSEAMENTO_MILITAR = 9,
  ATESTADO_MEDICO = 10,
  DECLARACAO_INAARES = 11,
  DECLARACAO_FORMACAO_PEDAGOGICA = 12,
  CURRICULUM_VITAE = 13,
  CONTA_BANCARIA = 14,
  CARTA_DE_APRESENTACAO = 15,
  COMPROVATIVO_BANCARIO = 16,
  PROJECTO_DE_INVESTIGACAO_CIENTIFICA = 17,
  DECLARACAO_DE_PROFICIENCIA_EM_INGLES = 18,
}

@Injectable()
export class TeacherApplicationsService {
  constructor(
    private datasource: DataSource,
    private readonly storageService: StorageService,
    @InjectRepository(PersonEntity)
    private readonly personRepository: Repository<PersonEntity>,
    @InjectRepository(CandidateEntity)
    @InjectRepository(TeacherApplicationDocument)
    private readonly teacherApplicationDocumentRepository: Repository<TeacherApplicationDocument>,
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
    })
await Promise.all([
  this.uploadAndSaveDocument(
    savedCandidate.id,
    personal.documentType,
    files.identificationDocument,
  ),
  this.uploadAndSaveDocument(
    savedCandidate.id,
    TipoDocumentoNecessario.CURRICULUM_VITAE,
    files.cv,
  ),
  this.uploadAndSaveDocument(
    savedCandidate.id,
    TipoDocumentoNecessario.CERTIFICADO,
    files.courseCertificate,
  ),
  this.uploadAndSaveDocument(
    savedCandidate.id,
    TipoDocumentoNecessario.DECLARACAO_FORMACAO_PEDAGOGICA,
    files.pedagogicalAggregation,
  ),
  ...files.certificates.map((certificate) =>
    this.uploadAndSaveDocument(
      savedCandidate.id,
      TipoDocumentoNecessario.CERTIFICADO,
      certificate,
    ),
  ),
])

    return {message: 'Candidatura criada com sucesso'}

  }

  private async uploadAndSaveDocument(
    candidateId: number,
    documentTypeId: TipoDocumentoNecessario,
    file: ApplicationFile,
  ) {
    const uploadResult = await this.storageService.upload(file)

    const document = this.teacherApplicationDocumentRepository.create({
      candidateId: candidateId,
      documentTypeId,
      fileName: uploadResult.file.filename,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await this.teacherApplicationDocumentRepository.save(document)
    return { name: uploadResult.file.filename }
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