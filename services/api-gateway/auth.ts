import { Elysia } from 'elysia';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq } from 'drizzle-orm';
import ws from 'ws';
import * as schema from '../../shared/schema';
import { DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN } from '../../config';

// Configuration for Neon serverless Postgres
const neonConfig = {
  webSocketConstructor: ws,
};

// Create database pool and connection
const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool, { schema });

/**
 * Register authentication routes
 * 
 * @param app Elysia app instance
 */
export function registerAuthRoutes(app: Elysia) {
  // Register a new user
  app.post('/auth/register', async ({ body, set }) => {
    try {
      if (!body || !body.username || !body.email || !body.password) {
        set.status = 400;
        return {
          success: false,
          error: 'Missing required fields: username, email, password',
        };
      }
      
      // Check if username or email already exists
      const existingUser = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.username, body.username))
        .limit(1);
      
      if (existingUser.length > 0) {
        set.status = 409;
        return {
          success: false,
          error: 'Username already exists',
        };
      }
      
      const existingEmail = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, body.email))
        .limit(1);
      
      if (existingEmail.length > 0) {
        set.status = 409;
        return {
          success: false,
          error: 'Email already exists',
        };
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(body.password, 10);
      
      // Create user
      const [user] = await db
        .insert(schema.users)
        .values({
          username: body.username,
          email: body.email,
          password: hashedPassword,
        })
        .returning({
          id: schema.users.id,
          username: schema.users.username,
          email: schema.users.email,
          createdAt: schema.users.createdAt,
        });
      
      // Generate token
      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      
      return {
        success: true,
        user,
        token,
      };
      
    } catch (error) {
      console.error('Registration error:', error);
      set.status = 500;
      return {
        success: false,
        error: error.message || 'Registration failed',
      };
    }
  });
  
  // Login
  app.post('/auth/login', async ({ body, set }) => {
    try {
      if (!body || (!body.username && !body.email) || !body.password) {
        set.status = 400;
        return {
          success: false,
          error: 'Missing required fields: username/email, password',
        };
      }
      
      // Find user by username or email
      const query = body.email 
        ? eq(schema.users.email, body.email) 
        : eq(schema.users.username, body.username);
      
      const [user] = await db
        .select()
        .from(schema.users)
        .where(query)
        .limit(1);
      
      if (!user) {
        set.status = 401;
        return {
          success: false,
          error: 'Invalid credentials',
        };
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(body.password, user.password);
      
      if (!isPasswordValid) {
        set.status = 401;
        return {
          success: false,
          error: 'Invalid credentials',
        };
      }
      
      // Generate token
      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      
      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
        token,
      };
      
    } catch (error) {
      console.error('Login error:', error);
      set.status = 500;
      return {
        success: false,
        error: error.message || 'Login failed',
      };
    }
  });
  
  // Get current user
  app.get('/auth/me', async ({ user, set }) => {
    try {
      if (!user) {
        set.status = 401;
        return {
          success: false,
          error: 'Unauthorized',
        };
      }
      
      // Get user details
      const [userData] = await db
        .select({
          id: schema.users.id,
          username: schema.users.username,
          email: schema.users.email,
          createdAt: schema.users.createdAt,
        })
        .from(schema.users)
        .where(eq(schema.users.id, user.id))
        .limit(1);
      
      if (!userData) {
        set.status = 404;
        return {
          success: false,
          error: 'User not found',
        };
      }
      
      return {
        success: true,
        user: userData,
      };
      
    } catch (error) {
      console.error('Get user error:', error);
      set.status = 500;
      return {
        success: false,
        error: error.message || 'Failed to get user data',
      };
    }
  });
}

/**
 * Verify JWT token
 * 
 * @param token JWT token
 * @returns Decoded token payload
 */
export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: number; username: string };
  } catch (error) {
    throw new Error('Invalid token');
  }
}
