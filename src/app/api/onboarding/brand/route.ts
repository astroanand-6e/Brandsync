import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase/admin';
import { db } from '@/lib/db';
import { users, brands } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    console.log('Brand onboarding: Starting profile creation process');
    
    // Authentication
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
    }
    
    const token = authorization.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;
    
    console.log(`Brand onboarding: Authentication successful for user ${userId}`);
    
    // Parse request data
    const data = await request.json();
    const {
      companyName,
      industry,
      description,
      website
    } = data;
    
    console.log('Brand onboarding: Received data:', { 
      userId, 
      companyName, 
      industry,
      descriptionLength: description?.length || 0,
      website: website || 'none'
    });
    
    // Data validation
    if (!userId || !companyName || !industry) {
      return NextResponse.json({ 
        error: 'Missing required fields', 
        details: { userId: !userId, companyName: !companyName, industry: !industry }
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
      .select({ id: brands.id })
      .from(brands)
      .where(eq(brands.userId, userId));
      
    if (existingProfile.length > 0) {
      return NextResponse.json({ 
        error: 'Brand profile already exists',
        profileId: existingProfile[0].id
      }, { status: 409 });
    }
    
    // Create new brand profile
    const brandId = uuidv4();
    
    const insertedBrand = await db.insert(brands)
      .values({
        id: brandId,
        userId,
        companyName,
        industry,
        description: description || null,
        website: website || null
      })
      .returning({
        id: brands.id,
        companyName: brands.companyName,
        industry: brands.industry
      });
    
    if (insertedBrand.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to create brand profile'
      }, { status: 500 });
    }
    
    console.log('Brand onboarding complete:', {
      profileId: brandId,
      companyName,
      industry
    });
    
    return NextResponse.json({
      status: 'success',
      message: 'Brand profile created successfully',
      profileId: brandId,
      companyName,
      industry
    });
    
  } catch (error: any) {
    console.error('Error in brand onboarding:', error);
    
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
        error: 'Brand profile already exists', 
        details: error.detail 
      }, { status: 409 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to create brand profile', 
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}