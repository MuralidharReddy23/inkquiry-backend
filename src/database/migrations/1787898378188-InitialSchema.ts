import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1787898378188 implements MigrationInterface {
  name = 'InitialSchema1787898378188';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS vector');
    await queryRunner.query(`
      CREATE TABLE "documents" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "fileName" character varying NOT NULL,
        "mimeType" character varying NOT NULL,
        "status" character varying NOT NULL DEFAULT 'PROCESSING',
        "totalPages" integer,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_documents_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "document_chunks" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "chunkIndex" integer NOT NULL,
        "pageNumber" integer NOT NULL,
        "text" text NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "embedding" vector(768),
        "documentId" uuid,
        CONSTRAINT "PK_document_chunks_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_document_chunks_document_id"
      ON "document_chunks" ("documentId")
    `);
    await queryRunner.query(`
      ALTER TABLE "document_chunks"
      ADD CONSTRAINT "FK_document_chunks_document_id"
      FOREIGN KEY ("documentId")
      REFERENCES "documents"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "document_chunks"
      DROP CONSTRAINT "FK_document_chunks_document_id"
    `);
    await queryRunner.query('DROP INDEX "idx_document_chunks_document_id"');
    await queryRunner.query('DROP TABLE "document_chunks"');
    await queryRunner.query('DROP TABLE "documents"');
  }
}
