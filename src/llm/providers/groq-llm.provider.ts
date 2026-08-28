import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LlmProvider } from './llm-provider.interface';

interface GroqChatCompletionResponse {
  error?: {
    message?: string;
  };
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

@Injectable()
export class GroqLlmProvider implements LlmProvider {
  constructor(private readonly configService: ConfigService) {}

  async generate(prompt: string): Promise<string> {
    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getApiKey()}`,
        },
        body: JSON.stringify({
          model: this.getModel(),
          messages: [{ role: 'user', content: prompt }],
        }),
      },
    );

    const body = (await response.json()) as GroqChatCompletionResponse;

    if (!response.ok) {
      const message = body.error?.message ? `: ${body.error.message}` : '';
      throw new Error(
        `Groq LLM failed with status ${response.status}${message}`,
      );
    }

    const text = body.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error('Groq LLM response did not include text');
    }

    return text;
  }

  private getApiKey(): string {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');

    if (!apiKey) {
      throw new Error('GROQ_API_KEY is required to generate a fallback answer');
    }

    return apiKey;
  }

  private getModel(): string {
    return (
      this.configService.get<string>('GROQ_LLM_MODEL') ?? 'openai/gpt-oss-20b'
    );
  }
}
