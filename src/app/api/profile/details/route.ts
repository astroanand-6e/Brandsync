import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuth } from 'firebase-admin/auth';
import '@/lib/firebase/admin'; // Import for side effects (initialization)


export async function GET(request: NextRequest) {
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

    // Find the user to determine their role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, influencer: { select: { id: true } }, brand: { select: { id: true } } }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let profileDetails = null;

    // Fetch profile based on role
    if (user.role === 'INFLUENCER' && user.influencer?.id) {
      profileDetails = await prisma.influencer.findUnique({
        where: { id: user.influencer.id },
        include: {
          niches: { select: { id: true, name: true } }, // Include niche names
          contentTypes: { select: { id: true, name: true } }, // Include content type names
          socialAccounts: true // Include linked social accounts
        },
      });
    } else if (user.role === 'BRAND' && user.brand?.id) {
      profileDetails = await prisma.brand.findUnique({
        where: { id: user.brand.id },
      });
    }

    if (!profileDetails) {
      // This might happen if onboarding wasn't fully completed or data is inconsistent
      return NextResponse.json({ error: 'Profile not found or incomplete' }, { status: 404 });
    }

    return NextResponse.json({ profile: profileDetails, role: user.role });

  } catch (error: any) {
    console.error('Error fetching profile details:', error);
    // Handle specific Firebase auth errors if needed
    if (error.code === 'auth/id-token-expired') {
        return NextResponse.json({ error: 'Authentication token expired' }, { status: 401 });
    }
    if (error.code?.startsWith('auth/')) {
        return NextResponse.json({ error: 'Authentication error' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch profile details' }, { status: 500 });
  }
}