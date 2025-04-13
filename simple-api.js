const fastify = require('fastify');
const cors = require('@fastify/cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('fastify-multer');

// Configuration
const JWT_SECRET = 'your-secret-key';
const JWT_EXPIRES_IN = '1d';
const PORT = 8000;

// Create the server
const server = fastify({
  logger: true
});

// CORS configuration - genişletilmiş
server.register(cors, {
  origin: '*', // Tüm kaynaklara izin ver
  credentials: false, // credentials: 'omit' ile eşleşmesi için false yapıyoruz
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'Content-Disposition'],
  exposedHeaders: ['Content-Length', 'Content-Type', 'Authorization', 'Content-Disposition'],
  maxAge: 86400,
  preflight: true,
});

// Multer configuration for file uploads
server.register(multer.contentParser);

// In-memory user storage for demonstration
const users = [];
let userId = 1;

// Health check endpoint
server.get('/health', async (request, reply) => {
  return { status: 'ok', service: 'api-gateway' };
});

// Login endpoint
server.post('/auth/login', async (request, reply) => {
  try {
    const { username, password } = request.body;
    
    const user = users.find(u => u.username === username);
    
    if (!user) {
      return reply.code(401).send({
        success: false,
        error: 'Geçersiz kullanıcı adı veya şifre'
      });
    }
    
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return reply.code(401).send({
        success: false,
        error: 'Geçersiz kullanıcı adı veya şifre'
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      {
        sub: user.id.toString(),
        username: user.username,
        email: user.email,
        roles: ['user'],
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
      }
    );
    
    return reply.code(200).send({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    server.log.error('Error during login:', error);
    return reply.code(500).send({
      success: false,
      error: 'Giriş işlemi sırasında bir hata oluştu'
    });
  }
});

// Register endpoint
server.post('/auth/register', async (request, reply) => {
  try {
    const { username, email, password } = request.body;
    
    // Check if username or email already exists
    if (users.some(u => u.username === username)) {
      return reply.code(400).send({
        success: false,
        error: 'Bu kullanıcı adı zaten kullanılıyor'
      });
    }
    
    if (users.some(u => u.email === email)) {
      return reply.code(400).send({
        success: false,
        error: 'Bu e-posta adresi zaten kullanılıyor'
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const newUser = {
      id: userId++,
      username,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    };
    
    users.push(newUser);
    
    // Generate JWT token
    const token = jwt.sign(
      {
        sub: newUser.id.toString(),
        username: newUser.username,
        email: newUser.email,
        roles: ['user'],
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
      }
    );
    
    console.log(`User registered: ${username} (${email})`);
    
    return reply.code(201).send({
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    server.log.error('Error during registration:', error);
    return reply.code(500).send({
      success: false,
      error: 'Kayıt işlemi sırasında bir hata oluştu'
    });
  }
});

// Get current user endpoint
server.get('/auth/me', async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({
        success: false,
        error: 'Yetkilendirme hatası'
      });
    }
    
    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const userId = parseInt(decoded.sub);
      
      const user = users.find(u => u.id === userId);
      
      if (!user) {
        return reply.code(404).send({
          success: false,
          error: 'Kullanıcı bulunamadı'
        });
      }
      
      return reply.code(200).send({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (err) {
      return reply.code(401).send({
        success: false,
        error: 'Geçersiz veya süresi dolmuş token'
      });
    }
  } catch (error) {
    server.log.error('Error getting current user:', error);
    return reply.code(500).send({
      success: false,
      error: 'Kullanıcı bilgileri alınırken bir hata oluştu'
    });
  }
});

// Document search mock endpoint
server.post('/search', async (request, reply) => {
  try {
    const { query } = request.body;
    
    return reply.code(200).send({
      query,
      results: [
        {
          id: 1,
          title: 'Örnek Belge',
          snippet: `Bu bir örnek belge içeriğidir. Arama terimi: "${query}"`,
          score: 0.95,
          createdAt: new Date().toISOString(),
          metadata: {
            author: 'Örnek Yazar',
            pageCount: 10
          }
        }
      ],
      total: 1,
      page: 1,
      limit: 10,
      success: true
    });
  } catch (error) {
    server.log.error('Error searching documents:', error);
    return reply.code(500).send({
      success: false,
      error: 'Belge arama sırasında bir hata oluştu'
    });
  }
});

// Document query mock endpoint
server.post('/query', async (request, reply) => {
  try {
    const { query } = request.body;
    
    return reply.code(200).send({
      query,
      answer: `"${query}" sorunuza yanıt: Bu bir örnek yanıttır. Gerçek bir AI yanıtı burada olacaktır.`,
      sources: [
        {
          documentId: 1,
          title: 'Örnek Kaynak Belge',
          content: 'Bu belge, sorgunuz için kaynak olarak kullanılmıştır.',
          score: 0.92,
          metadata: {
            author: 'Örnek Yazar',
            pageCount: 10
          }
        }
      ],
      success: true
    });
  } catch (error) {
    server.log.error('Error querying documents:', error);
    return reply.code(500).send({
      success: false,
      error: 'Belge sorgulama sırasında bir hata oluştu'
    });
  }
});

// Ayrıca GET metodu için de /documents/upload endpointi ekleyelim (yanlış çağrılar için)
server.get('/documents/upload', async (request, reply) => {
  try {
    return reply.code(200).send({
      message: 'Belge yükleme sayfası',
      success: true,
      endpoints: {
        upload: 'POST /documents/upload'
      }
    });
  } catch (error) {
    server.log.error('Error getting upload page:', error);
    return reply.code(500).send({
      success: false,
      error: 'Sayfa yüklenirken bir hata oluştu'
    });
  }
});

// Mock document endpoints
server.get('/documents', async (request, reply) => {
  try {
    // Örnek belge listesi
    const documents = [
      {
        id: 1,
        title: 'Örnek Belge 1',
        filename: 'ornek1.pdf',
        mimeType: 'application/pdf',
        createdAt: new Date().toISOString(),
        status: 'processed'
      },
      {
        id: 2,
        title: 'Örnek Belge 2',
        filename: 'ornek2.docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 gün önce
        status: 'processed'
      }
    ];
    
    return reply.code(200).send({
      documents: documents,
      total: documents.length,
      page: 1,
      limit: 10,
      success: true
    });
  } catch (error) {
    server.log.error('Error getting documents:', error);
    return reply.code(500).send({
      success: false,
      error: 'Belgeler alınırken bir hata oluştu'
    });
  }
});

server.get('/documents/:id', async (request, reply) => {
  try {
    const { id } = request.params;
    
    // id parameterı "upload" ise, özel bir durum
    if (id === "upload") {
      return reply.code(200).send({
        message: 'Belge yükleme sayfası',
        success: true,
        endpoints: {
          upload: 'POST /documents/upload'
        }
      });
    }
    
    // Normal belge getirme
    return reply.code(200).send({
      id: parseInt(id),
      title: 'Örnek Belge',
      filename: 'ornek.pdf',
      mimeType: 'application/pdf',
      createdAt: new Date().toISOString(),
      status: 'processed',
      success: true
    });
  } catch (error) {
    server.log.error('Error getting document:', error);
    return reply.code(500).send({
      success: false,
      error: 'Belge alınırken bir hata oluştu'
    });
  }
});

// Multer storage setup
const upload = multer({ 
  dest: '/tmp/uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Document upload endpoint with file handling
server.post('/documents/upload', { preHandler: upload.single('file') }, async (request, reply) => {
  try {
    console.log('Request body:', request.body);
    console.log('File received:', request.file);
    
    const title = request.body.title || 'Untitled Document';
    
    // Dosya bilgilerini çek (mevcutsa)
    const uploadedFile = request.file || {
      originalname: 'ornek.pdf',
      mimetype: 'application/pdf',
      size: 0,
      path: '/tmp/uploads/empty'
    };
    
    // Yüklenen dosya bilgilerini döndür
    return reply.code(201).send({
      id: Math.floor(Math.random() * 1000) + 3, // Random ID 3-1002 aralığında
      title: title,
      filename: uploadedFile.originalname,
      mimeType: uploadedFile.mimetype,
      fileSize: uploadedFile.size,
      createdAt: new Date().toISOString(),
      status: 'processing',
      success: true
    });
  } catch (error) {
    server.log.error('Error uploading document:', error);
    return reply.code(500).send({
      success: false,
      error: 'Belge yüklenirken bir hata oluştu: ' + error.message
    });
  }
});

// Start the server
const start = async () => {
  try {
    await server.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`API Gateway running on http://0.0.0.0:${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();