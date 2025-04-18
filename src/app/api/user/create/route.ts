// src/app/api/user/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase/admin';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq, or } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    console.log('/api/user/create: Starting user creation process');
    
    // Parse the request body
    const body = await request.json();
    const { idToken, role } = body;
    
    console.log('/api/user/create: Received raw body:', {
      idToken: idToken ? 'token_present' : 'missing',
      role
    });
    
    console.log('/api/user/create: Destructured values:', { 
      idToken: idToken ? 'token_present' : 'missing', 
      role 
    });
    
    if (!idToken || !role) {
      return NextResponse.json({ 
        error: 'Missing required fields', 
        details: { idToken: !idToken, role: !role } 
      }, { status: 400 });
    }
    
    // Validate role value
    if (!['BRAND', 'INFLUENCER', 'ADMIN'].includes(role)) {
      return NextResponse.json({ 
        error: 'Invalid role specified', 
        validRoles: ['BRAND', 'INFLUENCER', 'ADMIN']
      }, { status: 400 });
    }
    
    // Verify Firebase token
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const email = decodedToken.email || '';
    
    // Check if user already exists in our database - check BOTH uid and email
    const existingUser = await db.select({
      id: users.id,
      email: users.email,
      role: users.role
    })
    .from(users)
    .where(or(eq(users.id, uid), eq(users.email, email)));
    
    const userAlreadyExists = existingUser.length > 0;
    
    console.log('User exists check:', {
      uid,
      email,
      userAlreadyExists,
      existingData: existingUser
    });
    
    // If user exists by either ID or email
    if (userAlreadyExists) {
      const existingRecord = existingUser[0];
      
      // If the user exists by email but with a different ID (this is the problem case)
      if (existingRecord.id !== uid && existingRecord.email === email) {
        console.log('Email already in use with a different UID:', {
          existingId: existingRecord.id,
          newUid: uid,
          email
        });
        
        return NextResponse.json({
          error: 'Email already in use with a different account',
          details: 'This email address is already associated with another account.'
        }, { status: 409 });
      }
      
      // User exists with matching ID - return user data
      return NextResponse.json({
        success: true,
        userId: existingRecord.id,
        email: existingRecord.email,
        role: existingRecord.role,
        requiresOnboarding: true // We'll determine this properly based on profiles later
      });
    }
    
    // Insert new user - email doesn't exist yet and user doesn't exist
    console.log('Attempting to insert new user record:', {
      uid,
      email,
      role
    });
    
    try {
      const insertResult = await db.insert(users)
        .values({
          id: uid,
          email: email,
          // For OAuth users, we set a placeholder password as auth is managed by Firebase
          password: 'FIREBASE_AUTH', 
          role: role
        })
        .returning({
          id: users.id,
          email: users.email,
          role: users.role
        });
      
      console.log('Insert user result:', {
        insertResult,
        insertedCount: insertResult?.length || 0
      });
      
      if (insertResult.length === 0) {
        throw new Error('Failed to insert user record');
      }
      
      // At this point, a newly created user always requires onboarding
      const profileExists = false;
      const requiresOnboarding = true;
      
      console.log('Onboarding determination:', {
        uid,
        userAlreadyExists,
        profileExists,
        requiresOnboarding
      });
      
      return NextResponse.json({
        success: true,
        userId: uid,
        email,
        role,
        requiresOnboarding
      });
    } catch (insertError: any) {
      console.error('Error during user insert:', insertError);
      
      // Try one more time to check if the user was created by someone else during our operation
      const recheckedUser = await db.select({
        id: users.id,
        email: users.email,
        role: users.role
      })
      .from(users)
      .where(or(eq(users.id, uid), eq(users.email, email)));
      
      if (recheckedUser.length > 0) {
        // User was created by someone else in the meantime
        return NextResponse.json({
          success: true,
          userId: recheckedUser[0].id,
          email: recheckedUser[0].email,
          role: recheckedUser[0].role,
          requiresOnboarding: true,
          note: 'User was created by another process'
        });
      }
      
      // Re-throw if still a genuine error
      throw insertError;
    }
    
  } catch (error: any) {
    console.error('Error in user creation:', error);
    
    // Handle Firebase auth errors specifically
    if (error.code?.startsWith('auth/')) {
      return NextResponse.json({ 
        error: 'Authentication error', 
        details: error.code 
      }, { status: 401 });
    }
    
    // Database constraint errors (e.g., unique violation)
    if (error.code === '23505') {
      // Determine which constraint was violated
      const constraintError = error.detail || '';
      if (constraintError.includes('users_email_unique')) {
        return NextResponse.json({ 
          error: 'Email already in use', 
          details: 'This email address is already associated with another account.'
        }, { status: 409 });
      }
      
      return NextResponse.json({ 
        error: 'User record already exists', 
        details: error.detail 
      }, { status: 409 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to create user', 
      details: error.message || 'Unknown error' 
    }, { status: 500 });
  }
}