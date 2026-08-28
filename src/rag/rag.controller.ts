import { Body, Controller, Post } from '@nestjs/common';
import { RagService } from './rag.service';

@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post('ask')
  ask(
    @Body()
    body: {
      documentId: string;
      question: string;
      limit?: number;
    },
  ) {
    return this.ragService.ask(body.documentId, body.question, body.limit ?? 5);
  }
}
