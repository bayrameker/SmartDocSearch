const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../../config');
const { db } = require('../../server/db');
const { users } = require('../../shared/schema');
const { eq } = require('drizzle-orm');

// Destructure config variables
const { JWT_SECRET, JWT_EXPIRES_IN } = config;

/**
 * Register authentication routes
 * 
 * @param app Fastify app instance
 */
export function registerAuthRoutes(app: FastifyInstance) {
  // Login endpoint
  app.post<{ Body: LoginRequest }>('/auth/login', async (request, reply) => {
    try {
      const { username, password } = request.body;
      
      // Find user by username
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.username, username));
      
      if (!user) {
        return reply.code(401).send({
          success: false,
          error: 'Geçersiz kullanıcı adı veya şifre'
        });
      }
      
      // Verify password
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
        } as JwtPayload,
        JWT_SECRET,
        {
          expiresIn: JWT_EXPIRES_IN,
        }
      );
      
      // Return token and user info
      const response: AuthResponse = {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      };
      
      return reply.code(200).send(response);
    } catch (error) {
      app.log.error('Error during login:', error);
      return reply.code(500).send({
        success: false,
        error: 'Giriş işlemi sırasında bir hata oluştu'
      });
    }
  });
  
  // Register endpoint
  app.post<{ Body: RegisterRequest }>('/auth/register', async (request, reply) => {
    try {
      const { username, email, password } = request.body;
      
      // Check if username or email already exists
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.username, username));
      
      if (existingUser) {
        return reply.code(400).send({
          success: false,
          error: 'Bu kullanıcı adı zaten kullanılıyor'
        });
      }
      
      const [existingEmail] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));
      
      if (existingEmail) {
        return reply.code(400).send({
          success: false,
          error: 'Bu e-posta adresi zaten kullanılıyor'
        });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const [newUser] = await db
        .insert(users)
        .values({
          username,
          email,
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      
      // Generate JWT token
      const token = jwt.sign(
        {
          sub: newUser.id.toString(),
          username: newUser.username,
          email: newUser.email,
          roles: ['user'],
        } as JwtPayload,
        JWT_SECRET,
        {
          expiresIn: JWT_EXPIRES_IN,
        }
      );
      
      // Return token and user info
      const response: AuthResponse = {
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
        },
      };
      
      return reply.code(201).send(response);
    } catch (error) {
      app.log.error('Error during registration:', error);
      return reply.code(500).send({
        success: false,
        error: 'Kayıt işlemi sırasında bir hata oluştu'
      });
    }
  });
  
  // Get current user endpoint
  app.get('/auth/me', async (request, reply) => {
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
        const decoded = verifyToken(token);
        
        // Get user from database
        const [user] = await db
          .select({
            id: users.id,
            username: users.username,
            email: users.email,
          })
          .from(users)
          .where(eq(users.id, parseInt(decoded.sub)));
        
        if (!user) {
          return reply.code(404).send({
            success: false,
            error: 'Kullanıcı bulunamadı'
          });
        }
        
        return reply.code(200).send({
          success: true,
          user,
        });
      } catch (err) {
        return reply.code(401).send({
          success: false,
          error: 'Geçersiz veya süresi dolmuş token'
        });
      }
    } catch (error) {
      app.log.error('Error getting current user:', error);
      return reply.code(500).send({
        success: false,
        error: 'Kullanıcı bilgileri alınırken bir hata oluştu'
      });
    }
  });
}

/**
 * Verify JWT token
 * 
 * @param token JWT token
 * @returns Decoded token payload
 */
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}