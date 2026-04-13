import 'dotenv/config';
import { DataSource } from 'typeorm';
import { ProjectEntity } from './typeorm/entities/project.entity';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [ProjectEntity],
  migrations: ['src/infrastructure/database/typeorm/migrations/*{.ts,.js}'],
});
