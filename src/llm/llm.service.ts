import { Inject, Injectable } from '@nestjs/common';
import type { LlmProvider } from './providers/llm-provider.interface';

@Injectable()
export class LlmService {
  constructor(
    @Inject('LLM_PROVIDER')
    private readonly provider: LlmProvider,
  ) {}

  generate(prompt: string): Promise<string> {
    return this.provider.generate(prompt);
  }
}
