import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DocumentsModule } from './documents/documents.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { EmbeddingsModule } from './embeddings/embeddings.module';
import { RetrievalModule } from './retrieval/retrieval.module';
import { RagModule } from './rag/rag.module';
import { LlmModule } from './llm/llm.module';

@Module({
  imports: [DocumentsModule, IngestionModule, EmbeddingsModule, RetrievalModule, RagModule, LlmModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
