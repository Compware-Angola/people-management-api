import { ApplicationFile } from '../../../../commons/types/application-file.type'

export interface TeacherApplicationFiles {
  identificationDocument: ApplicationFile

  cv: ApplicationFile

  courseCertificate: ApplicationFile

  pedagogicalAggregation: ApplicationFile

  certificates: ApplicationFile[]
}
