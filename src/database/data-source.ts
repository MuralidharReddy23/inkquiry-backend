import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Document } from '../documents/entities/document.entity';
import { DocumentChunk } from '../ingestion/chunks/entities/document-chunk.entity';

config();

const databaseUrl = process.env.DATABASE_URL;

const dataSourceOptions: DataSourceOptions = databaseUrl
  ? {
      type: 'postgres',
      url: databaseUrl,
      ssl: {
        rejectUnauthorized: false,
      },
      entities: [Document, DocumentChunk],
      migrations: ['src/database/migrations/*.ts'],
      synchronize: false,
    }
  : {
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Document, DocumentChunk],
      migrations: ['src/database/migrations/*.ts'],
      synchronize: false,
    };

export default new DataSource(dataSourceOptions);
