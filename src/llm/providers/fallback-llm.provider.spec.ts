import { FallbackLlmProvider } from './fallback-llm.provider';
import { GeminiLlmProvider } from './gemini-llm.provider';
import { GroqLlmProvider } from './groq-llm.provider';

describe('FallbackLlmProvider', () => {
  const geminiProvider = {
    generate: jest.fn(),
  };
  const groqProvider = {
    generate: jest.fn(),
  };
  let provider: FallbackLlmProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    provider = new FallbackLlmProvider(
      geminiProvider as unknown as GeminiLlmProvider,
      groqProvider as unknown as GroqLlmProvider,
    );
  });

  it('should use Gemini when the first attempt succeeds', async () => {
    geminiProvider.generate.mockResolvedValue('gemini answer');

    await expect(provider.generate('prompt')).resolves.toBe('gemini answer');

    expect(geminiProvider.generate).toHaveBeenCalledTimes(1);
    expect(groqProvider.generate).not.toHaveBeenCalled();
  });

  it('should try Gemini twice before falling back to Groq', async () => {
    geminiProvider.generate
      .mockRejectedValueOnce(new Error('Gemini high demand'))
      .mockRejectedValueOnce(new Error('Gemini high demand again'));
    groqProvider.generate.mockResolvedValue('groq answer');

    await expect(provider.generate('prompt')).resolves.toBe('groq answer');

    expect(geminiProvider.generate).toHaveBeenCalledTimes(2);
    expect(groqProvider.generate).toHaveBeenCalledWith('prompt');
  });

  it('should throw a combined error when all providers fail', async () => {
    geminiProvider.generate
      .mockRejectedValueOnce(new Error('Gemini failed once'))
      .mockRejectedValueOnce(new Error('Gemini failed twice'));
    groqProvider.generate.mockRejectedValue(new Error('Groq failed'));

    await expect(provider.generate('prompt')).rejects.toThrow(
      'All LLM providers failed: Gemini failed once | Gemini failed twice | Groq failed',
    );
  });
});
