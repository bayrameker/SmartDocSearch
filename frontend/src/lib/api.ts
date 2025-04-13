// API Gateway URL
const API_URL = 'http://localhost:8000';

// Utility to set auth token on requests
function getAuthHeaders(): Record<string, string> {
  const token = localStorage?.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// Auth API
export async function loginUser(username: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Giriş başarısız');
  }

  const data = await response.json();
  localStorage?.setItem('token', data.token);
  return data.user;
}

export async function registerUser(username: string, password: string, email: string) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password, email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Kayıt başarısız');
  }

  const data = await response.json();
  localStorage?.setItem('token', data.token);
  return data.user;
}

export async function checkAuth() {
  const response = await fetch(`${API_URL}/auth/me`, {
    method: 'GET',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Kimlik doğrulama başarısız');
  }

  return response.json();
}

// Documents API
export async function uploadDocument(formData: FormData) {
  const response = await fetch(`${API_URL}/documents/upload`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Yükleme başarısız');
  }

  return response.json();
}

export async function getDocuments(page = 1, limit = 10) {
  const response = await fetch(
    `${API_URL}/documents?page=${page}&limit=${limit}`,
    {
      method: 'GET',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Dokümanlar alınamadı');
  }

  return response.json();
}

export async function getDocumentDownloadUrl(id: number): Promise<string> {
  return `${API_URL}/documents/${id}/download`;
}

export async function getDocument(id: number) {
  const response = await fetch(`${API_URL}/documents/${id}`, {
    method: 'GET',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Doküman alınamadı');
  }

  return response.json();
}

export async function deleteDocument(id: number) {
  const response = await fetch(`${API_URL}/documents/${id}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Silme işlemi başarısız');
  }

  return true;
}

// Search API
export async function searchDocuments(query: string, page = 1, limit = 10) {
  const response = await fetch(
    `${API_URL}/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
    {
      method: 'GET',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Arama başarısız');
  }

  return response.json();
}

// Query API
export async function getQueryHistory(page = 1, limit = 10) {
  const response = await fetch(
    `${API_URL}/queries?page=${page}&limit=${limit}`,
    {
      method: 'GET',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Sorgu geçmişi alınamadı');
  }

  return response.json();
}

export async function queryDocuments(question: string) {
  const response = await fetch(`${API_URL}/query`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: question }),
  });

  if (!response.ok) {
    throw new Error('Sorgulama başarısız');
  }

  return response.json();
}