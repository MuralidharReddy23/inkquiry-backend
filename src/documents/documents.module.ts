import { TypeOrmModule } from '@nestjs/typeorm';

import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { Document } from './entities/document.entity';
import { IngestionModule } from '../ingestion/ingestion.module';

@Module({
  imports: [TypeOrmModule.forFeature([Document]), IngestionModule],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}
