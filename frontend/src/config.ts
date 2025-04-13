// API Gateway URL for backend access
export const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8000';

// Feature flags to enable/disable various features
export const FEATURES = {
  // File types for document uploads
  SUPPORTED_FILE_TYPES: ['pdf', 'docx', 'pptx', 'txt'],
  
  // Maximum file size for uploads in MB
  MAX_FILE_SIZE: 10,
  
  // Search features
  SEMANTIC_SEARCH: true,
  FULL_TEXT_SEARCH: true,
  
  // Query features
  RAG_ENABLED: true,
};

// UI configuration
export const UI_CONFIG = {
  // Theme colors
  PRIMARY_COLOR: '#3182ce',
  SECONDARY_COLOR: '#718096',
  
  // Pagination defaults
  DEFAULT_PAGE_SIZE: 10,
  
  // Document list view configuration
  DOCUMENT_LIST_VIEWS: ['grid', 'list'],
};