import { Module } from '@nestjs/common';
import { RetrievalService } from './retrieval.service';

@Module({
  providers: [RetrievalService]
})
export class RetrievalModule {}
