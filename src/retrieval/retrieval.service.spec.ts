import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EmbeddingsService } from '../embeddings/embeddings.service';
import { DocumentChunk } from '../ingestion/chunks/entities/document-chunk.entity';
import { RetrievalService } from './retrieval.service';

describe('RetrievalService', () => {
  let service: RetrievalService;
  const chunkRepository = {
    query: jest.fn(),
  };
  const embeddingsService = {
    generateEmbedding: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    embeddingsService.generateEmbedding.mockResolvedValue([0.1, 0.2, 0.3]);
    chunkRepository.query.mockResolvedValue([
      {
        chunkIndex: 0,
        pageNumber: 1,
        text: 'Matched chunk',
        similarity: 0.9,
      },
    ]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RetrievalService,
        {
          provide: getRepositoryToken(DocumentChunk),
          useValue: chunkRepository,
        },
        {
          provide: EmbeddingsService,
          useValue: embeddingsService,
        },
      ],
    }).compile();

    service = module.get<RetrievalService>(RetrievalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate a query embedding and return matching chunks', async () => {
    await expect(
      service.search('document-id', 'What is this about?', 5),
    ).resolves.toEqual([
      {
        chunkIndex: 0,
        pageNumber: 1,
        text: 'Matched chunk',
        similarity: 0.9,
      },
    ]);

    expect(embeddingsService.generateEmbedding).toHaveBeenCalledWith(
      'What is this about?',
      'QUERY',
    );
    expect(chunkRepository.query).toHaveBeenCalledWith(expect.any(String), [
      '[0.1,0.2,0.3]',
      'document-id',
      5,
    ]);
  });

  it('should clamp the search limit', async () => {
    await service.search('document-id', 'question', 100);

    expect(chunkRepository.query).toHaveBeenCalledWith(expect.any(String), [
      '[0.1,0.2,0.3]',
      'document-id',
      20,
    ]);
  });

  it('should require a documentId', async () => {
    await expect(service.search('', 'question')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('should require a question', async () => {
    await expect(service.search('document-id', '')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
