import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EmbeddingsService } from '../embeddings/embeddings.service';
import { DocumentChunk } from '../ingestion/chunks/entities/document-chunk.entity';

export interface RetrievalSearchResult {
  chunkIndex: number;
  pageNumber: number;
  text: string;
  similarity: number;
}

@Injectable()
export class RetrievalService {
  constructor(
    @InjectRepository(DocumentChunk)
    private readonly chunkRepository: Repository<DocumentChunk>,

    private readonly embeddingsService: EmbeddingsService,
  ) {}

  async search(
    documentId: string,
    question: string,
    limit = 5,
  ): Promise<RetrievalSearchResult[]> {
    if (!documentId?.trim()) {
      throw new BadRequestException('documentId is required');
    }

    if (!question?.trim()) {
      throw new BadRequestException('question is required');
    }

    const queryEmbedding = await this.embeddingsService.generateEmbedding(
      question,
      'QUERY',
    );

    const results = (await this.chunkRepository.query(
      `
      SELECT
        id,
        "documentId",
        "chunkIndex",
        "pageNumber",
        text,
        1 - (embedding <=> $1::vector) AS similarity
      FROM document_chunks
      WHERE "documentId" = $2
        AND embedding IS NOT NULL
      ORDER BY embedding <=> $1::vector
      LIMIT $3
      `,
      [
        this.toVectorLiteral(queryEmbedding),
        documentId,
        this.normalizeLimit(limit),
      ],
    )) as unknown as RetrievalSearchResult[];

    return results;
  }

  private toVectorLiteral(embedding: number[]): string {
    return `[${embedding.join(',')}]`;
  }

  private normalizeLimit(limit: number): number {
    return Math.min(Math.max(Math.floor(limit), 1), 20);
  }
}
