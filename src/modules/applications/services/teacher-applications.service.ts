/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ConflictException, ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common'
import { CreateApplicationPayload } from './types/create-application-payload.type'
import { StorageService } from '../../../commons/services/storage.service'
import { InjectRepository } from '@nestjs/typeorm'
import { PersonEntity } from 'src/modules/applications/entity/person.entity'
import { DataSource, In, Repository } from 'typeorm'
import { CandidateEntity } from '../entity/candidate.entity'
import { AcademicEducationEntity } from '../entity/academic-education.entity'
import { TeachingExperienceEntity } from '../entity/teaching-experience.entity'
import { TeacherApplicationDocument } from '../entity/teacher-application-document.entity'
import { ApplicationFile } from '../../../commons/types/application-file.type'
import { User } from 'src/modules/user/entities/user.entity'
import { HashService } from 'src/commons/services/hash.service'
import { ApplicationStatusEntity } from '../entity/application-status.entity'
import { AcademicDegreeEntity } from '../entity/academic-degree.entity'
import { UpdateAcademicEducationItemDto } from '../dto/update-academic-educations.dto'
import { UpdateTeachingExperienceItemDto } from '../dto/update-teaching-experiences.dto'

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
    private readonly hashService: HashService,
    @InjectRepository(PersonEntity)
    private readonly personRepository: Repository<PersonEntity>,
    @InjectRepository(CandidateEntity)
    private readonly candidateRepository: Repository<CandidateEntity>,
    @InjectRepository(TeacherApplicationDocument)
    private readonly teacherApplicationDocumentRepository: Repository<TeacherApplicationDocument>,
    @InjectRepository(AcademicEducationEntity)
    private readonly academicEducationRepository: Repository<AcademicEducationEntity>,
    @InjectRepository(TeachingExperienceEntity)
    private readonly teachingExperienceRepository: Repository<TeachingExperienceEntity>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ApplicationStatusEntity)
    private readonly applicationStatusRepository: Repository<ApplicationStatusEntity>,
    @InjectRepository(AcademicDegreeEntity)
    private readonly academicDegreeRepository: Repository<AcademicDegreeEntity>,
  ) {}

  async create(payload: CreateApplicationPayload) {
  const { personal, academic, experience, files } = payload

  let hashPassword: string
  try {
    hashPassword = await this.hashService.hash(personal.documentNumber)
  } catch (error) {
    throw new InternalServerErrorException('Falha ao processar o cadastro.')
  }

  const [
    personByEmail,
    personByDocumentNumber,
    personByPhone,
    documentType,
    userByEmail,
    userByDocumentNumber,
  ] = await Promise.all([
    this.findPersonByEmail(personal.email),
    this.findPersonByDocumentNumber(personal.documentNumber),
    this.findPersonByPhone(personal.phone, personal.alternativePhone ?? null),
    this.documentType(personal.documentType),
    this.findUserByEmail(personal.email),
    this.findUserByDocumentNumber(personal.documentNumber),
  ])

  if (personByEmail || userByEmail) {
    throw new ConflictException(
      'O endereço de e-mail informado já está associado a um candidato cadastrado.',
    )
  }
  if (personByDocumentNumber || userByDocumentNumber) {
    throw new ConflictException(
      `O número de ${documentType ?? 'documento'} informado já está associado a um candidato cadastrado.`,
    )
  }
  if (personByPhone) {
    throw new ConflictException(
      'O número de telefone informado já está associado a um candidato cadastrado.',
    )
  }
  if (personal.alternativePhone && personal.alternativePhone === personal.phone) {
    throw new ConflictException(
      'O telefone alternativo não pode ser igual ao telefone principal.',
    )
  }

  const uploadedFiles = await this.uploadAllApplicationFiles(personal, files)

  try {
    const savedCandidate = await this.datasource.transaction(async (manager) => {
      const personRepository = manager.getRepository(PersonEntity)
      const candidateRepository = manager.getRepository(CandidateEntity)
      const academicEducationEntity = manager.getRepository(AcademicEducationEntity)
      const teachingExperienceEntity = manager.getRepository(TeachingExperienceEntity)
      const documentRepository = manager.getRepository(TeacherApplicationDocument)
      const userRepository = manager.getRepository(User)

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
      const savedPerson = await personRepository.save(person)

      await userRepository.save({
        name: personal.fullName,
        email: personal.email,
        bi: personal.documentNumber,
        phone: personal.phone,
        alternativePhone: personal.alternativePhone,
        address: personal.address,
        password: hashPassword,
        province: 'unknown',
        district: 'unknown',
        municipality: 'unknown',
      })

      const candidate = candidateRepository.create({
        applicationDate: new Date(),
        person: JSON.stringify({
          pk_pessoa: savedPerson.id,
          nome_completo: savedPerson.fullName,
        }),
        applicationStatusId: 8,
        academicDegreeId: academic[0].academicLevel,
      })
      const savedCandidate = await candidateRepository.save(candidate)

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
      const documentEntities = uploadedFiles.map((uploaded) =>
        documentRepository.create({
          candidateId: savedCandidate.id,
          documentTypeId: uploaded.documentTypeId,
          fileName: uploaded.fileName,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      )
      await documentRepository.save(documentEntities)

      return savedCandidate
    })

    return { message: 'Candidatura criada com sucesso' }
  } catch (error) {
    // 3) Banco falhou depois dos uploads: limpa o storage pra não deixar lixo órfão.
    // await this.cleanupUploadedFiles(uploadedFiles)
    throw new InternalServerErrorException(
      'Não foi possível concluir a candidatura. Tente novamente.',
    )
  }
}


async myApplications(username: string) {
  const person = await this.personRepository.findOne({
    where: { email: username },
  })

  if (!person) {
    return null
  }

  const candidates = await this.candidateRepository
    .createQueryBuilder('candidate')
    .where(
      `JSON_EXISTS(candidate.person, '$?(@.pk_pessoa == $personId)' PASSING :personId AS "personId")`,
      { personId: person.id },
    )
    .orderBy('candidate.applicationDate', 'DESC')
    .getMany()

  if (!candidates.length) {
    return null
  }

  const candidateIds = candidates.map((c) => c.id)

  const statusIds = [
    ...new Set(
      candidates
        .map((c) => c.applicationStatusId)
        .filter((id): id is number => id != null),
    ),
  ]
  const academicDegreeIds = [
    ...new Set(
      candidates
        .map((c) => c.academicDegreeId)
        .filter((id): id is number => id != null),
    ),
  ]

  const [
    academicEducations,
    teachingExperiences,
    documents,
    applicationStatuses,
    academicDegrees,
  ] = await Promise.all([
    this.academicEducationRepository.find({
      where: { candidateId: In(candidateIds) },
    }),
    this.teachingExperienceRepository.find({
      where: { candidateId: In(candidateIds) },
    }),
    this.teacherApplicationDocumentRepository.find({
      where: { candidateId: In(candidateIds) },
    }),
    statusIds.length
      ? this.applicationStatusRepository.find({ where: { id: In(statusIds) } })
      : Promise.resolve([]),
    academicDegreeIds.length
      ? this.academicDegreeRepository.find({
          where: { id: In(academicDegreeIds) },
        })
      : Promise.resolve([]),
  ])

  const statusMap = new Map(applicationStatuses.map((s) => [s.id, s]))
  const academicDegreeMap = new Map(academicDegrees.map((d) => [d.id, d]))

  const result = candidates.map((candidate) => ({
    id: candidate.id,
    applicationDate: candidate.applicationDate,
    person: {
      id: person.id,
      fullName: person.fullName,
      email: person.email,
    },
    applicationStatus: candidate.applicationStatusId
      ? {
          id: candidate.applicationStatusId,
          description:
            statusMap.get(candidate.applicationStatusId)?.description ?? null,
        }
      : null,
    academicDegree: candidate.academicDegreeId
      ? {
          id: candidate.academicDegreeId,
          designation:
            academicDegreeMap.get(candidate.academicDegreeId)?.designation ??
            null,
          acronym:
            academicDegreeMap.get(candidate.academicDegreeId)?.acronym ?? null,
        }
      : null,
    academicEducations: academicEducations.filter(
      (item) => item.candidateId === candidate.id,
    ),
    teachingExperiences: teachingExperiences.filter(
      (item) => item.candidateId === candidate.id,
    ),
    documents: documents.filter((item) => item.candidateId === candidate.id),
  }))

  return result[0]
}

async updateAcademicEducations(
  username: string,
  candidateId: number,
  items: UpdateAcademicEducationItemDto[],
) {
  await this.assertCandidateBelongsToUser(username, candidateId)

  await this.datasource.transaction(async (manager) => {
    const repo = manager.getRepository(AcademicEducationEntity)

    const existingIds = items
      .filter((item): item is UpdateAcademicEducationItemDto & { id: number } =>
        item.id != null,
      )
      .map((item) => item.id)

    // remove registos que já não vieram na lista (foram apagados no front)
    if (existingIds.length) {
      await repo
        .createQueryBuilder()
        .delete()
        .where('candidateId = :candidateId', { candidateId })
        .andWhere('id NOT IN (:...ids)', { ids: existingIds })
        .execute()
    } else {
      await repo.delete({ candidateId })
    }

    for (const item of items) {
      if (item.id) {
        await repo.update(
          { id: item.id, candidateId },
          {
            courseTrainingAreaId: Number(item.course),
            academicDegreeId: Number(item.academicLevel),
            institution: item.institution,
            graduationYear: Number(item.completionYear),
          },
        )
      } else {
        const entity = repo.create({
          candidateId,
          courseTrainingAreaId: Number(item.course),
          academicDegreeId: Number(item.academicLevel),
          institution: item.institution,
          graduationYear: Number(item.completionYear),
        })
        await repo.save(entity)
      }
    }
  })

  return this.myApplications(username)
}

async updateTeachingExperiences(
  username: string,
  candidateId: number,
  items: UpdateTeachingExperienceItemDto[],
) {
  await this.assertCandidateBelongsToUser(username, candidateId)

  await this.datasource.transaction(async (manager) => {
    const repo = manager.getRepository(TeachingExperienceEntity)

    const existingIds = items
      .filter((item): item is UpdateTeachingExperienceItemDto & { id: number } =>
        item.id != null,
      )
      .map((item) => item.id)

    if (existingIds.length) {
      await repo
        .createQueryBuilder()
        .delete()
        .where('candidateId = :candidateId', { candidateId })
        .andWhere('id NOT IN (:...ids)', { ids: existingIds })
        .execute()
    } else {
      await repo.delete({ candidateId })
    }

    for (const item of items) {
      if (item.id) {
        await repo.update(
          { id: item.id, candidateId },
          {
            course: item.course,
            institution: item.institution,
            discipline: item.discipline,
            startYear: item.startYear,
            endYear: item.endYear,
          },
        )
      } else {
        const entity = repo.create({
          candidateId,
          course: item.course,
          institution: item.institution,
          discipline: item.discipline,
          startYear: item.startYear,
          endYear: item.endYear,
        })
        await repo.save(entity)
      }
    }
  })

  return this.myApplications(username)
}

async uploadDocument(
  username: string,
  candidateId: number,
  documentTypeId: number,
  file: ApplicationFile,
) {
  await this.assertCandidateBelongsToUser(username, candidateId)

  const uploadResult = await this.storageService.upload(file)

  const existing = await this.teacherApplicationDocumentRepository.findOne({
    where: { candidateId, documentTypeId },
  })

  if (existing) {
    await this.teacherApplicationDocumentRepository.update(
      { id: existing.id },
      {
        fileName: uploadResult.file.filename,
        updatedAt: new Date(),
      },
    )
  } else {
    const document = this.teacherApplicationDocumentRepository.create({
      candidateId,
      documentTypeId,
      fileName: uploadResult.file.filename,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    await this.teacherApplicationDocumentRepository.save(document)
  }

  return this.myApplications(username)
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
  private async findUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    })
  }
  private async findUserByDocumentNumber(bi: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { bi },
    })
  }

  private async assertCandidateBelongsToUser(
  username: string,
  candidateId: number,
) {
  const person = await this.personRepository.findOne({
    where: { email: username },
  })

  if (!person) {
    throw new ForbiddenException('Utilizador não encontrado.')
  }

  const candidate = await this.candidateRepository
    .createQueryBuilder('candidate')
    .where('candidate.id = :candidateId', { candidateId })
    .andWhere(
      `JSON_EXISTS(candidate.person, '$?(@.pk_pessoa == $personId)' PASSING :personId AS "personId")`,
      { personId: person.id },
    )
    .getOne()

  if (!candidate) {
    throw new ForbiddenException(
      'Esta candidatura não pertence ao utilizador autenticado.',
    )
  }

  return candidate
}
// private async cleanupUploadedFiles(
//   uploaded: Array<{ documentTypeId: number; fileName: string }>,
// ) {
//  TOD: IMPLEMNTAR ROTA DE APAGAR ARQUIVOS NO UPLOAD SERVICES
//   await Promise.allSettled(
//     uploaded.map((item) =>
//       this.storageService.delete?.(item.fileName).catch(() => {
//         // best-effort: se a limpeza falhar, só regista, não bloqueia a resposta ao usuário
//         console.error(`Falha ao limpar ficheiro órfão: ${item.fileName}`)
//       }),
//     ),
//   )
// }
private async uploadAllApplicationFiles(
  personal: CreateApplicationPayload['personal'],
  files: CreateApplicationPayload['files'],
): Promise<Array<{ documentTypeId: number; fileName: string }>> {
  const uploadTasks: Array<{ documentTypeId: number; file: ApplicationFile }> = [
    { documentTypeId: personal.documentType, file: files.identificationDocument },
    { documentTypeId: TipoDocumentoNecessario.CURRICULUM_VITAE, file: files.cv },
    { documentTypeId: TipoDocumentoNecessario.CERTIFICADO, file: files.courseCertificate },
    {
      documentTypeId: TipoDocumentoNecessario.DECLARACAO_FORMACAO_PEDAGOGICA,
      file: files.pedagogicalAggregation,
    },
    ...files.certificates.map((certificate) => ({
      documentTypeId: TipoDocumentoNecessario.CERTIFICADO,
      file: certificate,
    })),
  ]

  const uploaded: Array<{ documentTypeId: number; fileName: string }> = []

  try {
    // Promise.all: se um falhar, os outros ainda em curso não são "desfeitos"
    // automaticamente, mas o catch abaixo lida com isso via allSettled.
    const results = await Promise.allSettled(
      uploadTasks.map(async (task) => {
        const result = await this.storageService.upload(task.file)
        return { documentTypeId: task.documentTypeId, fileName: result.file.filename }
      }),
    )

    const failed = results.filter(
      (r): r is PromiseRejectedResult => r.status === 'rejected',
    )
    const succeeded = results.filter(
      (r): r is PromiseFulfilledResult<{ documentTypeId: number; fileName: string }> =>
        r.status === 'fulfilled',
    )

    succeeded.forEach((r) => uploaded.push(r.value))

    if (failed.length) {
      // alguns uploads deram certo, outros não — limpa os que subiram
      // antes de propagar o erro, pra não deixar arquivos órfãos no storage.
      // await this.cleanupUploadedFiles(uploaded)
      throw new InternalServerErrorException(
        'Falha ao enviar um ou mais documentos. Tente novamente.',
      )
    }

    return uploaded
  } catch (error) {
    if (error instanceof InternalServerErrorException) throw error
    // await this.cleanupUploadedFiles(uploaded)
    throw new InternalServerErrorException(
      'Falha ao enviar os documentos da candidatura.',
    )
  }
}
}





