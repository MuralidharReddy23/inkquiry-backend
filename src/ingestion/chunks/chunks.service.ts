import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../../documents/entities/document.entity';
import { EmbeddingsService } from '../../embeddings/embeddings.service';
import { DocumentChunk } from './entities/document-chunk.entity';

export interface PageContent {
  pageNumber: number;
  text: string;
}

export interface ChunkContent {
  chunkIndex: number;
  pageNumber: number;
  text: string;
}

@Injectable()
export class ChunksService {
  constructor(
    @InjectRepository(DocumentChunk)
    private readonly chunkRepository: Repository<DocumentChunk>,
    private readonly embeddingsService: EmbeddingsService,
  ) {}

  // Keep this low temporarily while testing.
  // Later we can move this to config/env.
  private readonly maxChunkSize = 2000;

  chunkPages(pages: PageContent[]): ChunkContent[] {
    const chunks: ChunkContent[] = [];
    let chunkIndex = 0;

    for (const page of pages) {
      if (!page.text || !page.text.trim()) {
        continue;
      }

      const paragraphs = page.text
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);

      let currentChunk = '';

      for (const paragraph of paragraphs) {
        /*
         * CASE 1:
         * A single paragraph itself is larger than maxChunkSize.
         */
        if (paragraph.length > this.maxChunkSize) {
          // Save anything accumulated before processing
          // the oversized paragraph.
          if (currentChunk) {
            chunks.push({
              chunkIndex: chunkIndex++,
              pageNumber: page.pageNumber,
              text: currentChunk,
            });

            currentChunk = '';
          }

          const smallerChunks = this.splitLargeParagraph(paragraph);

          for (const smallerChunk of smallerChunks) {
            chunks.push({
              chunkIndex: chunkIndex++,
              pageNumber: page.pageNumber,
              text: smallerChunk,
            });
          }

          continue;
        }

        /*
         * CASE 2:
         * Paragraph itself is valid.
         * Try merging it with the current chunk.
         */
        const candidate = currentChunk
          ? `${currentChunk}\n\n${paragraph}`
          : paragraph;

        if (candidate.length <= this.maxChunkSize) {
          currentChunk = candidate;
        } else {
          // Current chunk cannot accept the next paragraph.
          if (currentChunk) {
            chunks.push({
              chunkIndex: chunkIndex++,
              pageNumber: page.pageNumber,
              text: currentChunk,
            });
          }

          // Start a new chunk with the current paragraph.
          currentChunk = paragraph;
        }
      }

      /*
       * Save whatever remains at the end of this page.
       */
      if (currentChunk) {
        chunks.push({
          chunkIndex: chunkIndex++,
          pageNumber: page.pageNumber,
          text: currentChunk,
        });
      }
    }

    return chunks;
  }

  async saveChunks(chunks: ChunkContent[], document: Document): Promise<void> {
    const entities: DocumentChunk[] = [];

    for (const chunk of chunks) {
      if (!chunk.text.trim()) continue;

      const embedding = await this.embeddingsService.generateEmbedding(
        chunk.text,
        'DOCUMENT',
      );

      entities.push(
        this.chunkRepository.create({
          document,
          chunkIndex: chunk.chunkIndex,
          pageNumber: chunk.pageNumber,
          text: chunk.text,
          embedding,
        }),
      );
    }

    if (entities.length === 0) return;

    await this.chunkRepository.save(entities);
  }

  /**
   * Splits a large paragraph while trying to preserve
   * sentence boundaries.
   */
  private splitLargeParagraph(paragraph: string): string[] {
    const sentences = paragraph.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [];

    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();

      if (!trimmedSentence) {
        continue;
      }

      /*
       * If one individual sentence is still too large,
       * hard-split it as a final fallback.
       */
      if (trimmedSentence.length > this.maxChunkSize) {
        if (currentChunk) {
          chunks.push(currentChunk);
          currentChunk = '';
        }

        const hardSplitChunks = this.hardSplit(trimmedSentence);

        chunks.push(...hardSplitChunks);

        continue;
      }

      const candidate = currentChunk
        ? `${currentChunk} ${trimmedSentence}`
        : trimmedSentence;

      if (candidate.length <= this.maxChunkSize) {
        currentChunk = candidate;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk);
        }

        currentChunk = trimmedSentence;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    return chunks;
  }

  /**
   * Last-resort split when even one sentence exceeds
   * maxChunkSize.
   */
  private hardSplit(text: string): string[] {
    const chunks: string[] = [];

    for (let start = 0; start < text.length; start += this.maxChunkSize) {
      const piece = text.slice(start, start + this.maxChunkSize).trim();

      if (piece) {
        chunks.push(piece);
      }
    }

    return chunks;
  }
}
