import { Module } from '@nestjs/common';
import { LlmService } from './llm.service';
import { FallbackLlmProvider } from './providers/fallback-llm.provider';
import { GeminiLlmProvider } from './providers/gemini-llm.provider';
import { GroqLlmProvider } from './providers/groq-llm.provider';

@Module({
  providers: [
    LlmService,
    GeminiLlmProvider,
    GroqLlmProvider,
    FallbackLlmProvider,
    {
      provide: 'LLM_PROVIDER',
      useExisting: FallbackLlmProvider,
    },
  ],
  exports: [LlmService],
})
export class LlmModule {}
