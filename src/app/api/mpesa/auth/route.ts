import { NextResponse } from 'next/server';
import { MpesaService } from '@/lib/services/mpesa';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const mpesaService = MpesaService.getInstance();
    const token = await mpesaService.getAccessToken();

    if (!token) {
      return NextResponse.json(
        { error: 'Failed to get M-Pesa access token' },
        { status: 500 }
      );
    }

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error in M-Pesa auth route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 