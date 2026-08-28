import { Module } from '@nestjs/common';
import { EmbeddingsService } from './embeddings.service';
import { GeminiEmbeddingProvider } from './providers/gemini-embedding.provider';

@Module({
  providers: [
    EmbeddingsService,
    GeminiEmbeddingProvider,
    {
      provide: 'EMBEDDING_PROVIDER',
      useExisting: GeminiEmbeddingProvider,
    },
  ],
  exports: [EmbeddingsService],
})
export class EmbeddingsModule {}
