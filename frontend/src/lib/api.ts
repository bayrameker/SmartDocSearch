import { API_GATEWAY_URL } from '../config';

// Auth API endpoints
export async function loginUser(username: string, password: string) {
  try {
    console.log('API Giriş isteği gönderiliyor:', { username });
    
    const loginResponse = await fetch(`${API_GATEWAY_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'omit', // include yerine omit kullanarak CORS sorunlarını önleyelim
      mode: 'cors',
      body: JSON.stringify({ username, password }),
    });

    console.log('API yanıt status:', loginResponse.status);
    
    if (!loginResponse.ok) {
      let errorMessage = 'Giriş başarısız oldu';
      
      try {
        const errorData = await loginResponse.json();
        console.error('API Hata yanıtı:', errorData);
        errorMessage = errorData.error || 'Giriş işlemi sırasında bir hata oluştu';
      } catch (jsonError) {
        console.error('API hata yanıtı alınamadı:', jsonError);
        errorMessage = `Sunucu hatası: ${loginResponse.status} ${loginResponse.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    try {
      const data = await loginResponse.json();
      console.log('API Başarılı giriş:', data);
      return data;
    } catch (jsonError) {
      console.error('API yanıtı JSON olarak alınamadı:', jsonError);
      throw new Error('Sunucu yanıtı işlenirken bir hata oluştu');
    }
  } catch (error) {
    console.error('API Giriş hatası:', error);
    throw error;
  }
}

export async function registerUser(username: string, password: string, email: string) {
  try {
    console.log('API Kayıt isteği gönderiliyor:', { username, email });
    console.log('API URL:', API_GATEWAY_URL);
    
    // CORS sorunu olmaması için basit bir fetch testi yapalım
    try {
      const testResponse = await fetch(`${API_GATEWAY_URL}/health`);
      console.log('API Sağlık kontrolü:', testResponse.status);
      if (testResponse.ok) {
        console.log('API Sağlık kontrolü başarılı');
      }
    } catch (testError) {
      console.error('API Sağlık kontrolü hatası:', testError);
      throw new Error('API sunucusuna bağlanılamadı. Ağ bağlantınızı kontrol edin.');
    }
    
    // Asıl kayıt isteği
    const registerResponse = await fetch(`${API_GATEWAY_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'omit', // include yerine omit kullanarak CORS sorunlarını önleyelim
      mode: 'cors',
      body: JSON.stringify({ 
        username, 
        password, 
        email 
      }),
    });

    console.log('API yanıt status:', registerResponse.status);
    
    // Sunucudan bir hata yanıtı geldi mi?
    if (!registerResponse.ok) {
      let errorMessage = 'Kayıt başarısız oldu';
      
      try {
        const errorData = await registerResponse.json();
        console.error('API Hata yanıtı:', errorData);
        errorMessage = errorData.error || 'Kayıt işlemi sırasında bir hata oluştu';
      } catch (jsonError) {
        console.error('API hata yanıtı alınamadı:', jsonError);
        errorMessage = `Sunucu hatası: ${registerResponse.status} ${registerResponse.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    // Başarılı yanıt, JSON olarak dönüştür
    try {
      const data = await registerResponse.json();
      console.log('API Başarılı yanıt:', data);
      return data;
    } catch (jsonError) {
      console.error('API yanıtı JSON olarak alınamadı:', jsonError);
      throw new Error('Sunucu yanıtı işlenirken bir hata oluştu');
    }
  } catch (error) {
    console.error('API İstek işleme hatası:', error);
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

// Browser environment check helper
const isBrowser = () => typeof window !== 'undefined';

// Token helper function
const getToken = () => isBrowser() ? localStorage.getItem('token') : null;

// Document API endpoints
export async function getDocuments(page = 1, limit = 10) {
  const token = getToken();
  
  const response = await fetch(`${API_GATEWAY_URL}/documents?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Belgeleri alma başarısız oldu');
  }

  return response.json();
}

export async function getDocument(id: number) {
  const token = getToken();
  
  const response = await fetch(`${API_GATEWAY_URL}/documents/${id}`, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Belge detaylarını alma başarısız oldu');
  }

  return response.json();
}

export async function uploadDocument(formData: FormData) {
  const token = getToken();
  
  const response = await fetch(`${API_GATEWAY_URL}/documents/upload`, {
    method: 'POST',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
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
  const token = getToken();
  
  const response = await fetch(`${API_GATEWAY_URL}/documents/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Belge silme başarısız oldu');
  }

  return true;
}

export function getDocumentDownloadUrl(id: number) {
  const token = getToken();
  return `${API_GATEWAY_URL}/documents/${id}/download?token=${token || ''}`;
}

// Search API endpoints
export async function searchDocuments(query: string, page = 1, limit = 10) {
  const token = getToken();
  
  const response = await fetch(`${API_GATEWAY_URL}/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
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
  const token = getToken();
  
  const response = await fetch(`${API_GATEWAY_URL}/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
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
  const token = getToken();
  
  const response = await fetch(`${API_GATEWAY_URL}/query/history`, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Sorgu geçmişini alma başarısız oldu');
  }

  return response.json();
}