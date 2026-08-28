import { Module } from '@nestjs/common';
import { LlmModule } from '../llm/llm.module';
import { RetrievalModule } from '../retrieval/retrieval.module';
import { PromptBuilderService } from './prompt-builder.service';
import { RagController } from './rag.controller';
import { RagService } from './rag.service';

@Module({
  imports: [RetrievalModule, LlmModule],
  controllers: [RagController],
  providers: [RagService, PromptBuilderService],
})
export class RagModule {}
