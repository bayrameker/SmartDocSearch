// Default API URL (fallback to localhost in development)
const API_URL = 'http://localhost:8000';

/**
 * Helper function to make authenticated API requests
 */
async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error || response.statusText || 'An error occurred';
    throw new Error(errorMessage);
  }
  
  return response.json();
}

/**
 * Register a new user
 */
export async function registerUser(username: string, email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, email, password }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Registration failed');
  }
  
  // Store token
  if (data.token) {
    localStorage.setItem('token', data.token);
  }
  
  return data.user;
}

/**
 * Login user
 */
export async function loginUser(usernameOrEmail: string, password: string) {
  const payload = usernameOrEmail.includes('@') 
    ? { email: usernameOrEmail, password } 
    : { username: usernameOrEmail, password };
  
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Login failed');
  }
  
  // Store token
  if (data.token) {
    localStorage.setItem('token', data.token);
  }
  
  return data.user;
}

/**
 * Check if user is authenticated
 */
export async function checkAuth() {
  return await fetchWithAuth('/auth/me');
}

/**
 * Upload a document
 */
export async function uploadDocument(file: File, title: string) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);
  
  const response = await fetch(`${API_URL}/storage/documents`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Document upload failed');
  }
  
  return data.document;
}

/**
 * Get document list
 */
export async function getDocuments(page = 1, limit = 10) {
  const data = await fetchWithAuth(`/storage/documents?page=${page}&limit=${limit}`);
  return data.documents || [];
}

/**
 * Get document by ID
 */
export async function getDocument(id: string | number) {
  const data = await fetchWithAuth(`/storage/documents/${id}`);
  return data.document;
}

/**
 * Delete document
 */
export async function deleteDocument(id: string | number) {
  return await fetchWithAuth(`/storage/documents/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Download document
 */
export function getDocumentDownloadUrl(id: string | number) {
  const token = localStorage.getItem('token');
  return `${API_URL}/storage/documents/${id}/download?token=${token}`;
}

/**
 * Search documents
 */
export async function searchDocuments(query: string) {
  const data = await fetchWithAuth(`/search?q=${encodeURIComponent(query)}`);
  return data.results?.hits || [];
}

/**
 * Query documents (ask questions)
 */
export async function queryDocuments(query: string) {
  const data = await fetchWithAuth('/query', {
    method: 'POST',
    body: JSON.stringify({ query }),
  });
  
  return data;
}

/**
 * Get query history
 */
export async function getQueryHistory(limit = 10) {
  return await fetchWithAuth(`/query/history?limit=${limit}`);
}