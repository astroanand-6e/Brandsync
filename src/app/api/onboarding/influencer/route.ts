// src/app/api/onboarding/influencer/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase/admin';
import { db } from '@/lib/db';
import {
  users,
  influencers,
  niches,
  contentTypes,
  influencersToNiches,
  influencersToContentTypes
} from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    console.log('Influencer onboarding: Starting profile creation process');
    
    // Authentication
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
    }
    
    const token = authorization.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;
    
    console.log(`Influencer onboarding: Authentication successful for user ${userId}`);
    
    // Parse request data
    const data = await request.json();
    const {
      firstName,
      lastName,
      bio,
      location,
      website,
      niches: nicheNames = [],
      contentTypes: contentTypeNames = []
    } = data;
    
    console.log('Influencer onboarding: Received data:', { 
      userId, 
      firstName, 
      lastName,
      bioLength: bio?.length || 0,
      location: location || 'none',
      nicheCount: nicheNames.length,
      contentTypeCount: contentTypeNames.length
    });
    
    // Data validation
    if (!userId || !firstName || !lastName) {
      return NextResponse.json({ 
        error: 'Missing required fields', 
        details: { userId: !userId, firstName: !firstName, lastName: !lastName }
      }, { status: 400 });
    }
    
    if (!Array.isArray(nicheNames) || !Array.isArray(contentTypeNames)) {
      return NextResponse.json({ 
        error: 'Niches and contentTypes must be arrays'
      }, { status: 400 });
    }
    
    // Check if user exists in our database
    const userExists = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId));
      
    if (userExists.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Check if profile already exists
    const existingProfile = await db
      .select({ id: influencers.id })
      .from(influencers)
      .where(eq(influencers.userId, userId));
      
    if (existingProfile.length > 0) {
      return NextResponse.json({ 
        error: 'Influencer profile already exists',
        profileId: existingProfile[0].id
      }, { status: 409 });
    }
    
    // Use a transaction to ensure data consistency
    const result = await db.transaction(async (tx) => {
      // 1. Create or find niches
      console.log('TRANSACTION: Creating/finding niches');
      const nicheInserts = nicheNames.map(name => ({
        id: uuidv4(),
        name: name
      }));
      
      if (nicheInserts.length > 0) {
        await tx.insert(niches)
          .values(nicheInserts)
          .onConflictDoNothing({ target: niches.name });
      }
      
      // 2. Create or find content types
      console.log('TRANSACTION: Creating/finding content types');
      const contentTypeInserts = contentTypeNames.map(name => ({
        id: uuidv4(),
        name: name
      }));
      
      if (contentTypeInserts.length > 0) {
        await tx.insert(contentTypes)
          .values(contentTypeInserts)
          .onConflictDoNothing({ target: contentTypes.name });
      }
      
      // 3. Fetch IDs for niches and content types
      const nicheIds = nicheNames.length === 0 ? [] : 
        await tx.select({ id: niches.id, name: niches.name })
          .from(niches)
          .where(inArray(niches.name, nicheNames));
      
      const contentTypeIds = contentTypeNames.length === 0 ? [] : 
        await tx.select({ id: contentTypes.id, name: contentTypes.name })
          .from(contentTypes)
          .where(inArray(contentTypes.name, contentTypeNames));
      
      // 4. Create influencer profile
      console.log('TRANSACTION: Creating influencer profile');
      const influencerId = uuidv4();
      
      const insertedInfluencer = await tx.insert(influencers)
        .values({
          id: influencerId,
          userId,
          firstName,
          lastName,
          bio: bio || null,
          location: location || null,
          website: website || null
        })
        .returning({
          id: influencers.id,
          firstName: influencers.firstName,
          lastName: influencers.lastName
        });
      
      if (insertedInfluencer.length === 0) {
        throw new Error('Failed to create influencer profile');
      }
      
      // 5. Link niches
      console.log('TRANSACTION: Linking niches');
      const nicheLinks = nicheIds.map(niche => ({
        influencerId,
        nicheId: niche.id
      }));
      
      if (nicheLinks.length > 0) {
        await tx.insert(influencersToNiches)
          .values(nicheLinks);
      }
      
      // 6. Link content types
      console.log('TRANSACTION: Linking content types');
      const contentTypeLinks = contentTypeIds.map(type => ({
        influencerId,
        contentTypeId: type.id
      }));
      
      if (contentTypeLinks.length > 0) {
        await tx.insert(influencersToContentTypes)
          .values(contentTypeLinks);
      }
      
      // Return the results
      return {
        profileId: influencerId,
        nicheCount: nicheLinks.length,
        contentTypeCount: contentTypeLinks.length,
        niches: nicheIds,
        contentTypes: contentTypeIds
      };
    });
    
    console.log('Influencer onboarding complete:', {
      profileId: result.profileId,
      nicheCount: result.nicheCount,
      contentTypeCount: result.contentTypeCount
    });
    
    return NextResponse.json({
      status: 'success',
      message: 'Influencer profile created successfully',
      profileId: result.profileId,
      niches: result.niches,
      contentTypes: result.contentTypes
    });
    
  } catch (error: any) {
    console.error('Error in influencer onboarding:', error);
    
    // Handle specific error types
    if (error.code?.startsWith('auth/')) {
      return NextResponse.json({ 
        error: 'Authentication error', 
        details: error.code 
      }, { status: 401 });
    }
    
    // Database foreign key violation
    if (error.code === '23503') {
      return NextResponse.json({ 
        error: 'User not found or invalid data', 
        details: error.detail 
      }, { status: 400 });
    }
    
    // Database unique constraint violation
    if (error.code === '23505') {
      return NextResponse.json({ 
        error: 'Influencer profile already exists', 
        details: error.detail 
      }, { status: 409 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to create influencer profile', 
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}