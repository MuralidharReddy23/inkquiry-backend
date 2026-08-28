import { ConfigService } from '@nestjs/config';
import { GroqLlmProvider } from './groq-llm.provider';

describe('GroqLlmProvider', () => {
  const getConfigValue = (key: string) => {
    const values: Record<string, string> = {
      GROQ_API_KEY: 'test-groq-key',
      GROQ_LLM_MODEL: 'openai/gpt-oss-20b',
    };

    return values[key];
  };
  const configService = {
    get: jest.fn<string | undefined, [string]>(getConfigValue),
  };

  let provider: GroqLlmProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    configService.get.mockImplementation(getConfigValue);
    provider = new GroqLlmProvider(configService as unknown as ConfigService);
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          choices: [
            {
              message: {
                content: 'fallback answer',
              },
            },
          ],
        }),
    });
  });

  it('should call Groq chat completions and return response text', async () => {
    await expect(provider.generate('prompt')).resolves.toBe('fallback answer');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.groq.com/openai/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-groq-key',
        },
      }),
    );

    const [, options] = (global.fetch as jest.Mock).mock.calls[0] as [
      string,
      RequestInit,
    ];

    expect(JSON.parse(options.body as string)).toMatchObject({
      model: 'openai/gpt-oss-20b',
      messages: [{ role: 'user', content: 'prompt' }],
    });
  });

  it('should require a Groq API key', async () => {
    configService.get.mockImplementation((key: string) => {
      if (key === 'GROQ_API_KEY') return undefined;
      if (key === 'GROQ_LLM_MODEL') return 'openai/gpt-oss-20b';
      return undefined;
    });

    await expect(provider.generate('prompt')).rejects.toThrow('GROQ_API_KEY');
  });

  it('should include Groq error details', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: () =>
        Promise.resolve({
          error: {
            message: 'Rate limit exceeded',
          },
        }),
    });

    await expect(provider.generate('prompt')).rejects.toThrow(
      '429: Rate limit exceeded',
    );
  });
});
