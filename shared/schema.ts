import { InferModel, relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Documents table
export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  filename: varchar('filename', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  storageKey: varchar('storage_key', { length: 512 }).notNull(), // Path in MinIO
  textContent: text('text_content'), // Extracted text content
  status: varchar('status', { length: 50 }).notNull().default('processing'), // processing, indexed, failed
  typesenseId: varchar('typesense_id', { length: 255 }),
  qdrantCollection: varchar('qdrant_collection', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Document chunks for vector storage
export const documentChunks = pgTable('document_chunks', {
  id: serial('id').primaryKey(),
  documentId: integer('document_id').references(() => documents.id).notNull(),
  chunkIndex: integer('chunk_index').notNull(),
  content: text('content').notNull(),
  vectorId: varchar('vector_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Queries history
export const queries = pgTable('queries', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  query: text('query').notNull(),
  response: text('response'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  documents: many(documents),
  queries: many(queries),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  user: one(users, {
    fields: [documents.userId],
    references: [users.id],
  }),
  chunks: many(documentChunks),
}));

export const documentChunksRelations = relations(documentChunks, ({ one }) => ({
  document: one(documents, {
    fields: [documentChunks.documentId],
    references: [documents.id],
  }),
}));

export const queriesRelations = relations(queries, ({ one }) => ({
  user: one(users, {
    fields: [queries.userId],
    references: [users.id],
  }),
}));

// Types
export type User = InferModel<typeof users>;
export type InsertUser = InferModel<typeof users, 'insert'>;

export type Document = InferModel<typeof documents>;
export type InsertDocument = InferModel<typeof documents, 'insert'>;

export type DocumentChunk = InferModel<typeof documentChunks>;
export type InsertDocumentChunk = InferModel<typeof documentChunks, 'insert'>;

export type Query = InferModel<typeof queries>;
export type InsertQuery = InferModel<typeof queries, 'insert'>;
