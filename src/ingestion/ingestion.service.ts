import { Injectable } from '@nestjs/common';
import { TextCleanerService } from './cleaners/text-cleaner/text-cleaner.service';
import { ParsersService } from './parsers/parsers.service';

@Injectable()
export class IngestionService {
  constructor(
    private readonly parsersService: ParsersService,
    private readonly textCleanerService: TextCleanerService,
  ) {}

  async extractText(buffer: Buffer): Promise<string> {
    const text = await this.parseText(buffer);
    return this.cleanText(text);
  }

  private parseText(buffer: Buffer): Promise<string> {
    return this.parsersService.extractText(buffer);
  }

  private cleanText(text: string): string {
    return this.textCleanerService.clean(text);
  }
}
