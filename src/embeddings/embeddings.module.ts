import { Module } from '@nestjs/common';
import { EmbeddingsService } from './embeddings.service';

@Module({
  providers: [EmbeddingsService,
    {
      provide: 'EMBEDDING_PROVIDER',
      useClass: GeminiEmbeddingProvider,
    },
  ],
})
export class EmbeddingsModule {}
