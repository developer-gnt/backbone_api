import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenvConfig({ path: resolve(__dirname, '../../.env') });

const config = {
  type: 'postgres',
  host: `${process.env.DATABASE_HOST}`,
  port: parseInt(`${process.env.DATABASE_PORT}`),
  username: `${process.env.DATABASE_USERNAME}`,
  password: `${process.env.DATABASE_PASSWORD}`,
  database: `${process.env.DATABASE_NAME}`,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  cli: {
    migrationsDir: 'src/migrations',
  },
  autoLoadEntities: true,
  synchronize: false,
  schema: 'main',
  migrationsRun: false,
  logging: true,
};

export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
