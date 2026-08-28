export type EmbeddingType = 'DOCUMENT' | 'QUERY';

export interface EmbeddingProvider {
  generateEmbedding(text: string, type: EmbeddingType): Promise<number[]>;
}
