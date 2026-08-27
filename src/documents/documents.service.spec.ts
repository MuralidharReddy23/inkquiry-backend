import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IngestionService } from '../ingestion/ingestion.service';
import { DocumentsService } from './documents.service';
import { Document } from './entities/document.entity';

describe('DocumentsService', () => {
  let service: DocumentsService;
  const ingestionService = {
    extractContent: jest.fn(),
  };
  const documentsRepository = {
    create: jest.fn((document: Partial<Document>) => document),
    save: jest.fn((document: Partial<Document>) =>
      Promise.resolve({
        id: 'document-id',
        ...document,
      }),
    ),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    ingestionService.extractContent.mockResolvedValue({
      totalPages: 1,
      totalChunks: 1,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        { provide: IngestionService, useValue: ingestionService },
        {
          provide: getRepositoryToken(Document),
          useValue: documentsRepository,
        },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return page-aware extracted content', async () => {
    await expect(
      service.processDocument({
        buffer: Buffer.from('pdf'),
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
      } as Express.Multer.File),
    ).resolves.toEqual({
      documentId: 'document-id',
      fileName: 'test.pdf',
      status: 'COMPLETED',
      totalPages: 1,
      totalChunks: 1,
    });
    expect(documentsRepository.save).toHaveBeenCalledWith({
      fileName: 'test.pdf',
      mimeType: 'application/pdf',
      status: 'PROCESSING',
    });
    expect(ingestionService.extractContent).toHaveBeenCalledWith(
      Buffer.from('pdf'),
      {
        id: 'document-id',
        fileName: 'test.pdf',
        mimeType: 'application/pdf',
        status: 'PROCESSING',
      },
    );
  });
});
