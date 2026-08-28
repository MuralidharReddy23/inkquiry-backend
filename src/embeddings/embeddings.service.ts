import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  EmbeddingProvider,
  EmbeddingType,
} from './providers/embedding-provider.interface';

@Injectable()
export class EmbeddingsService {
  constructor(
    @Inject('EMBEDDING_PROVIDER')
    private readonly provider: EmbeddingProvider,
    private readonly configService: ConfigService,
  ) {}

  async generateEmbedding(
    text: string,
    type: EmbeddingType,
  ): Promise<number[]> {
    const embedding = await this.provider.generateEmbedding(text, type);
    this.validateDimensions(embedding);
    return embedding;
  }

  private validateDimensions(embedding: number[]): void {
    const expectedDimensions = this.getExpectedDimensions();

    if (embedding.length !== expectedDimensions) {
      throw new Error(
        `Unexpected embedding dimension: ${embedding.length}. Expected ${expectedDimensions}.`,
      );
    }
  }

  private getExpectedDimensions(): number {
    return Number(
      this.configService.get<string>('EMBEDDING_DIMENSIONS') ??
        this.configService.get<string>('GEMINI_EMBEDDING_DIMENSIONS') ??
        768,
    );
  }
}
