import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DocumentsModule } from './documents/documents.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { EmbeddingsModule } from './embeddings/embeddings.module';
import { RetrievalModule } from './retrieval/retrieval.module';
import { RagModule } from './rag/rag.module';
import { LlmModule } from './llm/llm.module';
import { buildTypeOrmModuleOptions } from './database/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: buildTypeOrmModuleOptions,
    }),

    DocumentsModule,
    IngestionModule,
    EmbeddingsModule,
    RetrievalModule,
    RagModule,
    LlmModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
