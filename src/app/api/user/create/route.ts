import { NextRequest, NextResponse } from 'next/server';
import { createUserRecord } from '@/lib/helpers/user-onboarding';
import { auth } from '@/lib/firebase/admin';
import { UserRole } from '@/generated/prisma';
import { User } from 'firebase/auth';

export async function POST(request: NextRequest) {
  try {
    const { idToken, role } = await request.json();
    
    if (!idToken || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Verify the token
    const decodedToken = await auth.verifyIdToken(idToken);
    // Create a Firebase user object with required User properties
    const firebaseUser = {
      uid: decodedToken.uid,
      email: decodedToken.email || null,
      displayName: decodedToken.name || null,
      photoURL: decodedToken.picture || null,
      emailVerified: decodedToken.email_verified || false,
      isAnonymous: false,
      phoneNumber: null,
      providerId: 'firebase',
      metadata: {},
      providerData: [],
      refreshToken: '',
      tenantId: null,
      delete: async () => {},
      getIdToken: async () => '',
      getIdTokenResult: async () => ({ claims: {}, expirationTime: '', issuedAtTime: '', authTime: '', signInProvider: null, signInSecondFactor: null, token: '' }),
      reload: async () => {},
      toJSON: () => ({})
    } as User;
    
    // Determine the correct role enum value
    let userRole: UserRole;
    if (role === 'BRAND') {
      userRole = UserRole.BRAND;
    } else if (role === 'INFLUENCER') {
      userRole = UserRole.INFLUENCER;
    } else {
      return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 });
    }

    // Create user in the database
    const userId = await createUserRecord(firebaseUser, userRole);
    
    if (!userId) {
      return NextResponse.json({ error: 'Failed to create user record' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      userId, 
      requiresOnboarding: true
    });
    
  } catch (error: any) {
    console.error('Error creating user record:', error);
    
    // Provide more detailed error information
    const errorMessage = error.message || 'Unknown error';
    
    // Check for duplicate user errors
    if (errorMessage.includes('Unique constraint failed')) {
      // User likely already exists, which might not be an error in some cases
      // Client should handle this appropriately
      return NextResponse.json({ 
        error: 'User already exists',
        details: 'A user with this ID or email already exists in the database'
      }, { status: 409 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to create user record', 
      details: errorMessage
    }, { status: 500 });
  }
}
