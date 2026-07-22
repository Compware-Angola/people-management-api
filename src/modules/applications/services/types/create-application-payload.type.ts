import { CreateApplicationDto } from '../../dto/create-application.dto'
import { TeacherApplicationFiles } from './teacher-application-files.type'

export interface CreateApplicationPayload extends CreateApplicationDto {
  files: TeacherApplicationFiles
}
