// Configuration variables for the application

// Server configuration
const SERVER_PORT = parseInt(process.env.SERVER_PORT || '8000');
const HOST = '0.0.0.0';
const FRONTEND_PORT = parseInt(process.env.FRONTEND_PORT || '5000');

// Database configuration
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/docusearch';

// MinIO configuration
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'localhost';
const MINIO_PORT = parseInt(process.env.MINIO_PORT || '9000');
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || 'minioadmin';
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || 'minioadmin';
const MINIO_USE_SSL = process.env.MINIO_USE_SSL === 'true';
const MINIO_BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'documents';

// Typesense configuration
const TYPESENSE_HOST = process.env.TYPESENSE_HOST || 'localhost';
const TYPESENSE_PORT = parseInt(process.env.TYPESENSE_PORT || '8108');
const TYPESENSE_PROTOCOL = process.env.TYPESENSE_PROTOCOL || 'http';
const TYPESENSE_API_KEY = process.env.TYPESENSE_API_KEY || 'xyz';

// Qdrant configuration
const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const QDRANT_API_KEY = process.env.QDRANT_API_KEY || '';

// Kafka configuration
const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');

// OpenAI configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';
const OPENAI_COMPLETION_MODEL = process.env.OPENAI_COMPLETION_MODEL || 'gpt-4o';

// Authentication configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

// OCR configuration
const OCR_LANGUAGE = process.env.OCR_LANGUAGE || 'eng';

// Service endpoints (for inter-service communication)
const DOCUMENT_PROCESSING_URL = process.env.DOCUMENT_PROCESSING_URL || 'http://localhost:8001';
const SEARCH_SERVICE_URL = process.env.SEARCH_SERVICE_URL || 'http://localhost:8002';
const STORAGE_SERVICE_URL = process.env.STORAGE_SERVICE_URL || 'http://localhost:8003';
const VECTOR_SERVICE_URL = process.env.VECTOR_SERVICE_URL || 'http://localhost:8004';
const QUERY_ENGINE_URL = process.env.QUERY_ENGINE_URL || 'http://localhost:8005';
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:8000';

module.exports = {
  SERVER_PORT,
  HOST,
  FRONTEND_PORT,
  DATABASE_URL,
  MINIO_ENDPOINT,
  MINIO_PORT,
  MINIO_ACCESS_KEY,
  MINIO_SECRET_KEY,
  MINIO_USE_SSL,
  MINIO_BUCKET_NAME,
  TYPESENSE_HOST,
  TYPESENSE_PORT,
  TYPESENSE_PROTOCOL,
  TYPESENSE_API_KEY,
  QDRANT_URL,
  QDRANT_API_KEY,
  KAFKA_BROKERS,
  OPENAI_API_KEY,
  OPENAI_EMBEDDING_MODEL,
  OPENAI_COMPLETION_MODEL,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  OCR_LANGUAGE,
  DOCUMENT_PROCESSING_URL,
  SEARCH_SERVICE_URL,
  STORAGE_SERVICE_URL,
  VECTOR_SERVICE_URL,
  QUERY_ENGINE_URL,
  API_GATEWAY_URL
};