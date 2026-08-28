import { Injectable } from '@nestjs/common';
import { RetrievalSearchResult } from '../retrieval/retrieval.service';

@Injectable()
export class PromptBuilderService {
  build(question: string, chunks: RetrievalSearchResult[]): string {
    const context = chunks
      .map(
        (chunk) =>
          `[Page ${chunk.pageNumber}, Chunk ${chunk.chunkIndex}]\n${chunk.text}`,
      )
      .join('\n\n');

    return `
You are an assistant that explains uploaded PDF documents.

Answer the user's question using only the provided document context.

If the answer is not supported by the context, say:
"The document does not contain enough information to answer this question."

Do not invent facts.

DOCUMENT CONTEXT:
${context}

USER QUESTION:
${question}

Answer clearly and concisely.
`;
  }
}
