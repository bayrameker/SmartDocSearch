const fastify = require('fastify');
const cors = require('@fastify/cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Configuration
const JWT_SECRET = 'your-secret-key';
const JWT_EXPIRES_IN = '1d';
const PORT = 8000;

// Create the server
const server = fastify({
  logger: true
});

// CORS configuration
server.register(cors, {
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400,
});

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