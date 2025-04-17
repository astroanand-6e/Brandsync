import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { 
      userId, 
      companyName, 
      industry, 
      description, 
      website 
    } = data;

    // Validate required fields
    if (!userId || !companyName || !industry) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the user to make sure they exist
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create the brand profile
    const brand = await prisma.brand.create({
      data: {
        userId,
        companyName,
        industry,
        description: description || '',
        website: website || '',
      },
    });

    return NextResponse.json({
      status: 'success',
      message: 'Brand profile created successfully',
      profileId: brand.id
    });

  } catch (error) {
    console.error('Error creating brand profile:', error);
    return NextResponse.json(
      { error: 'Failed to create brand profile' },
      { status: 500 }
    );
  }
}