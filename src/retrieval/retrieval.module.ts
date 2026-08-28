import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RetrievalService } from './retrieval.service';
import { RetrievalController } from './retrieval.controller';
import { DocumentChunk } from '../ingestion/chunks/entities/document-chunk.entity';
import { EmbeddingsModule } from '../embeddings/embeddings.module';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentChunk]), EmbeddingsModule],
  controllers: [RetrievalController],
  providers: [RetrievalService],
  exports: [RetrievalService],
})
export class RetrievalModule {}
