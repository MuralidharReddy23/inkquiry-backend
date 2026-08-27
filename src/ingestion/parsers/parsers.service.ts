import { Injectable } from '@nestjs/common';
import { PDFParse } from 'pdf-parse';

export interface ExtractedPageContent {
  pageNumber: number;
  text: string;
}

export interface ExtractedDocumentContent {
  totalPages: number;
  pages: ExtractedPageContent[];
}

@Injectable()
export class ParsersService {
  async extractContent(buffer: Buffer): Promise<ExtractedDocumentContent> {
    const parser = new PDFParse({ data: buffer });

    try {
      const result = await parser.getText();
      return {
        totalPages: result.total,
        pages: result.pages.map((page) => ({
          pageNumber: page.num,
          text: page.text,
        })),
      };
    } finally {
      await parser.destroy();
    }
  }
}
