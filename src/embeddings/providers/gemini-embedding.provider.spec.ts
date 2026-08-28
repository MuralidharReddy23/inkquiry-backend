import { ConfigService } from '@nestjs/config';
import { GeminiEmbeddingProvider } from './gemini-embedding.provider';

describe('GeminiEmbeddingProvider', () => {
  const getConfigValue = (key: string) => {
    const values: Record<string, string> = {
      GEMINI_API_KEY: 'test-key',
      GEMINI_EMBEDDING_MODEL: 'gemini-embedding-001',
      EMBEDDING_DIMENSIONS: '768',
    };

    return values[key];
  };
  const configService = {
    get: jest.fn<string | undefined, [string]>(getConfigValue),
  };

  let provider: GeminiEmbeddingProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    configService.get.mockImplementation(getConfigValue);
    provider = new GeminiEmbeddingProvider(
      configService as unknown as ConfigService,
    );
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          embedding: {
            values: [0.1, 0.2, 0.3],
          },
        }),
    });
  });

  it('should call Gemini and return embedding values', async () => {
    await expect(
      provider.generateEmbedding('hello', 'DOCUMENT'),
    ).resolves.toEqual([0.1, 0.2, 0.3]);

    const [, options] = (global.fetch as jest.Mock).mock.calls[0] as [
      string,
      RequestInit,
    ];

    expect(global.fetch).toHaveBeenCalledWith(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': 'test-key',
        },
      }),
    );
    expect(JSON.parse(options.body as string)).toMatchObject({
      taskType: 'RETRIEVAL_DOCUMENT',
      outputDimensionality: 768,
    });
  });

  it('should request retrieval query embeddings', async () => {
    await provider.generateEmbedding('hello', 'QUERY');

    const [, options] = (global.fetch as jest.Mock).mock.calls[0] as [
      string,
      RequestInit,
    ];

    expect(JSON.parse(options.body as string)).toMatchObject({
      taskType: 'RETRIEVAL_QUERY',
    });
  });

  it('should require an API key', async () => {
    configService.get.mockImplementation((key: string) => {
      if (key === 'GEMINI_API_KEY') return undefined;
      if (key === 'GEMINI_EMBEDDING_MODEL') return 'gemini-embedding-001';
      if (key === 'EMBEDDING_DIMENSIONS') return '768';
      return undefined;
    });

    await expect(
      provider.generateEmbedding('hello', 'DOCUMENT'),
    ).rejects.toThrow('GEMINI_API_KEY');
  });

  it('should throw when Gemini returns an error', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
    });

    await expect(
      provider.generateEmbedding('hello', 'DOCUMENT'),
    ).rejects.toThrow('401');
  });
});
