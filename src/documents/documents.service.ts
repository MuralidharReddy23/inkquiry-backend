import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IngestionService } from '../ingestion/ingestion.service';
import { Document } from './entities/document.entity';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly ingestionService: IngestionService,
    @InjectRepository(Document)
    private readonly documentsRepository: Repository<Document>,
  ) {}

  async processDocument(file: Express.Multer.File) {
    const document = await this.createDocument(file);

    try {
      const content = await this.ingestionService.extractContent(
        file.buffer,
        document,
      );
      const completedDocument = await this.markDocumentCompleted(
        document,
        content.totalPages,
      );

      return {
        documentId: completedDocument.id,
        fileName: completedDocument.fileName,
        status: completedDocument.status,
        totalPages: content.totalPages,
        totalChunks: content.totalChunks,
      };
    } catch (error) {
      await this.markDocumentFailed(document);
      throw error;
    }
  }

  private createDocument(file: Express.Multer.File): Promise<Document> {
    return this.documentsRepository.save(
      this.documentsRepository.create({
        fileName: file.originalname,
        mimeType: file.mimetype,
        status: 'PROCESSING',
      }),
    );
  }

  private markDocumentCompleted(
    document: Document,
    totalPages: number,
  ): Promise<Document> {
    return this.documentsRepository.save({
      ...document,
      totalPages,
      status: 'COMPLETED',
    });
  }

  private async markDocumentFailed(document: Document): Promise<void> {
    await this.documentsRepository.save({
      ...document,
      status: 'FAILED',
    });
  }
}
