// Shared types for the application in CommonJS format

// Auth types
const JwtPayload = {}; // Interface definition
const LoginRequest = {}; // Interface definition
const RegisterRequest = {}; // Interface definition
const AuthResponse = {}; // Interface definition

// Document types
const DocumentMetadata = {}; // Interface definition

// Request/Response types
const ProcessDocumentRequest = {}; // Interface definition
const ProcessDocumentResponse = {}; // Interface definition
const StatusRequest = {}; // Interface definition
const StatusResponse = {}; // Interface definition

// Vector types
const EmbeddingRequest = {}; // Interface definition
const EmbeddingResponse = {}; // Interface definition
const SearchVectorRequest = {}; // Interface definition
const SearchVectorResult = {}; // Interface definition
const SearchVectorResponse = {}; // Interface definition

// Query types
const QueryRequest = {}; // Interface definition
const QuerySource = {}; // Interface definition
const QueryResponse = {}; // Interface definition

// Search types
const SearchRequest = {}; // Interface definition
const SearchResultItem = {}; // Interface definition
const SearchResponse = {}; // Interface definition

// Event message types
const DocumentUploadedEvent = {}; // Interface definition
const DocumentProcessedEvent = {}; // Interface definition
const DocumentIndexedEvent = {}; // Interface definition
const DocumentEmbeddingCreatedEvent = {}; // Interface definition
const DocumentDeletedEvent = {}; // Interface definition

module.exports = {
  // Auth types
  JwtPayload,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  
  // Document types
  DocumentMetadata,
  
  // Request/Response types
  ProcessDocumentRequest,
  ProcessDocumentResponse,
  StatusRequest,
  StatusResponse,
  
  // Vector types
  EmbeddingRequest,
  EmbeddingResponse,
  SearchVectorRequest,
  SearchVectorResult,
  SearchVectorResponse,
  
  // Query types
  QueryRequest,
  QuerySource,
  QueryResponse,
  
  // Search types
  SearchRequest,
  SearchResultItem,
  SearchResponse,
  
  // Event message types
  DocumentUploadedEvent,
  DocumentProcessedEvent,
  DocumentIndexedEvent,
  DocumentEmbeddingCreatedEvent,
  DocumentDeletedEvent
};