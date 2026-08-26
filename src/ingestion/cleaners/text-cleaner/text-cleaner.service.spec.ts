import { Test, TestingModule } from '@nestjs/testing';
import { TextCleanerService } from './text-cleaner.service';

describe('TextCleanerService', () => {
  let service: TextCleanerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TextCleanerService],
    }).compile();

    service = module.get<TextCleanerService>(TextCleanerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should clean extracted PDF text', () => {
    expect(
      service.clean(' applica-\r\ntion\rwrapped\nline\n\n\n next  paragraph '),
    ).toBe('application wrapped line\n\nnext paragraph');
  });
});
