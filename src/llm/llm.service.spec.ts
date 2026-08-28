import { Test, TestingModule } from '@nestjs/testing';
import { LlmService } from './llm.service';

describe('LlmService', () => {
  let service: LlmService;
  const provider = {
    generate: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    provider.generate.mockResolvedValue('answer');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LlmService,
        {
          provide: 'LLM_PROVIDER',
          useValue: provider,
        },
      ],
    }).compile();

    service = module.get<LlmService>(LlmService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should delegate generation to the provider', async () => {
    await expect(service.generate('prompt')).resolves.toBe('answer');
    expect(provider.generate).toHaveBeenCalledWith('prompt');
  });
});
