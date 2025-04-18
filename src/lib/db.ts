import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/db/schema'; // We'll create this next
import 'dotenv/config';
import { users, wallets } from '@/db/schema';
import { eq, or } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set.');
}

// Configure Postgres with more robust connection options
const queryClient = postgres(process.env.DATABASE_URL, {
  max: 10, // Maximum number of connections
  idle_timeout: 20, // Max seconds to keep an unused connection
  connect_timeout: 30, // Timeout in seconds for establishing a connection
  max_lifetime: 60 * 30, // Max lifetime of a connection in seconds
  ssl: true, // Enable SSL for Neon database
  debug: process.env.NODE_ENV === 'development', // Print debug info in development
});

export const db = drizzle(queryClient, { schema });

// If needed separately for migrations (which often run in Node)
// export const migrationClient = postgres(process.env.DATABASE_URL, { max: 1 });
// export const migrationDb = drizzle(migrationClient, { schema });

/**
 * Create a new user record in the database along with an associated wallet
 * @param userId - Firebase user ID
 * @param email - User's email
 * @param password - Password (or placeholder for OAuth users)
 * @param role - User role (BRAND, INFLUENCER, or ADMIN)
 * @returns The newly created user record, or throws an error if creation fails
 */
export const createUser = async (
  userId: string,
  email: string,
  password: string,
  role: 'BRAND' | 'INFLUENCER' | 'ADMIN'
) => {
  try {
    console.log('Creating user:', { userId, email, role });

    // Check if user already exists by ID or email
    const existingUser = await db.select({
      id: users.id,
      email: users.email,
      role: users.role,
      walletId: users.walletId
    })
    .from(users)
    .where(or(eq(users.id, userId), eq(users.email, email)));
    
    if (existingUser.length > 0) {
      const existing = existingUser[0];
      
      // If the user exists with a different ID but same email
      if (existing.id !== userId && existing.email === email) {
        throw new Error('Email already associated with another account');
      }
      
      // If user exists with same ID, return the existing user
      return existing;
    }
    
    // Generate a unique wallet ID
    const walletId = uuidv4();
    
    // Start a transaction to ensure both user and wallet are created atomically
    return await db.transaction(async (tx) => {
      // Insert wallet first
      const insertedWallet = await tx.insert(wallets)
        .values({
          id: walletId,
          userId: userId, // Reference to the user we're about to create
          balance: 0.0,
          currency: 'USD'
        })
        .returning({
          id: wallets.id
        });
      
      if (!insertedWallet || insertedWallet.length === 0) {
        throw new Error('Failed to create wallet record');
      }
      
      // Insert user with wallet reference
      const insertedUser = await tx.insert(users)
        .values({
          id: userId,
          email: email,
          password: password, // Should be hashed if it's a real password
          role: role,
          walletId: walletId
        })
        .returning({
          id: users.id,
          email: users.email,
          role: users.role,
          walletId: users.walletId,
          createdAt: users.createdAt
        });
      
      if (!insertedUser || insertedUser.length === 0) {
        throw new Error('Failed to create user record');
      }
      
      return insertedUser[0];
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Check if a user exists in the database
 * @param userId - Firebase user ID
 * @returns User record if found, null otherwise
 */
export const getUserById = async (userId: string) => {
  try {
    const userData = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        walletId: users.walletId
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
      
    return userData.length > 0 ? userData[0] : null;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
  }
};


