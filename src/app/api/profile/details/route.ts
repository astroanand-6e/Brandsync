// src/app/api/profile/details/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase/admin';
import { db } from '@/lib/db';
import { 
  users, 
  brands, 
  influencers, 
  niches, 
  contentTypes,
  influencersToNiches,
  influencersToContentTypes,
  socialAccounts 
} from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Authentication
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
    }
    
    const token = authorization.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;
    
    console.log(`Profile details: Fetching for user ${userId}`);
    
    // Get user data to determine role
    const userResult = await db.select({
      id: users.id,
      email: users.email,
      role: users.role
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
    
    if (userResult.length === 0) {
      return NextResponse.json({ error: 'User profile not found in database' }, { status: 404 });
    }
    
    const user = userResult[0];
    console.log(`Profile details: User found with role ${user.role}`);
    
    let profileDetails = null;
    let hasCompletedOnboarding = false;
    let profileId = null;
    
    // Fetch specific profile data based on role
    if (user.role === 'INFLUENCER') {
      console.log(`Profile details: Fetching influencer profile for user ${userId}`);
      
      // Query for influencer data
      const influencerData = await db.query.influencers.findFirst({
        where: eq(influencers.userId, userId),
        with: {
          // Include related data
          influencersToNiches: {
            with: {
              niche: true
            }
          },
          influencersToContentTypes: {
            with: {
              contentType: true
            }
          },
          socialAccounts: true
        }
      });
      
      if (influencerData) {
        hasCompletedOnboarding = true;
        profileId = influencerData.id;
        
        // Transform data for cleaner response
        profileDetails = {
          ...influencerData,
          // Transform niche join table to direct list of niches
          niches: influencerData.influencersToNiches.map(join => join.niche),
          // Transform content type join table to direct list of content types
          contentTypes: influencerData.influencersToContentTypes.map(join => join.contentType),
          // Remove join table data from response
          influencersToNiches: undefined,
          influencersToContentTypes: undefined
        };
        
        console.log(`Profile details: Influencer profile found with ID ${profileId}`);
      } else {
        console.log(`Profile details: No influencer profile found for user ${userId}`);
      }
    } 
    else if (user.role === 'BRAND') {
      console.log(`Profile details: Fetching brand profile for user ${userId}`);
      
      // Query for brand data
      const brandData = await db.query.brands.findFirst({
        where: eq(brands.userId, userId)
      });
      
      if (brandData) {
        hasCompletedOnboarding = true;
        profileId = brandData.id;
        profileDetails = brandData;
        console.log(`Profile details: Brand profile found with ID ${profileId}`);
      } else {
        console.log(`Profile details: No brand profile found for user ${userId}`);
      }
    } 
    else {
      // Handle admin or other role types if needed
      console.log(`Profile details: User has role ${user.role}, no specific profile needed`);
      hasCompletedOnboarding = true; // Admins don't need onboarding
    }
    
    // Construct response object
    const responsePayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      hasCompletedOnboarding,
      profileId,
      profile: profileDetails
    };
    
    return NextResponse.json(responsePayload);
    
  } catch (error: any) {
    console.error('Error in profile details:', error);
    
    // Handle auth errors
    if (error.code?.startsWith('auth/')) {
      return NextResponse.json({ 
        error: 'Authentication error', 
        details: error.code 
      }, { status: 401 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to fetch profile details', 
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}