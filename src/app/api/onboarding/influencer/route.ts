import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { 
      userId, 
      firstName, 
      lastName, 
      bio, 
      location, 
      website,
      niches,
      contentTypes
    } = data;

    // Validate required fields
    if (!userId || !firstName || !lastName) {
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

    // First create the influencer profile
    const influencer = await prisma.influencer.create({
      data: {
        userId,
        firstName,
        lastName,
        bio: bio || '',
        location: location || '',
        website: website || '',
      },
    });

    // Process niches if provided
    if (niches && niches.length > 0) {
      for (const nicheName of niches) {
        // Find or create the niche
        let niche = await prisma.niche.findUnique({
          where: { name: nicheName },
        });

        if (!niche) {
          niche = await prisma.niche.create({
            data: { name: nicheName },
          });
        }

        // Connect the niche to the influencer
        await prisma.influencer.update({
          where: { id: influencer.id },
          data: {
            niches: {
              connect: { id: niche.id }
            }
          }
        });
      }
    }

    // Process content types if provided
    if (contentTypes && contentTypes.length > 0) {
      for (const typeName of contentTypes) {
        // Find or create the content type
        let contentType = await prisma.contentType.findUnique({
          where: { name: typeName },
        });

        if (!contentType) {
          contentType = await prisma.contentType.create({
            data: { name: typeName },
          });
        }

        // Connect the content type to the influencer
        await prisma.influencer.update({
          where: { id: influencer.id },
          data: {
            contentTypes: {
              connect: { id: contentType.id }
            }
          }
        });
      }
    }

    return NextResponse.json({
      status: 'success',
      message: 'Influencer profile created successfully',
      profileId: influencer.id
    });

  } catch (error) {
    console.error('Error creating influencer profile:', error);
    return NextResponse.json(
      { error: 'Failed to create influencer profile' },
      { status: 500 }
    );
  }
}