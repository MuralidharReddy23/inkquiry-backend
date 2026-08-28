import { Body, Controller, Post } from '@nestjs/common';
import { RetrievalService } from './retrieval.service';

@Controller('retrieval')
export class RetrievalController {
  constructor(private readonly retrievalService: RetrievalService) {}

  @Post('search')
  search(
    @Body()
    body: {
      documentId: string;
      question: string;
      limit?: number;
    },
  ) {
    return this.retrievalService.search(
      body.documentId,
      body.question,
      body.limit ?? 5,
    );
  }
}
