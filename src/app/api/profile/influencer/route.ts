// src/app/api/profile/influencer/route.ts
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
import { eq, inArray, and, not } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export async function PUT(request: NextRequest) {
  try {
    // Authentication
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
    }
    
    const token = authorization.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;
    
    console.log(`Update influencer profile: Request for user ${userId}`);
    
    // Parse request body
    const data = await request.json();
    const {
      firstName,
      lastName,
      bio,
      location,
      website,
      avatar,
      coverImage,
      niches: nicheNamesInput = [],
      contentTypes: contentTypeNamesInput = []
    } = data;
    
    // Validate inputs
    if (!firstName || !lastName) {
      return NextResponse.json({ 
        error: 'First name and last name are required'
      }, { status: 400 });
    }
    
    if (!Array.isArray(nicheNamesInput) || !Array.isArray(contentTypeNamesInput)) {
      return NextResponse.json({ 
        error: 'Niches and contentTypes must be arrays'
      }, { status: 400 });
    }
    
    // Get current profile
    const currentProfile = await db.query.influencers.findFirst({
      where: eq(influencers.userId, userId),
      with: {
        influencersToNiches: {
          with: {
            niche: true
          }
        },
        influencersToContentTypes: {
          with: {
            contentType: true
          }
        }
      }
    });
    
    if (!currentProfile) {
      return NextResponse.json({ 
        error: 'Influencer profile not found' 
      }, { status: 404 });
    }
    
    console.log(`Update influencer profile: Found profile with ID ${currentProfile.id}`);
    
    // Use transaction to ensure data consistency
    const result = await db.transaction(async (tx) => {
      // 1. Insert new niches if needed
      const nicheInserts = nicheNamesInput
        .filter(name => !currentProfile.influencersToNiches
          .some(n => n.niche.name.toLowerCase() === name.toLowerCase()))
        .map(name => ({
          id: uuidv4(),
          name: name
        }));
      
      if (nicheInserts.length > 0) {
        await tx.insert(niches)
          .values(nicheInserts)
          .onConflictDoNothing({ target: niches.name });
      }
      
      // 2. Insert new content types if needed
      const contentTypeInserts = contentTypeNamesInput
        .filter(name => !currentProfile.influencersToContentTypes
          .some(ct => ct.contentType.name.toLowerCase() === name.toLowerCase()))
        .map(name => ({
          id: uuidv4(),
          name: name
        }));
      
      if (contentTypeInserts.length > 0) {
        await tx.insert(contentTypes)
          .values(contentTypeInserts)
          .onConflictDoNothing({ target: contentTypes.name });
      }
      
      // 3. Get all required niche and content type IDs
      const requiredNicheIds = await tx.select({ 
        id: niches.id,
        name: niches.name
      })
      .from(niches)
      .where(inArray(niches.name, nicheNamesInput));
      
      const requiredContentTypeIds = await tx.select({ 
        id: contentTypes.id,
        name: contentTypes.name
      })
      .from(contentTypes)
      .where(inArray(contentTypes.name, contentTypeNamesInput));
      
      // 4. Update the influencer profile
      await tx.update(influencers)
        .set({
          firstName,
          lastName,
          bio: bio || null,
          location: location || null,
          website: website || null,
          avatar: avatar || null,
          coverImage: coverImage || null,
          updatedAt: new Date()
        })
        .where(eq(influencers.id, currentProfile.id));
      
      // 5. Determine which niches to add/remove
      const currentNicheIds = currentProfile.influencersToNiches.map(n => n.niche.id);
      const requiredNicheIdValues = requiredNicheIds.map(n => n.id);
      const nicheIdsToRemove = currentNicheIds.filter(id => !requiredNicheIdValues.includes(id));
      
      // 6. Remove niches that are no longer selected
      if (nicheIdsToRemove.length > 0) {
        await tx.delete(influencersToNiches)
          .where(
            and(
              eq(influencersToNiches.influencerId, currentProfile.id),
              inArray(influencersToNiches.nicheId, nicheIdsToRemove)
            )
          );
      }
      
      // 7. Add new niches
      const nichesToAdd = requiredNicheIds
        .filter(niche => !currentProfile.influencersToNiches
          .some(n => n.niche.id === niche.id))
        .map(niche => ({
          influencerId: currentProfile.id,
          nicheId: niche.id
        }));
      
      if (nichesToAdd.length > 0) {
        await tx.insert(influencersToNiches)
          .values(nichesToAdd)
          .onConflictDoNothing();
      }
      
      // 8. Do the same for content types
      const currentContentTypeIds = currentProfile.influencersToContentTypes.map(ct => ct.contentType.id);
      const requiredContentTypeIdValues = requiredContentTypeIds.map(ct => ct.id);
      const contentTypeIdsToRemove = currentContentTypeIds.filter(id => 
        !requiredContentTypeIdValues.includes(id));
      
      if (contentTypeIdsToRemove.length > 0) {
        await tx.delete(influencersToContentTypes)
          .where(
            and(
              eq(influencersToContentTypes.influencerId, currentProfile.id),
              inArray(influencersToContentTypes.contentTypeId, contentTypeIdsToRemove)
            )
          );
      }
      
      const contentTypesToAdd = requiredContentTypeIds
        .filter(contentType => !currentProfile.influencersToContentTypes
          .some(ct => ct.contentType.id === contentType.id))
        .map(contentType => ({
          influencerId: currentProfile.id,
          contentTypeId: contentType.id
        }));
      
      if (contentTypesToAdd.length > 0) {
        await tx.insert(influencersToContentTypes)
          .values(contentTypesToAdd)
          .onConflictDoNothing();
      }
      
      // 9. Fetch and return the updated profile
      return await tx.query.influencers.findFirst({
        where: eq(influencers.id, currentProfile.id),
        with: {
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
    });
    
    // Transform data for cleaner response
    const updatedProfile = {
      ...result,
      // Transform niche join table to direct list of niches
      niches: result?.influencersToNiches.map(join => join.niche) || [],
      // Transform content type join table to direct list of content types
      contentTypes: result?.influencersToContentTypes.map(join => join.contentType) || [],
      // Remove join table data from response
      influencersToNiches: undefined,
      influencersToContentTypes: undefined
    };
    
    return NextResponse.json({
      status: 'success',
      message: 'Influencer profile updated successfully',
      profile: updatedProfile
    });
    
  } catch (error: any) {
    console.error('Error updating influencer profile:', error);
    
    // Handle specific error types
    if (error.code?.startsWith('auth/')) {
      return NextResponse.json({ 
        error: 'Authentication error', 
        details: error.code 
      }, { status: 401 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to update influencer profile', 
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}