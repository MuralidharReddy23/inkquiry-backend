import { Test, TestingModule } from '@nestjs/testing';
import { RagController } from './rag.controller';
import { RagService } from './rag.service';

describe('RagController', () => {
  let controller: RagController;
  const ragService = {
    ask: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    ragService.ask.mockResolvedValue({
      answer: 'answer',
      citations: [],
    });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RagController],
      providers: [{ provide: RagService, useValue: ragService }],
    }).compile();

    controller = module.get<RagController>(RagController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should ask with default limit', async () => {
    await expect(
      controller.ask({
        documentId: 'document-id',
        question: 'question',
      }),
    ).resolves.toEqual({
      answer: 'answer',
      citations: [],
    });

    expect(ragService.ask).toHaveBeenCalledWith('document-id', 'question', 5);
  });
});
