import 'tsconfig-paths/register'
import 'tsconfig-paths/register'
import { DataSource } from 'typeorm'
import { typeOrmConfig } from '../commons/utils/typeorm-config'

export default new DataSource(typeOrmConfig)
