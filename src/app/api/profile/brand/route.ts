import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuth } from 'firebase-admin/auth';
import '@/lib/firebase/admin'; // Import for side effects (initialization)

export async function PUT(request: NextRequest) {
  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authorization.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const {
      companyName,
      industry,
      description,
      website,
      logo, // Expecting URL string
      coverImage, // Expecting URL string
      verificationDoc // Expecting URL string for now
      // isVerified is likely managed by an admin process, not directly by the user
    } = data;

    // Validate required fields
    if (!companyName || !industry) {
      return NextResponse.json(
        { error: 'Company name and industry are required' },
        { status: 400 }
      );
    }

    // Find the brand profile linked to the user
    const brand = await prisma.brand.findFirst({
      where: { userId: userId },
    });

    if (!brand) {
      return NextResponse.json(
        { error: 'Brand profile not found' },
        { status: 404 }
      );
    }

    // Update the brand profile
    const updatedBrand = await prisma.brand.update({
      where: { id: brand.id },
      data: {
        companyName,
        industry,
        description: description ?? brand.description,
        website: website ?? brand.website,
        logo: logo ?? brand.logo, // Update URL
        coverImage: coverImage ?? brand.coverImage, // Update URL
        verificationDoc: verificationDoc ?? brand.verificationDoc // Update URL
        // Do not allow user to set isVerified directly
      },
    });

    return NextResponse.json({
      status: 'success',
      message: 'Brand profile updated successfully',
      profile: updatedBrand
    });

  } catch (error: any) {
    console.error('Error updating brand profile:', error);
     if (error.code === 'auth/id-token-expired') {
        return NextResponse.json({ error: 'Authentication token expired' }, { status: 401 });
    }
    if (error.code?.startsWith('auth/')) {
        return NextResponse.json({ error: 'Authentication error' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to update brand profile' }, { status: 500 });
  }
}