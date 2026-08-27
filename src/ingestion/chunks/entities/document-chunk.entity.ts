import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Document } from '../../../documents/entities/document.entity';

@Entity('document_chunks')
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
    nullable: true,
  })
  embedding: number[];
}
