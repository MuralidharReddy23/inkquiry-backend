import { Injectable } from '@nestjs/common';
import { Document } from '../documents/entities/document.entity';
import { ChunkContent, ChunksService } from './chunks/chunks.service';
import { TextCleanerService } from './cleaners/text-cleaner/text-cleaner.service';
import {
  ExtractedDocumentContent,
  ParsersService,
  ExtractedPageContent,
} from './parsers/parsers.service';

export interface IngestedDocumentSummary {
  totalPages: number;
  totalChunks: number;
}

@Injectable()
export class IngestionService {
  constructor(
    private readonly parsersService: ParsersService,
    private readonly textCleanerService: TextCleanerService,
    private readonly chunksService: ChunksService,
  ) {}

  async extractContent(
    buffer: Buffer,
    document: Document,
  ): Promise<IngestedDocumentSummary> {
    const content = await this.parseContent(buffer);
    const cleanedPages = this.cleanPages(content.pages);
    const chunks = this.chunkPages(cleanedPages);
    await this.chunksService.saveChunks(chunks, document);

    return {
      totalPages: content.totalPages,
      totalChunks: chunks.length,
    };
  }

  private parseContent(buffer: Buffer): Promise<ExtractedDocumentContent> {
    return this.parsersService.extractContent(buffer);
  }

  private cleanPages(pages: ExtractedPageContent[]): ExtractedPageContent[] {
    return pages.map((page) => ({
      pageNumber: page.pageNumber,
      text: this.textCleanerService.clean(page.text),
    }));
  }

  private chunkPages(pages: ExtractedPageContent[]): ChunkContent[] {
    return this.chunksService.chunkPages(pages);
  }
}
