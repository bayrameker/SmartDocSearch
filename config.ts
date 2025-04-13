// Configuration variables for the application

// Server configuration
export const SERVER_PORT = parseInt(process.env.SERVER_PORT || '8000');
export const HOST = '0.0.0.0';
export const FRONTEND_PORT = parseInt(process.env.FRONTEND_PORT || '5000');

// Database configuration
export const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/docusearch';

// MinIO configuration
export const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'localhost';
export const MINIO_PORT = parseInt(process.env.MINIO_PORT || '9000');
export const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || 'minioadmin';
export const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || 'minioadmin';
export const MINIO_USE_SSL = process.env.MINIO_USE_SSL === 'true';
export const MINIO_BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'documents';

// Typesense configuration
export const TYPESENSE_HOST = process.env.TYPESENSE_HOST || 'localhost';
export const TYPESENSE_PORT = parseInt(process.env.TYPESENSE_PORT || '8108');
export const TYPESENSE_PROTOCOL = process.env.TYPESENSE_PROTOCOL || 'http';
export const TYPESENSE_API_KEY = process.env.TYPESENSE_API_KEY || 'xyz';

// Qdrant configuration
export const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
export const QDRANT_API_KEY = process.env.QDRANT_API_KEY || '';

// Kafka configuration
export const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');

// OpenAI configuration
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
export const OPENAI_EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';
export const OPENAI_COMPLETION_MODEL = process.env.OPENAI_COMPLETION_MODEL || 'gpt-4o';

// Authentication configuration
export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

// OCR configuration
export const OCR_LANGUAGE = process.env.OCR_LANGUAGE || 'eng';

// Service endpoints (for inter-service communication)
export const DOCUMENT_PROCESSING_URL = process.env.DOCUMENT_PROCESSING_URL || 'http://localhost:8001';
export const SEARCH_SERVICE_URL = process.env.SEARCH_SERVICE_URL || 'http://localhost:8002';
export const STORAGE_SERVICE_URL = process.env.STORAGE_SERVICE_URL || 'http://localhost:8003';
export const VECTOR_SERVICE_URL = process.env.VECTOR_SERVICE_URL || 'http://localhost:8004';
export const QUERY_ENGINE_URL = process.env.QUERY_ENGINE_URL || 'http://localhost:8005';
export const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:8000';
