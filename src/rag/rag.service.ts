import { Injectable } from '@nestjs/common';
import { LlmService } from '../llm/llm.service';
import {
  RetrievalSearchResult,
  RetrievalService,
} from '../retrieval/retrieval.service';
import { PromptBuilderService } from './prompt-builder.service';

@Injectable()
export class RagService {
  constructor(
    private readonly retrievalService: RetrievalService,
    private readonly llmService: LlmService,
    private readonly promptBuilderService: PromptBuilderService,
  ) {}

  async ask(documentId: string, question: string, limit = 5) {
    const chunks = await this.retrievalService.search(
      documentId,
      question,
      limit,
    );
    const prompt = this.promptBuilderService.build(question, chunks);
    const answer = await this.llmService.generate(prompt);

    return {
      answer,
      citations: this.buildCitations(chunks),
    };
  }

  private buildCitations(chunks: RetrievalSearchResult[]) {
    return chunks.map((chunk) => ({
      pageNumber: chunk.pageNumber,
      chunkIndex: chunk.chunkIndex,
      similarity: chunk.similarity,
    }));
  }
}
