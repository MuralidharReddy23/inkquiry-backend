import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LlmProvider } from './llm-provider.interface';

interface GeminiGenerateResponse {
  error?: {
    message?: string;
  };
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

@Injectable()
export class GeminiLlmProvider implements LlmProvider {
  constructor(private readonly configService: ConfigService) {}

  async generate(prompt: string): Promise<string> {
    const response = await fetch(this.getUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': this.getApiKey(),
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    const body = (await response.json()) as GeminiGenerateResponse;

    if (!response.ok) {
      const message = body.error?.message ? `: ${body.error.message}` : '';
      throw new Error(
        `Gemini LLM failed with status ${response.status}${message}`,
      );
    }

    const text = body.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter(Boolean)
      .join('');

    if (!text) {
      throw new Error('Gemini LLM response did not include text');
    }

    return text;
  }

  private getUrl(): string {
    return `https://generativelanguage.googleapis.com/v1beta/models/${this.getModel()}:generateContent`;
  }

  private getApiKey(): string {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is required to generate an answer');
    }

    return apiKey;
  }

  private getModel(): string {
    const model =
      this.configService.get<string>('GEMINI_LLM_MODEL') ?? 'gemini-3.6-flash';

    return model.replace(/^models\//, '');
  }
}
