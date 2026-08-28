import { Injectable } from '@nestjs/common';
import { GeminiLlmProvider } from './gemini-llm.provider';
import { GroqLlmProvider } from './groq-llm.provider';
import { LlmProvider } from './llm-provider.interface';

@Injectable()
export class FallbackLlmProvider implements LlmProvider {
  constructor(
    private readonly geminiProvider: GeminiLlmProvider,
    private readonly groqProvider: GroqLlmProvider,
  ) {}

  async generate(prompt: string): Promise<string> {
    const errors: Error[] = [];

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        return await this.geminiProvider.generate(prompt);
      } catch (error) {
        errors.push(error as Error);
      }
    }

    try {
      return await this.groqProvider.generate(prompt);
    } catch (error) {
      errors.push(error as Error);
      throw new Error(
        `All LLM providers failed: ${errors
          .map((providerError) => providerError.message)
          .join(' | ')}`,
      );
    }
  }
}
