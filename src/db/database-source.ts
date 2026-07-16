import 'tsconfig-paths/register';
import { typeOrmConfig } from 'src/modules/utils/typeorm-config';
import 'tsconfig-paths/register';
import { DataSource } from 'typeorm';

export default new DataSource(typeOrmConfig);
