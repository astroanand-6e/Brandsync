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
      firstName,
      lastName,
      bio,
      location,
      website,
      avatar, // Expecting URL string
      coverImage, // Expecting URL string
      niches, // Expecting array of niche names (strings)
      contentTypes // Expecting array of content type names (strings)
    } = data;

    // Validate required fields
    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      );
    }

    // Find the influencer profile linked to the user
    const influencer = await prisma.influencer.findFirst({
      where: { userId: userId },
      include: { // Include current relations to manage disconnects
        niches: { select: { id: true, name: true } },
        contentTypes: { select: { id: true, name: true } },
      }
    });

    if (!influencer) {
      return NextResponse.json(
        { error: 'Influencer profile not found' },
        { status: 404 }
      );
    }

    // --- Handle Niches ---
    // Define interfaces for better typing
    interface NicheWithIdAndName {
      id: string;
      name: string;
    }
    
    interface ContentTypeWithIdAndName {
      id: string;
      name: string;
    }
    
    const currentNicheNames: string[] = influencer.niches.map((n: NicheWithIdAndName) => n.name);
    const nichesToConnect: { id: string }[] = [];
    const nichesToDisconnect: { id: string }[] = [];
    const nicheNamesToCreate: string[] = [];

    // Find niches to connect/create
    if (niches && Array.isArray(niches)) {
        for (const nicheName of niches) {
            if (!currentNicheNames.includes(nicheName)) {
                const existingNiche = await prisma.niche.findFirst({ where: { name: nicheName } });
                if (existingNiche) {
                    nichesToConnect.push({ id: existingNiche.id });
                } else {
                    nicheNamesToCreate.push(nicheName); // Mark for creation
                }
            }
        }
        // Find niches to disconnect
        for (const currentNiche of influencer.niches) {
            if (!niches.includes(currentNiche.name)) {
                nichesToDisconnect.push({ id: currentNiche.id });
            }
        }
    }

    // --- Handle Content Types ---
    const currentContentTypeNames: string[] = influencer.contentTypes.map((ct: ContentTypeWithIdAndName) => ct.name);
    const contentTypesToConnect: { id: string }[] = [];
    const contentTypesToDisconnect: { id: string }[] = [];
    const contentTypeNamesToCreate: string[] = [];

    // Find content types to connect/create
    if (contentTypes && Array.isArray(contentTypes)) {
        for (const typeName of contentTypes) {
            if (!currentContentTypeNames.includes(typeName)) {
                const existingType = await prisma.contentType.findFirst({ where: { name: typeName } });
                if (existingType) {
                    contentTypesToConnect.push({ id: existingType.id });
                } else {
                    contentTypeNamesToCreate.push(typeName); // Mark for creation
                }
            }
        }
        // Find content types to disconnect
        for (const currentType of influencer.contentTypes) {
            if (!contentTypes.includes(currentType.name)) {
                contentTypesToDisconnect.push({ id: currentType.id });
            }
        }
    }

    // --- Perform Update ---
    // Use transaction to ensure atomicity, especially with create/connect/disconnect
    // Define interfaces for better typing
    interface NicheCreate {
      name: string;
    }

    interface ContentTypeCreate {
      name: string;
    }

    interface NicheConnect {
      id: string;
    }

    interface ContentTypeConnect {
      id: string;
    }

    interface UpdatedInfluencer {
      id: string;
      firstName: string;
      lastName: string;
      bio: string | null;
      location: string | null;
      website: string | null;
      avatar: string | null;
      coverImage: string | null;
      niches: NicheWithIdAndName[];
      contentTypes: ContentTypeWithIdAndName[];
      socialAccounts: any[]; // Using any here to match existing return type
    }

    const updatedInfluencer: UpdatedInfluencer = await prisma.$transaction(async (tx: typeof prisma) => {
        // 1. Create any new niches
        if (nicheNamesToCreate.length > 0) {
            await tx.niche.createMany({
                data: nicheNamesToCreate.map((name: string): NicheCreate => ({ name })),
                skipDuplicates: true, // In case of race conditions
            });
            // Fetch the newly created niches to get their IDs
            const newlyCreatedNiches: NicheConnect[] = await tx.niche.findMany({
                where: { name: { in: nicheNamesToCreate } },
                select: { id: true }
            });
            nichesToConnect.push(...newlyCreatedNiches);
        }

        // 2. Create any new content types
        if (contentTypeNamesToCreate.length > 0) {
            await tx.contentType.createMany({
                data: contentTypeNamesToCreate.map((name: string): ContentTypeCreate => ({ name })),
                skipDuplicates: true,
            });
            const newlyCreatedTypes: ContentTypeConnect[] = await tx.contentType.findMany({
                where: { name: { in: contentTypeNamesToCreate } },
                select: { id: true }
            });
            contentTypesToConnect.push(...newlyCreatedTypes);
        }

        // 3. Update the influencer profile with connections/disconnections
        return await tx.influencer.update({
            where: { id: influencer.id },
            data: {
                firstName,
                lastName,
                bio: bio ?? influencer.bio, // Use existing if not provided
                location: location ?? influencer.location,
                website: website ?? influencer.website,
                avatar: avatar ?? influencer.avatar, // Update URL
                coverImage: coverImage ?? influencer.coverImage, // Update URL
                niches: {
                    connect: nichesToConnect,
                    disconnect: nichesToDisconnect,
                },
                contentTypes: {
                    connect: contentTypesToConnect,
                    disconnect: contentTypesToDisconnect,
                },
            },
            include: {
                niches: { select: { id: true, name: true } },
                contentTypes: { select: { id: true, name: true } },
                socialAccounts: true
            }
        });
    });

    return NextResponse.json({
      status: 'success',
      message: 'Influencer profile updated successfully',
      profile: updatedInfluencer
    });

  } catch (error: any) {
    console.error('Error updating influencer profile:', error);
     if (error.code === 'auth/id-token-expired') {
        return NextResponse.json({ error: 'Authentication token expired' }, { status: 401 });
    }
    if (error.code?.startsWith('auth/')) {
        return NextResponse.json({ error: 'Authentication error' }, { status: 401 });
    }
    // Handle potential Prisma errors
    return NextResponse.json({ error: 'Failed to update influencer profile' }, { status: 500 });
  }
}