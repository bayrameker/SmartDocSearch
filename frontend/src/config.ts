// Frontend configuration file

// API Gateway URL (defaults to localhost in development)
export const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8000';

// Feature flags
export const FEATURES = {
  ENABLE_OCR: true,          // OCR for scanned documents
  ENABLE_NLP: true,          // Natural language processing
  ENABLE_RAG: true,          // Retrieval augmented generation
  ENABLE_VECTOR_SEARCH: true // Semantic search
};

// UI configuration
export const UI_CONFIG = {
  DEFAULT_THEME: 'light',
  SIDEBAR_WIDTH: '250px',
  ANIMATIONS_ENABLED: true,
  ITEMS_PER_PAGE: 10
};