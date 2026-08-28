import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmbeddingsService } from './embeddings.service';

describe('EmbeddingsService', () => {
  let service: EmbeddingsService;
  const provider = {
    generateEmbedding: jest.fn(),
  };
  const configService = {
    get: jest.fn((key: string) => {
      if (key === 'EMBEDDING_DIMENSIONS') return '3';
      return undefined;
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    provider.generateEmbedding.mockResolvedValue([0.1, 0.2, 0.3]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmbeddingsService,
        {
          provide: 'EMBEDDING_PROVIDER',
          useValue: provider,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    service = module.get<EmbeddingsService>(EmbeddingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should delegate document embedding generation to the provider', async () => {
    await expect(
      service.generateEmbedding('hello', 'DOCUMENT'),
    ).resolves.toEqual([0.1, 0.2, 0.3]);
    expect(provider.generateEmbedding).toHaveBeenCalledWith(
      'hello',
      'DOCUMENT',
    );
  });

  it('should delegate query embedding generation to the provider', async () => {
    await expect(service.generateEmbedding('hello', 'QUERY')).resolves.toEqual([
      0.1, 0.2, 0.3,
    ]);
    expect(provider.generateEmbedding).toHaveBeenCalledWith('hello', 'QUERY');
  });

  it('should reject unexpected embedding dimensions', async () => {
    provider.generateEmbedding.mockResolvedValue([0.1, 0.2]);

    await expect(
      service.generateEmbedding('hello', 'DOCUMENT'),
    ).rejects.toThrow('Unexpected embedding dimension: 2. Expected 3.');
  });
});
