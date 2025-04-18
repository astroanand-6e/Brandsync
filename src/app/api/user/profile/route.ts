// src/app/api/user/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase/admin';
import { db } from '@/lib/db';
import { users, brands, influencers } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Helper function for database operations with retry
async function withRetry<T>(operation: () => Promise<T>, retries = 3, delay = 500): Promise<T> {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      console.log(`Database operation failed, attempt ${i + 1}/${retries}:`, error.message);
      lastError = error;
      
      // Don't wait on the last attempt
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
        // Increase delay for next retry (exponential backoff)
        delay *= 2;
      }
    }
  }
  throw lastError;
}

export async function GET(request: NextRequest) {
  try {
    // Validate authorization header
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
    }

    const token = authorization.split('Bearer ')[1];
    
    // Verify Firebase token
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;
    const email = decodedToken.email || '';
    
    console.log('User Profile API: Fetching user profile for:', { uid, email });
    
    // Query for user data with profile information - with retry logic
    const userData = await withRetry(async () => {
      return db
        .select({
          id: users.id,
          email: users.email,
          role: users.role
        })
        .from(users)
        .where(eq(users.id, uid))
        .limit(1);
    });
    
    if (userData.length === 0) {
      console.log(`User Profile API: User with uid ${uid} found in Firebase but not in DB.`);
      return NextResponse.json(null);
    }
    
    const user = userData[0];
    
    // Now check for profile data based on role - with retry logic
    let hasCompletedOnboarding = false;
    let profileId = null;
    
    if (user.role === 'BRAND') {
      const brandData = await withRetry(async () => {
        return db
          .select({ id: brands.id })
          .from(brands)
          .where(eq(brands.userId, uid))
          .limit(1);
      });
        
      if (brandData.length > 0) {
        hasCompletedOnboarding = true;
        profileId = brandData[0].id;
      }
    } 
    else if (user.role === 'INFLUENCER') {
      const influencerData = await withRetry(async () => {
        return db
          .select({ id: influencers.id })
          .from(influencers)
          .where(eq(influencers.userId, uid))
          .limit(1);
      });
        
      if (influencerData.length > 0) {
        hasCompletedOnboarding = true;
        profileId = influencerData[0].id;
      }
    }
    else if (user.role === 'ADMIN') {
      // For admin users, we don't need profile data
      hasCompletedOnboarding = true;
    }
    
    // Construct response
    const profileResponse = {
      id: user.id,
      email: user.email,
      role: user.role,
      hasCompletedOnboarding,
      profileId,
      brandId: user.role === 'BRAND' ? profileId : null,
      influencerId: user.role === 'INFLUENCER' ? profileId : null
    };
    
    console.log('User Profile API: Returning profile:', {
      id: profileResponse.id,
      role: profileResponse.role,
      hasCompletedOnboarding: profileResponse.hasCompletedOnboarding,
      profileId: profileResponse.profileId || 'null'
    });
    
    return NextResponse.json(profileResponse);
    
  } catch (error: any) {
    console.error('Error in user profile API:', error);
    
    // Handle connection timeouts specifically
    if (error.code === 'CONNECT_TIMEOUT') {
      return NextResponse.json({ 
        error: 'Database connection timeout', 
        details: 'Failed to connect to the database. Please try again later.'
      }, { status: 503 }); // 503 Service Unavailable
    }
    
    // Handle Firebase auth errors
    if (error.code?.startsWith('auth/')) {
      return NextResponse.json({ 
        error: 'Authentication error', 
        details: error.code 
      }, { status: 401 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to fetch user profile', 
      details: error.message || 'Unknown error' 
    }, { status: 500 });
  }
}