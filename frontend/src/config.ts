// API endpoint configurations
// Dinamik IP adresi ve port kullanımı için window.location'dan alıyoruz
export const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 
  (typeof window !== 'undefined' 
    ? `${window.location.protocol}//${window.location.hostname}:8000` 
    : 'http://localhost:8000');

// Feature flags
export const FEATURES = {
  DOCUMENT_UPLOAD: true,
  DOCUMENT_QUERY: true,
  SEARCH: true,
  USER_MANAGEMENT: true,
};

// UI configuration
export const UI_CONFIG = {
  THEME: 'light',
  LANGUAGE: 'tr-TR',
  DATE_FORMAT: 'dd.MM.yyyy',
  ROWS_PER_PAGE: 10,
};