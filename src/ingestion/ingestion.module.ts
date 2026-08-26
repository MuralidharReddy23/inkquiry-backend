import { Module } from '@nestjs/common';
import { TextCleanerService } from './cleaners/text-cleaner/text-cleaner.service';
import { IngestionService } from './ingestion.service';
import { ParsersService } from './parsers/parsers.service';

@Module({
  providers: [IngestionService, ParsersService, TextCleanerService],
  exports: [IngestionService],
})
export class IngestionModule {}
