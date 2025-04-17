import { prisma } from '@/lib/prisma';
import { User as FirebaseUser } from 'firebase/auth';
import { UserRole } from '@/generated/prisma';

export interface UserProfile {
  hasCompletedOnboarding: boolean;
  role: UserRole;
  id: string;
  brandId?: string | null;
  influencerId?: string | null;
}

/**
 * Check if a user exists in the database and has completed onboarding
 * This function accepts any object with a uid property
 */
export const getUserProfile = async (firebaseUser: {uid: string} | FirebaseUser | null): Promise<UserProfile | null> => {
  if (!firebaseUser || !firebaseUser.uid) return null;
  
  try {
    console.log(`Looking up user with ID: ${firebaseUser.uid}`);
    
    // Find user by Firebase UID
    const user = await prisma.user.findUnique({
      where: { id: firebaseUser.uid },
      include: {
        brand: { select: { id: true } },
        influencer: { select: { id: true } },
      }
    });

    // If user record doesn't exist in DB at all
    if (!user) {
      console.log(`User profile not found in DB for UID: ${firebaseUser.uid}`);
      return null;
    }
    
    // Determine if onboarding is complete based on role and related profile
    const hasCompletedOnboarding = user.role === UserRole.BRAND 
      ? !!user.brand // Onboarding complete if brand relation exists
      : !!user.influencer; // Onboarding complete if influencer relation exists
    
    // Return the profile object
    return {
      hasCompletedOnboarding,
      role: user.role,
      id: user.id,
      brandId: user.brand?.id || null,
      influencerId: user.influencer?.id || null,
    };
  } catch (error: any) {
    console.error(`Error in getUserProfile for UID ${firebaseUser.uid}:`, error);
    throw error; // Re-throw to be handled by the API route
  }
};

/**
 * Create a basic user record for a new signup
 */
export const createUserRecord = async (
  firebaseUser: FirebaseUser,
  role: UserRole
): Promise<string | null> => {
  try {
    console.log(`Creating user record for UID: ${firebaseUser.uid}, Role: ${role}`);
    
    // First, check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: firebaseUser.uid },
    });
    
    if (existingUser) {
      console.log(`User already exists with ID: ${firebaseUser.uid}`);
      return existingUser.id; // Return existing user ID
    }
    
    // Create new user record
    const user = await prisma.user.create({
      data: {
        id: firebaseUser.uid,
        email: firebaseUser.email as string,
        password: '', // Firebase handles auth
        role: role,
      },
    });
    
    console.log(`User created with ID: ${user.id}`);
    return user.id;
  } catch (error: any) {
    console.error(`Error in createUserRecord for UID ${firebaseUser.uid}:`, error);
    throw error; // Re-throw to be handled by the API route
  }
};