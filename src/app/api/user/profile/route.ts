import { NextRequest, NextResponse } from 'next/server';
import { getUserProfile } from '@/lib/helpers/user-onboarding';
import { auth } from '@/lib/firebase/admin';
// Removed FirebaseUser import to avoid server-side import issues

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing Bearer token' }, { status: 401 });
    }

    const token = authorization.split('Bearer ')[1];
    
    try {
      const decodedToken = await auth.verifyIdToken(token);
      const uid = decodedToken.uid;
      
      // Create a simpler object with just the properties needed by getUserProfile
      // Instead of trying to mock the entire FirebaseUser interface
      const userInfo = { 
        uid, 
        email: decodedToken.email || null,
        displayName: decodedToken.name || null,
        photoURL: decodedToken.picture || null,
        emailVerified: decodedToken.email_verified || false
      };
      
      console.log('Fetching user profile for:', { uid, email: decodedToken.email });
      
      // Retrieve user profile safely
      let userProfile = null;
      try {
        userProfile = await getUserProfile(userInfo as any);
      } catch (profileError) {
        console.error('Error retrieving user profile:', profileError);
        // Return null profile to client instead of internal error
        return NextResponse.json(null);
      }
      // Return profile object (may be null if not found)
      return NextResponse.json(userProfile);
      
    } catch (tokenError: any) {
      console.error('Token verification error:', tokenError);
      return NextResponse.json({ 
        error: 'Authentication error', 
        details: tokenError.code || tokenError.message 
      }, { status: 401 });
    }
  } catch (error: any) {
    console.error('API Error fetching user profile:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}
