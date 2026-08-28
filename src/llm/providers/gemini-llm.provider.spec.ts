import { ConfigService } from '@nestjs/config';
import { GeminiLlmProvider } from './gemini-llm.provider';

describe('GeminiLlmProvider', () => {
  const getConfigValue = (key: string) => {
    const values: Record<string, string> = {
      GEMINI_API_KEY: 'test-key',
      GEMINI_LLM_MODEL: 'gemini-3.6-flash',
    };

    return values[key];
  };
  const configService = {
    get: jest.fn<string | undefined, [string]>(getConfigValue),
  };

  let provider: GeminiLlmProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    configService.get.mockImplementation(getConfigValue);
    provider = new GeminiLlmProvider(configService as unknown as ConfigService);
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          candidates: [
            {
              content: {
                parts: [{ text: 'answer' }],
              },
            },
          ],
        }),
    });
  });

  it('should call Gemini and return response text', async () => {
    await expect(provider.generate('prompt')).resolves.toBe('answer');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': 'test-key',
        },
      }),
    );
  });

  it('should require an API key', async () => {
    configService.get.mockImplementation((key: string) => {
      if (key === 'GEMINI_API_KEY') return undefined;
      if (key === 'GEMINI_LLM_MODEL') return 'gemini-3.6-flash';
      return undefined;
    });

    await expect(provider.generate('prompt')).rejects.toThrow('GEMINI_API_KEY');
  });

  it('should throw when Gemini returns an error', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: () =>
        Promise.resolve({
          error: {
            message: 'API key invalid',
          },
        }),
    });

    await expect(provider.generate('prompt')).rejects.toThrow(
      '401: API key invalid',
    );
  });
});
