import { PromptBuilderService } from './prompt-builder.service';

describe('PromptBuilderService', () => {
  let service: PromptBuilderService;

  beforeEach(() => {
    service = new PromptBuilderService();
  });

  it('should build a prompt with document context and question', () => {
    const prompt = service.build('What experience?', [
      {
        pageNumber: 2,
        chunkIndex: 1,
        text: 'SQL experience',
        similarity: 0.88,
      },
    ]);

    expect(prompt).toContain('[Page 2, Chunk 1]');
    expect(prompt).toContain('SQL experience');
    expect(prompt).toContain('What experience?');
    expect(prompt).toContain('Do not invent facts.');
  });
});
