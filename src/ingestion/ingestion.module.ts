import { Module } from '@nestjs/common';
import { ChunksService } from './chunks/chunks.service';
import { TextCleanerService } from './cleaners/text-cleaner/text-cleaner.service';
import { IngestionService } from './ingestion.service';
import { ParsersService } from './parsers/parsers.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { EmbeddingsModule } from '../embeddings/embeddings.module';
import { DocumentChunk } from './chunks/entities/document-chunk.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentChunk]), EmbeddingsModule],
  providers: [
    IngestionService,
    ParsersService,
    TextCleanerService,
    ChunksService,
  ],
  exports: [IngestionService],
})
export class IngestionModule {}
