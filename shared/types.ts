// Auth types
export interface JwtPayload {
  sub: string;       // User ID
  username: string;  // Username
  email: string;     // Email
  roles: string[];   // Roles
  iat: number;       // Issued at
  exp: number;       // Expiration time
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

// Document types
export interface DocumentMetadata {
  title?: string;
  author?: string;
  createdDate?: string;
  pageCount?: number;
  keywords?: string[];
  categories?: string[];
  language?: string;
  [key: string]: any;
}

export interface ProcessDocumentRequest {
  documentId: number;
  storageKey: string;
  fileName: string;
  mimeType: string;
}

export interface ProcessDocumentResponse {
  success: boolean;
  documentId: number;
  message?: string;
  error?: string;
  metadata?: DocumentMetadata;
}

export interface StatusRequest {
  documentId: number;
}

export interface StatusResponse {
  documentId: number;
  status: string;
  progress?: number;
  error?: string;
}

// Vector types
export interface EmbeddingRequest {
  documentId: number;
  chunks: {
    chunkId: number;
    content: string;
  }[];
}

export interface EmbeddingResponse {
  documentId: number;
  chunks: {
    chunkId: number;
    vectorId: string;
  }[];
  success: boolean;
  error?: string;
}

export interface SearchVectorRequest {
  query: string;
  limit?: number;
  filter?: Record<string, any>;
}

export interface SearchVectorResult {
  id: string;
  score: number;
  documentId: number;
  chunkId: number;
  content: string;
  metadata?: Record<string, any>;
}

export interface SearchVectorResponse {
  results: SearchVectorResult[];
  success: boolean;
  error?: string;
}

// Query types
export interface QueryRequest {
  query: string;
  userId: number;
  filter?: Record<string, any>;
}

export interface QuerySource {
  documentId: number;
  title: string;
  content: string;
  score: number;
  metadata?: Record<string, any>;
}

export interface QueryResponse {
  query: string;
  answer: string;
  sources: QuerySource[];
  success: boolean;
  error?: string;
}

// Search types
export interface SearchRequest {
  query: string;
  userId?: number;
  page?: number;
  limit?: number;
  filters?: Record<string, any>;
}

export interface SearchResultItem {
  id: number;
  title: string;
  snippet: string;
  matchedText?: string;
  highlights?: string[];
  score: number;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface SearchResponse {
  query: string;
  results: SearchResultItem[];
  total: number;
  page: number;
  limit: number;
  success: boolean;
  error?: string;
}

// Event message types
export interface DocumentUploadedEvent {
  documentId: number;
  userId: number;
  fileName: string;
  mimeType: string;
  storageKey: string;
  timestamp: string;
}

export interface DocumentProcessedEvent {
  documentId: number;
  userId: number;
  success: boolean;
  textContent?: string;
  metadata?: DocumentMetadata;
  error?: string;
  timestamp: string;
}

export interface DocumentIndexedEvent {
  documentId: number;
  userId: number;
  typesenseId: string;
  success: boolean;
  error?: string;
  timestamp: string;
}

export interface DocumentEmbeddingCreatedEvent {
  documentId: number;
  userId: number;
  qdrantCollection: string;
  success: boolean;
  error?: string;
  timestamp: string;
}

export interface DocumentDeletedEvent {
  documentId: number;
  userId: number;
  timestamp: string;
}