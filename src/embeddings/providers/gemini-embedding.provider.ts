import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  EmbeddingProvider,
  EmbeddingType,
} from './embedding-provider.interface';

interface GeminiEmbeddingResponse {
  embedding?: {
    values?: number[];
  };
}

@Injectable()
export class GeminiEmbeddingProvider implements EmbeddingProvider {
  constructor(private readonly configService: ConfigService) {}

  async generateEmbedding(
    text: string,
    type: EmbeddingType,
  ): Promise<number[]> {
    const response = await fetch(this.getUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': this.getApiKey(),
      },
      body: JSON.stringify({
        model: `models/${this.getModel()}`,
        content: {
          parts: [{ text }],
        },
        taskType: this.getTaskType(type),
        outputDimensionality: this.getDimensions(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini embedding failed with status ${response.status}`);
    }

    const body = (await response.json()) as GeminiEmbeddingResponse;
    const values = body.embedding?.values;

    if (!values?.length) {
      throw new Error('Gemini embedding response did not include values');
    }

    return values;
  }

  private getUrl(): string {
    return `https://generativelanguage.googleapis.com/v1beta/models/${this.getModel()}:embedContent`;
  }

  private getApiKey(): string {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is required to generate embeddings');
    }

    return apiKey;
  }

  private getModel(): string {
    const model =
      this.configService.get<string>('GEMINI_EMBEDDING_MODEL') ??
      'gemini-embedding-001';

    return model.replace(/^models\//, '');
  }

  private getDimensions(): number {
    return Number(
      this.configService.get<string>('EMBEDDING_DIMENSIONS') ??
        this.configService.get<string>('GEMINI_EMBEDDING_DIMENSIONS') ??
        768,
    );
  }

  private getTaskType(type: EmbeddingType): string {
    return type === 'QUERY' ? 'RETRIEVAL_QUERY' : 'RETRIEVAL_DOCUMENT';
  }
}
