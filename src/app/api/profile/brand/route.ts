import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase/admin';
import { db } from '@/lib/db';
import { brands } from '@/db/schema';
import { eq } from 'drizzle-orm';

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
    
    console.log(`Update brand profile: Request for user ${userId}`);
    
    // Parse request body
    const data = await request.json();
    const {
      companyName,
      industry,
      description,
      website,
      logo,
      coverImage,
      verificationDoc
    } = data;
    
    // Basic validation
    if (!companyName || !industry) {
      return NextResponse.json({ 
        error: 'Company name and industry are required'
      }, { status: 400 });
    }
    
    // Check if profile exists
    const currentProfile = await db.query.brands.findFirst({
      where: eq(brands.userId, userId)
    });
    
    if (!currentProfile) {
      return NextResponse.json({ 
        error: 'Brand profile not found' 
      }, { status: 404 });
    }
    
    console.log(`Update brand profile: Found profile with ID ${currentProfile.id}`);
    
    // Update the brand profile
    const updatedBrand = await db.update(brands)
      .set({
        companyName,
        industry,
        description: description || null,
        website: website || null,
        logo: logo || null,
        coverImage: coverImage || null,
        verificationDoc: verificationDoc || null,
        updatedAt: new Date()
      })
      .where(eq(brands.id, currentProfile.id))
      .returning();
    
    if (!updatedBrand || updatedBrand.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to update brand profile' 
      }, { status: 500 });
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'Brand profile updated successfully',
      profile: updatedBrand[0]
    });
    
  } catch (error: any) {
    console.error('Error updating brand profile:', error);
    
    // Handle specific error types
    if (error.code?.startsWith('auth/')) {
      return NextResponse.json({ 
        error: 'Authentication error', 
        details: error.code 
      }, { status: 401 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to update brand profile', 
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}