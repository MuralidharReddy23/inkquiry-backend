import { Test, TestingModule } from '@nestjs/testing';
import { Document } from '../documents/entities/document.entity';
import { ChunksService } from './chunks/chunks.service';
import { TextCleanerService } from './cleaners/text-cleaner/text-cleaner.service';
import { IngestionService } from './ingestion.service';
import { ParsersService } from './parsers/parsers.service';

describe('IngestionService', () => {
  let service: IngestionService;
  const parsersService = {
    extractContent: jest.fn(),
  };
  const textCleanerService = {
    clean: jest.fn((text: string) => text.trim()),
  };
  const chunksService = {
    chunkPages: jest.fn(),
    saveChunks: jest.fn(),
  };
  const document = { id: 'document-id' } as Document;

  beforeEach(async () => {
    jest.clearAllMocks();

    parsersService.extractContent.mockResolvedValue({
      totalPages: 2,
      pages: [
        { pageNumber: 1, text: ' first page ' },
        { pageNumber: 2, text: ' second page ' },
      ],
    });
    chunksService.chunkPages.mockReturnValue([]);
    chunksService.saveChunks.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngestionService,
        { provide: ParsersService, useValue: parsersService },
        { provide: TextCleanerService, useValue: textCleanerService },
        { provide: ChunksService, useValue: chunksService },
      ],
    }).compile();

    service = module.get<IngestionService>(IngestionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return summary metadata', async () => {
    await expect(
      service.extractContent(Buffer.from('pdf'), document),
    ).resolves.toEqual({
      totalPages: 2,
      totalChunks: 0,
    });
  });

  it('should save chunks from cleaned pages', async () => {
    chunksService.chunkPages.mockReturnValue([
      { chunkIndex: 0, pageNumber: 1, text: 'first page' },
      { chunkIndex: 1, pageNumber: 2, text: 'second page' },
    ]);

    await expect(
      service.extractContent(Buffer.from('pdf'), document),
    ).resolves.toEqual({
      totalPages: 2,
      totalChunks: 2,
    });
    expect(chunksService.chunkPages).toHaveBeenCalledWith([
      { pageNumber: 1, text: 'first page' },
      { pageNumber: 2, text: 'second page' },
    ]);
    expect(chunksService.saveChunks).toHaveBeenCalledWith(
      [
        { chunkIndex: 0, pageNumber: 1, text: 'first page' },
        { chunkIndex: 1, pageNumber: 2, text: 'second page' },
      ],
      document,
    );
  });
});
