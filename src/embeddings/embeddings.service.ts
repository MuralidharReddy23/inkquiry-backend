import { Injectable, Inject } from '@nestjs/common';
import type { EmbeddingProvider } from './providers/embedding-provider.interface';
@Injectable()
export class EmbeddingsService {
    constructor(
    @Inject('EMBEDDING_PROVIDER')
    private readonly provider: EmbeddingProvider,
  ) {}

  generateEmbedding(text: string): Promise<number[]> {
    return this.provider.generateEmbedding(text);
  }
}
