import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { DocumentChunk } from '../../ingestion/chunks/entities/document-chunk.entity';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fileName: string;

  @Column()
  mimeType: string;

  @Column({
    default: 'PROCESSING',
  })
  status: string;

  @Column({
    nullable: true,
  })
  totalPages: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => DocumentChunk, (chunk) => chunk.document)
  chunks: DocumentChunk[];
}
