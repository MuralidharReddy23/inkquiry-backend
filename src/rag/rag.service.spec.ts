import { Test, TestingModule } from '@nestjs/testing';
import { LlmService } from '../llm/llm.service';
import { RetrievalService } from '../retrieval/retrieval.service';
import { PromptBuilderService } from './prompt-builder.service';
import { RagService } from './rag.service';

describe('RagService', () => {
  let service: RagService;
  const retrievalService = {
    search: jest.fn(),
  };
  const llmService = {
    generate: jest.fn(),
  };
  const promptBuilderService = {
    build: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    retrievalService.search.mockResolvedValue([
      {
        pageNumber: 2,
        chunkIndex: 1,
        text: 'SQL experience',
        similarity: 0.88,
      },
    ]);
    promptBuilderService.build.mockReturnValue('prompt');
    llmService.generate.mockResolvedValue('answer');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RagService,
        { provide: RetrievalService, useValue: retrievalService },
        { provide: LlmService, useValue: llmService },
        { provide: PromptBuilderService, useValue: promptBuilderService },
      ],
    }).compile();

    service = module.get<RagService>(RagService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should retrieve chunks, build a prompt, and return answer with citations', async () => {
    await expect(
      service.ask('document-id', 'What experience?', 3),
    ).resolves.toEqual({
      answer: 'answer',
      citations: [
        {
          pageNumber: 2,
          chunkIndex: 1,
          similarity: 0.88,
        },
      ],
    });

    expect(retrievalService.search).toHaveBeenCalledWith(
      'document-id',
      'What experience?',
      3,
    );
    expect(promptBuilderService.build).toHaveBeenCalledWith(
      'What experience?',
      [
        {
          pageNumber: 2,
          chunkIndex: 1,
          text: 'SQL experience',
          similarity: 0.88,
        },
      ],
    );
    expect(llmService.generate).toHaveBeenCalledWith('prompt');
  });
});
