import { ChunksService } from './chunks.service';
import { Document } from '../../documents/entities/document.entity';
import { DocumentChunk } from './entities/document-chunk.entity';
import { EmbeddingsService } from '../../embeddings/embeddings.service';

describe('ChunksService', () => {
  let service: ChunksService;
  const chunkRepository = {
    create: jest.fn((chunk: Partial<DocumentChunk>) => chunk),
    save: jest.fn(),
  };
  const embeddingsService = {
    generateEmbedding: jest.fn(),
  };
  const document = { id: 'document-id' } as Document;

  beforeEach(() => {
    jest.clearAllMocks();
    chunkRepository.save.mockResolvedValue([]);
    embeddingsService.generateEmbedding
      .mockResolvedValueOnce([0.1, 0.2, 0.3])
      .mockResolvedValueOnce([0.4, 0.5, 0.6]);
    service = new ChunksService(
      chunkRepository as never,
      embeddingsService as unknown as EmbeddingsService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should preserve page numbers', () => {
    const pages = [
      {
        pageNumber: 1,
        text: 'First page content.',
      },
      {
        pageNumber: 2,
        text: 'Second page content.',
      },
    ];

    const result = service.chunkPages(pages);

    expect(result.length).toBe(2);

    expect(result[0].pageNumber).toBe(1);
    expect(result[1].pageNumber).toBe(2);
  });

  it('should increment chunk indexes correctly', () => {
    const pages = [
      {
        pageNumber: 1,
        text: 'First page.',
      },
      {
        pageNumber: 2,
        text: 'Second page.',
      },
      {
        pageNumber: 3,
        text: 'Third page.',
      },
    ];

    const result = service.chunkPages(pages);

    result.forEach((chunk, index) => {
      expect(chunk.chunkIndex).toBe(index);
    });
  });

  it('should ignore empty pages', () => {
    const pages = [
      {
        pageNumber: 1,
        text: '',
      },
      {
        pageNumber: 2,
        text: '   ',
      },
    ];

    const result = service.chunkPages(pages);

    expect(result).toEqual([]);
  });

  it('should merge small paragraphs when they fit', () => {
    const pages = [
      {
        pageNumber: 1,
        text: `First paragraph.

Second paragraph.`,
      },
    ];

    const result = service.chunkPages(pages);

    expect(result.length).toBe(1);

    expect(result[0].text).toContain('First paragraph.');

    expect(result[0].text).toContain('Second paragraph.');
  });

  it('should split a paragraph larger than maxChunkSize', () => {
    const largeParagraph = 'This is a sentence. '.repeat(200);

    const pages = [
      {
        pageNumber: 1,
        text: largeParagraph,
      },
    ];

    const result = service.chunkPages(pages);

    expect(result.length).toBeGreaterThan(1);

    result.forEach((chunk) => {
      expect(chunk.text.length).toBeLessThanOrEqual(2000);

      expect(chunk.pageNumber).toBe(1);
    });
  });

  it('should hard split when a single sentence exceeds maxChunkSize', () => {
    const hugeSentence = 'a'.repeat(5000);

    const pages = [
      {
        pageNumber: 1,
        text: hugeSentence,
      },
    ];

    const result = service.chunkPages(pages);

    expect(result.length).toBeGreaterThan(1);

    result.forEach((chunk) => {
      expect(chunk.text.length).toBeLessThanOrEqual(2000);
    });
  });

  it('should keep chunks under maxChunkSize', () => {
    const text = `
      ${'First sentence. '.repeat(100)}

      ${'Second sentence. '.repeat(100)}

      ${'Third sentence. '.repeat(100)}
    `;

    const pages = [
      {
        pageNumber: 1,
        text,
      },
    ];

    const result = service.chunkPages(pages);

    expect(result.length).toBeGreaterThan(0);

    result.forEach((chunk) => {
      expect(chunk.text.length).toBeLessThanOrEqual(2000);
    });
  });

  it('should continue chunk indexes across multiple pages', () => {
    const largeText = 'This is some document content. '.repeat(150);

    const pages = [
      {
        pageNumber: 1,
        text: largeText,
      },
      {
        pageNumber: 2,
        text: largeText,
      },
    ];

    const result = service.chunkPages(pages);

    expect(result.length).toBeGreaterThan(2);

    result.forEach((chunk, index) => {
      expect(chunk.chunkIndex).toBe(index);
    });
  });

  it('should save chunks for a document', async () => {
    const chunks = [
      { chunkIndex: 0, pageNumber: 1, text: 'First chunk.' },
      { chunkIndex: 1, pageNumber: 2, text: 'Second chunk.' },
    ];

    await service.saveChunks(chunks, document);

    expect(chunkRepository.save).toHaveBeenCalledWith([
      {
        document,
        chunkIndex: 0,
        pageNumber: 1,
        text: 'First chunk.',
        embedding: [0.1, 0.2, 0.3],
      },
      {
        document,
        chunkIndex: 1,
        pageNumber: 2,
        text: 'Second chunk.',
        embedding: [0.4, 0.5, 0.6],
      },
    ]);
    expect(embeddingsService.generateEmbedding).toHaveBeenNthCalledWith(
      1,
      'First chunk.',
      'DOCUMENT',
    );
    expect(embeddingsService.generateEmbedding).toHaveBeenNthCalledWith(
      2,
      'Second chunk.',
      'DOCUMENT',
    );
  });

  it('should not embed or save empty chunks', async () => {
    await service.saveChunks(
      [{ chunkIndex: 0, pageNumber: 1, text: '   ' }],
      document,
    );

    expect(embeddingsService.generateEmbedding).not.toHaveBeenCalled();
    expect(chunkRepository.save).not.toHaveBeenCalled();
  });
});
