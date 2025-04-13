import { API_GATEWAY_URL } from '../config';

// Auth API endpoints
export async function loginUser(username: string, password: string) {
  const response = await fetch(`${API_GATEWAY_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Giriş başarısız oldu');
  }

  return response.json();
}

export async function registerUser(username: string, password: string, email: string) {
  try {
    console.log('API Kayıt isteği:', { username, email });
    
    const response = await fetch(`${API_GATEWAY_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, email }),
    });

    // Yanıt alındı, durumu kontrol et
    console.log('API yanıt status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Hata:', errorData);
      throw new Error(errorData.error || 'Kayıt başarısız oldu');
    }

    // Başarılı yanıt
    const data = await response.json();
    console.log('API Başarılı:', data);
    return data;
  } catch (error) {
    console.error('API İstek hatası:', error);
    throw error;
  }
}

export async function logoutUser() {
  const response = await fetch(`${API_GATEWAY_URL}/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Çıkış başarısız oldu');
  }

  return true;
}

// Document API endpoints
export async function getDocuments(page = 1, limit = 10) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_GATEWAY_URL}/documents?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Belgeleri alma başarısız oldu');
  }

  return response.json();
}

export async function getDocument(id: number) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_GATEWAY_URL}/documents/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Belge detaylarını alma başarısız oldu');
  }

  return response.json();
}

export async function uploadDocument(formData: FormData) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_GATEWAY_URL}/documents/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Belge yükleme başarısız oldu');
  }

  return response.json();
}

export async function deleteDocument(id: number) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_GATEWAY_URL}/documents/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Belge silme başarısız oldu');
  }

  return true;
}

export function getDocumentDownloadUrl(id: number) {
  const token = localStorage.getItem('token');
  return `${API_GATEWAY_URL}/documents/${id}/download?token=${token}`;
}

// Search API endpoints
export async function searchDocuments(query: string, page = 1, limit = 10) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_GATEWAY_URL}/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Arama başarısız oldu');
  }

  return response.json();
}

// Query API endpoints
export async function queryDocuments(query: string) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_GATEWAY_URL}/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Sorgu başarısız oldu');
  }

  return response.json();
}

export async function getQueryHistory() {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_GATEWAY_URL}/query/history`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Sorgu geçmişini alma başarısız oldu');
  }

  return response.json();
}