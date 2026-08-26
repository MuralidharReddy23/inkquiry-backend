import { Test, TestingModule } from '@nestjs/testing';
import { TextCleanerService } from './cleaners/text-cleaner/text-cleaner.service';
import { IngestionService } from './ingestion.service';
import { ParsersService } from './parsers/parsers.service';

describe('IngestionService', () => {
  let service: IngestionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IngestionService, ParsersService, TextCleanerService],
    }).compile();

    service = module.get<IngestionService>(IngestionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
