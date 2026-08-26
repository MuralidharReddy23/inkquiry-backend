import { Injectable } from '@nestjs/common';
import { IngestionService } from '../ingestion/ingestion.service';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly ingestionService: IngestionService,
  ) {}

  async processDocument(file: Express.Multer.File) {
    const text =
      await this.ingestionService.extractText(file.buffer);

    return {
      fileName: file.originalname,
      text,
    };
  }
}