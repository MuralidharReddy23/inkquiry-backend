import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Document } from '../../../documents/entities/document.entity';

@Entity('document_chunks')
@Index('idx_document_chunks_document_id', ['document'])
export class DocumentChunk {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Document, (document) => document.chunks, {
    onDelete: 'CASCADE',
  })
  document: Document;

  @Column()
  chunkIndex: number;

  @Column()
  pageNumber: number;

  @Column('text')
  text: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({
    type: 'vector',
    length: 768,
    nullable: true,
  })
  embedding: number[];
}
